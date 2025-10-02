import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [forwardRef(() => KafkaModule)],   // permite a referência circular
  providers: [PaymentService],
  exports: [PaymentService], 
})
export class PaymentModule {}
