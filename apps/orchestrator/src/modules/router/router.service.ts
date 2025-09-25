import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { BusEnvelope, Topics } from '@saas/shared-kafka';
import { KafkaProducerService } from '../kafka/kafka.producer';
import { MongoService } from '../db/mongo.service';
import type { Document, Filter, UpdateFilter } from 'mongodb';
import { IdempotencyService } from '../idempotency/idempotency.service';

@Injectable()
export class RouterService {
  private readonly logger = new Logger(RouterService.name);

  constructor(
    @Inject(forwardRef(() => KafkaProducerService))
    private readonly producer: KafkaProducerService,
    private readonly mongo: MongoService,
    private readonly idem: IdempotencyService
  ) { }

  // idem por etapa (evita reenvio do mesmo comando para o mesmo pedido/etapa)
  private async guardStep(orderId: string, step: string, ttl = 600): Promise<boolean> {
    return this.idem.setOnce(`saga:step:${orderId}:${step}`, ttl);
  }

  async route(msg: BusEnvelope<any>) {
    const type = msg.type;
    const payload: any = msg.payload || {};
    const orderId = payload.orderId ?? msg.aggregateId;

    switch (type) {
      case 'OrderPlaced': {
        if (!(await this.guardStep(orderId, 'Inventory.Reserve'))) return;
        await this.producer.send(Topics.InventoryCommands.Reserve, [{
          key: orderId,
          value: JSON.stringify({
            type: 'ReserveInventory',
            aggregate: 'Inventory',
            aggregateId: orderId,
            payload: { orderId, items: payload.items },
            createdAt: new Date().toISOString(),
          }),
        }]);
        await this.pushTimeline(orderId, 'OrderPlaced', payload);
        break;
      }

      case 'InventoryReserved': {
        if (!(await this.guardStep(orderId, 'Payment.Authorize'))) return;
        const amount = (payload.items ?? []).reduce((acc: number, it: any) => {
          const itemTotal = it?.total ?? ((it?.unitPrice ?? 0) * (it?.quantity ?? 0));
          return acc + Number(itemTotal);
        }, 0);

        await this.producer.send(Topics.PaymentCommands.Authorize, [{
          key: orderId,
          value: JSON.stringify({
            type: 'AuthorizePayment',
            aggregate: 'Payment',
            aggregateId: orderId,
            payload: { orderId, amount },
            createdAt: new Date().toISOString(),
          }),
        }]);
        await this.pushTimeline(orderId, 'InventoryReserved', payload);
        break;
      }

      case 'PaymentAuthorized': {
        if (!(await this.guardStep(orderId, 'Shipping.Prepare'))) return;
        await this.producer.send(Topics.ShippingCommands.Prepare, [{
          key: orderId,
          value: JSON.stringify({
            type: 'PrepareShipping',
            aggregate: 'Shipping',
            aggregateId: orderId,
            payload: { orderId },
            createdAt: new Date().toISOString(),
          }),
        }]);
        await this.pushTimeline(orderId, 'PaymentAuthorized', payload);
        break;
      }

      case 'ShippingPrepared': {
        if (!(await this.guardStep(orderId, 'Order.Confirm'))) return;
        await this.producer.send(Topics.OrderCommands.Confirm, [{
          key: orderId,
          value: JSON.stringify({
            type: 'ConfirmOrder',
            aggregate: 'Order',
            aggregateId: orderId,
            payload: { orderId },
            createdAt: new Date().toISOString(),
          }),
        }]);
        await this.pushTimeline(orderId, 'ShippingPrepared', payload);
        break;
      }

      // -------- Compensações --------
      case 'InventoryReservationFailed': {
        if (!(await this.guardStep(orderId, 'Order.Fail'))) return;
        await this.producer.send(Topics.OrderEvents.Failed, [{
          key: orderId,
          value: JSON.stringify({
            type: 'OrderFailed',
            aggregate: 'Order',
            aggregateId: orderId,
            payload: { orderId, reason: 'InventoryReservationFailed' },
            createdAt: new Date().toISOString(),
          }),
        }]);
        await this.pushTimeline(orderId, 'InventoryReservationFailed', payload);
        break;
      }

      case 'PaymentFailed': {
        // compensação: solta estoque + marca pedido como falho
        if (await this.guardStep(orderId, 'Inventory.Release')) {
          await this.producer.send(Topics.InventoryCommands.Release, [{
            key: orderId,
            value: JSON.stringify({
              type: 'ReleaseInventory',
              aggregate: 'Inventory',
              aggregateId: orderId,
              payload: { orderId, items: payload.items },
              createdAt: new Date().toISOString(),
            }),
          }]);
        }
        if (await this.guardStep(orderId, 'Order.Fail')) {
          await this.producer.send(Topics.OrderEvents.Failed, [{
            key: orderId,
            value: JSON.stringify({
              type: 'OrderFailed',
              aggregate: 'Order',
              aggregateId: orderId,
              payload: { orderId, reason: 'PaymentFailed' },
              createdAt: new Date().toISOString(),
            }),
          }]);
        }
        await this.pushTimeline(orderId, 'PaymentFailed', payload);
        break;
      }

      case 'ShippingFailed': {
        // compensação: reembolsa pagamento + marca pedido como falho
        if (await this.guardStep(orderId, 'Payment.Refund')) {
          await this.producer.send(Topics.PaymentCommands.Refund, [{
            key: orderId,
            value: JSON.stringify({
              type: 'RefundPayment',
              aggregate: 'Payment',
              aggregateId: orderId,
              payload: { orderId },
              createdAt: new Date().toISOString(),
            }),
          }]);
        }
        if (await this.guardStep(orderId, 'Order.Fail')) {
          await this.producer.send(Topics.OrderEvents.Failed, [{
            key: orderId,
            value: JSON.stringify({
              type: 'OrderFailed',
              aggregate: 'Order',
              aggregateId: orderId,
              payload: { orderId, reason: 'ShippingFailed' },
              createdAt: new Date().toISOString(),
            }),
          }]);
        }
        await this.pushTimeline(orderId, 'ShippingFailed', payload);
        break;
      }

      default:
        // silencioso por ora
        break;
    }
  }

  private async pushTimeline(orderId: string, stage: string, payload: unknown) {
    type TimelineStage = { stage: string; at: string; payload: unknown };
    // Use um schema explícito para a coleção
    interface OrderHistoryDoc extends Document {
      orderId: string;
      stages: TimelineStage[];
    }
    try {
      const col = this.mongo.getCollection<OrderHistoryDoc>('order_history');
      const filter: Filter<OrderHistoryDoc> = { orderId };
      // O cast em 'update' evita o falso-positivo do tipo NotAcceptedFields do driver
      const update: UpdateFilter<OrderHistoryDoc> = {
        $push: {
          stages: {
            stage,
            at: new Date().toISOString(),
            payload,
          } as TimelineStage
        }
      } as unknown as UpdateFilter<OrderHistoryDoc>;
      await col.updateOne(filter, update, { upsert: true });
    } catch (e) {
      this.logger.error('Timeline write failed: ' + (e as Error).message);
    }
  }
}
