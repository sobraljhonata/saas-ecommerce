import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { ShippingModule } from './shipping/shipping.module';

@Module({ imports: [KafkaModule, ShippingModule] })
export class AppModule {}
