import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { KafkaProducerService } from '../kafka/kafka.producer';
import { KafkaConsumerService } from '../kafka/kafka.consumer';

@Module({
  providers: [ShippingService, KafkaProducerService, KafkaConsumerService],
})
export class ShippingModule {}
