import { ShippingConfigModule } from './config/config.module';
import { KafkaModule } from './kafka/kafka.module';
import { ShippingModule } from './shipping/shipping.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [KafkaModule, ShippingModule, ShippingConfigModule],
})
export class AppModule { }
