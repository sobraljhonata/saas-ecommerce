import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { BusEnvelope, Topics } from '@saas/shared-kafka';
import { KafkaProducerService } from '../kafka/kafka.producer';
import { MongoService } from '../db/mongo.service';
import type { Document, Filter, UpdateFilter } from 'mongodb';

@Injectable()
export class RouterService {
  private readonly logger = new Logger(RouterService.name);

  constructor(
    @Inject(forwardRef(() => KafkaProducerService))
    private readonly producer: KafkaProducerService,
    private readonly mongo: MongoService,
  ) { }

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
          } as unknown as TimelineStage
        }
      } as unknown as UpdateFilter<OrderHistoryDoc>;
      await col.updateOne(filter, update, { upsert: true });
    } catch (e) {
      this.logger.error('Timeline write failed: ' + (e as Error).message);
    }
  }

  async route(msg: BusEnvelope) {
    this.logger.log(`[${msg.type}] aggregate=${msg.aggregate} id=${msg.aggregateId}`);

    // 1) OrderPlaced -> Inventory.Reserve
    if (msg.type === 'OrderPlaced') {
      const payload: any = msg.payload || {};
      const orderId = payload.orderId ?? msg.aggregateId;
      await this.producer.send(Topics.InventoryCommands.Reserve, [{
        key: orderId,
        value: JSON.stringify({
          type: 'ReserveInventory',
          orderId,
          items: payload.items ?? [],
          tenantId: msg.tenantId,
          createdAt: new Date().toISOString(),
        }),
      }]);
      this.logger.log(`→ Sent Inventory Reserve for order ${orderId}`);
      await this.pushTimeline(orderId, 'OrderPlaced', payload);
      return;
    }

    // 2) InventoryReserved -> Payment.Authorize
    if (msg.type === 'InventoryReserved' || msg.type === 'Reserved') {
      const payload: any = msg.payload || {};
      const orderId = payload.orderId ?? msg.aggregateId;
      const amount = (payload.items ?? []).reduce((acc: number, it: any) => {
        const itemTotal = it?.total ?? ((it?.unitPrice ?? 0) * (it?.quantity ?? 0));
        return acc + Number(itemTotal);
      }, 0);


      await this.producer.send(Topics.PaymentCommands.Authorize, [{
        key: orderId,
        value: JSON.stringify({
          type: 'AuthorizePayment',
          orderId,
          amount,
          createdAt: new Date().toISOString(),
        }),
      }]);
      this.logger.log(`→ Sent Payment Authorize for order ${orderId}`);
      await this.pushTimeline(orderId, 'InventoryReserved', payload);
      return;
    }

    // 3) PaymentAuthorized -> Shipping.Prepare
    if (msg.type === 'PaymentAuthorized' || msg.type === 'Authorized') {
      const payload: any = msg.payload || {};
      const orderId = payload.orderId ?? msg.aggregateId;
      await this.producer.send(Topics.ShippingCommands.Prepare, [{
        key: orderId,
        value: JSON.stringify({
          type: 'PrepareShipping',
          orderId,
          createdAt: new Date().toISOString(),
        }),
      }]);
      this.logger.log(`→ Sent Shipping Prepare for order ${orderId}`);
      await this.pushTimeline(orderId, 'PaymentAuthorized', payload);
      return;
    }

    // 4) ShippingPrepared -> Order.Confirm
    if (msg.type === 'ShippingPrepared' || msg.type === 'Prepared') {
      const payload: any = msg.payload || {};
      const orderId = payload.orderId ?? msg.aggregateId;
      await this.producer.send(Topics.OrderCommands.Confirm, [{
        key: orderId,
        value: JSON.stringify({
          type: 'ConfirmOrder',
          orderId,
          createdAt: new Date().toISOString(),
        }),
      }]);
      this.logger.log(`→ Sent Order Confirm for order ${orderId}`);
      await this.pushTimeline(orderId, 'ShippingPrepared', payload);
      return;
    }

    // Outros: por enquanto só loga
    if (msg.type === 'ProductCreated') {
      this.logger.log(`ProductCreated payload: ${JSON.stringify(msg.payload)}`);
    }
  }
}
