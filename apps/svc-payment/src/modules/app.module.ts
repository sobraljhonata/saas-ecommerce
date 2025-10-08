import { PaymentConfigModule } from './config/config.module';
import { KafkaModule } from './kafka/kafka.module';
import { PaymentModule } from './payment/payment.module';
import { Module } from '@nestjs/common';

@Module({ 
    imports: [KafkaModule, PaymentModule, PaymentConfigModule],
})
export class AppModule { }
