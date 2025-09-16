import { Injectable, Logger } from '@nestjs/common';
import { BusEnvelope, Topics } from '@saas/shared-kafka';
import { KafkaProducerService } from '../kafka/kafka.producer';

@Injectable()
export class RouterService {
  private readonly logger = new Logger(RouterService.name);

  constructor(private readonly producer: KafkaProducerService) {}

  async route(msg: BusEnvelope) {
    this.logger.log(`[${msg.type}] aggregate=${msg.aggregate} id=${msg.aggregateId}`);

    if (msg.type === 'OrderPlaced') {
      const payload: any = msg.payload || {};
      await this.producer.send(Topics.InventoryCommands.Reserve, [{
        key: msg.aggregateId,
        value: JSON.stringify({
          type: 'ReserveInventory',
          orderId: payload.orderId ?? msg.aggregateId,
          items: payload.items ?? [],
          tenantId: msg.tenantId,
          createdAt: new Date().toISOString()
        })
      }]);
      this.logger.log(`→ Sent Inventory Reserve for order ${payload.orderId ?? msg.aggregateId}`);
      return;
    }

    if (msg.type === 'InventoryReserved' || msg.type === 'Reserved') {
      this.logger.log(`Inventory reserved OK: ${JSON.stringify(msg.payload)}`);
      return;
    }

    if (msg.type === 'ProductCreated') {
      this.logger.log(`ProductCreated payload: ${JSON.stringify(msg.payload)}`);
    }
  }
}
