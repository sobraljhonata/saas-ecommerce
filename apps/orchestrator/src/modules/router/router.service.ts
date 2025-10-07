import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { KafkaProducerService } from '../kafka/kafka.producer';
import { MongoService } from '../db/mongo.service';
import { BusEnvelope, Topics } from '@saas/shared-kafka';
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

  private async appendStage(orderId: string, stage: string, payload: unknown) {
    const col = this.mongo.getCollection<{ orderId: string; stages: { stage: string; at: string; payload: unknown }[] }>('order_history');
    
    const newStage = { stage, at: new Date().toISOString(), payload }
    
    await col.updateOne(
      { orderId },
      {
        $setOnInsert: { orderId},
        $push: { stages: newStage },
      },
      { upsert: true },
    );
  }

  private calcAmount(items: any[]): number {
    return (items || []).reduce((acc, it) => acc + (it?.total ?? (it?.unitPrice ?? 0) * (it?.quantity ?? 0)), 0);
  }

  async route(msg: BusEnvelope<any>) {
    const type = msg.type;
    const orderId =
      (msg.payload as any)?.orderId ??
      msg.aggregateId; // OrderPlaced costuma vir com aggregateId = orderId
    const items =
      (msg.payload as any)?.items ??
      (msg as any)?.items ??
      [];

    await this.appendStage(orderId, msg.type ?? 'Unknown', msg.payload);

    switch (type) {
      case 'OrderPlaced': {
        // 🔹 PRIMEIRA ETAPA DA SAGA: solicitar reserva de estoque
        if (!(await this.guardStep(orderId, 'Inventory.Reserve'))) return;
        let value = JSON.stringify({
          type: 'ReserveInventory',
          aggregate: 'Inventory',
          aggregateId: orderId,
          orderId,
          items,
          createdAt: new Date().toISOString(),
        })
        await this.producer.send(Topics.InventoryCommands.Reserve, [
          {
            key: orderId,
            value
          }
        ]);
        await this.pushTimeline(orderId, 'OrderPlaced', value);
        this.logger.log(`→ ReserveInventory orderId=${orderId}`);
        break;
      }

      case 'InventoryReserved': {
        if (!(await this.guardStep(orderId, 'Payment.Authorize'))) return;
        const amount = this.calcAmount(items)
        let value = JSON.stringify({
          type: 'AuthorizePayment',
          aggregate: 'Payment',
          aggregateId: orderId,
          orderId,
          amount,
          createdAt: new Date().toISOString(),
        })
        await this.producer.send(Topics.PaymentCommands.Authorize, [{
          key: orderId,
          value,
        }]);
        await this.pushTimeline(orderId, 'InventoryReserved', value);
        this.logger.log(`→ AuthorizePayment orderId=${orderId} amount=${amount}`);
        break;
      }

      case 'PaymentAuthorized': {
        if (!(await this.guardStep(orderId, 'Shipping.Prepare'))) return;
        let value = JSON.stringify({
          type: 'PrepareShipping',
          aggregate: 'Shipping',
          aggregateId: orderId,
          orderId,
          items,
          createdAt: new Date().toISOString(),
        })
        await this.producer.send(Topics.ShippingCommands.Prepare, [{
          key: orderId,
          value,
        }]);
        this.logger.log(`→ PrepareShipping orderId=${orderId}`);
        await this.pushTimeline(orderId, 'PaymentAuthorized', value);
        break;
      }

      case 'ShippingPrepared': {
        if (!(await this.guardStep(orderId, 'Order.Confirm'))) return;
        let value = JSON.stringify({
          type: 'ConfirmOrder',
          aggregate: 'Order',
          aggregateId: orderId,
          orderId,
          createdAt: new Date().toISOString(),
        })
        await this.producer.send(Topics.OrderCommands.Confirm, [{
          key: orderId,
          value,
        }]);
        this.logger.log(`→ OrderConfirmed orderId=${orderId}`);
        await this.pushTimeline(orderId, 'ShippingPrepared', value);
        break;
      }

      // -------- Compensações --------
      case 'InventoryReservationFailed': {
        if (!(await this.guardStep(orderId, 'Order.Fail'))) return;
        let value = JSON.stringify({
          type: 'OrderFailed',
          aggregate: 'Order',
          aggregateId: orderId,
          orderId,
          reason: 'InventoryReservationFailed',
          createdAt: new Date().toISOString(),
        })
        await this.producer.send(Topics.OrderEvents.Failed, [{
          key: orderId,
          value,
        }]);
        this.logger.log(`→ OrderFailed (inventory) orderId=${orderId}`);
        await this.pushTimeline(orderId, 'InventoryReservationFailed', value);
        break;
      }

      case 'PaymentFailed': {
        // compensação: solta estoque + marca pedido como falho
        let value = JSON.stringify({})
        if (await this.guardStep(orderId, 'Inventory.Release')) {
          value = JSON.stringify({
            type: 'ReleaseInventory',
            aggregate: 'Inventory',
            aggregateId: orderId,
            orderId,
            items,
            createdAt: new Date().toISOString(),
          })
          await this.producer.send(Topics.InventoryCommands.Release, [{
            key: orderId,
            value,
          }]);
        }
        if (await this.guardStep(orderId, 'Order.Fail')) {
          value = JSON.stringify({
            type: 'OrderFailed',
            aggregate: 'Order',
            aggregateId: orderId,
            orderId, 
            reason: 'PaymentFailed',
            createdAt: new Date().toISOString(),
          })
          await this.producer.send(Topics.OrderEvents.Failed, [{
            key: orderId,
            value,
          }]);
        }
        this.logger.log(`→ ReleaseInventory + OrderFailed (payment) orderId=${orderId}`);
        await this.pushTimeline(orderId, 'PaymentFailed', value);
        break;
      }

      case 'ShippingFailed': {
        // compensação: reembolsa pagamento + marca pedido como falho
        let value = JSON.stringify({})
        if (await this.guardStep(orderId, 'Payment.Refund')) {
          value = JSON.stringify({
            type: 'RefundPayment',
            aggregate: 'Payment',
            aggregateId: orderId,
            orderId,
            createdAt: new Date().toISOString(),
          })
          await this.producer.send(Topics.PaymentCommands.Refund, [{
            key: orderId,
            value,
          }]);
        }
        if (await this.guardStep(orderId, 'Order.Fail')) {
          value = JSON.stringify({
            type: 'OrderFailed',
            aggregate: 'Order',
            aggregateId: orderId,
            orderId, 
            reason: 'ShippingFailed',
            createdAt: new Date().toISOString(),
          })
          await this.producer.send(Topics.OrderEvents.Failed, [{
            key: orderId,
            value,
          }]);
        }
        this.logger.log(`→ Refund + OrderFailed (shipping) orderId=${orderId}`);
        await this.pushTimeline(orderId, 'ShippingFailed', value);
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
