import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { PaymentModule } from './payment/payment.module';

@Module({ imports: [KafkaModule, PaymentModule] })
export class AppModule {}
