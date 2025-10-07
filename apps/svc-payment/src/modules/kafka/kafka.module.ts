import { forwardRef, Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka.consumer';
import { KafkaProducerService } from './kafka.producer';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [forwardRef(() => PaymentModule)], // <-- importa para injetar PaymentService
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}
