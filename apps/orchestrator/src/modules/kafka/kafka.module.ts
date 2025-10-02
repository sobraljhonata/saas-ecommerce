import { forwardRef, Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka.consumer';
import { KafkaProducerService } from './kafka.producer';
import { RouterModule } from '../router/router.module';
import { IdempotencyModule } from '../idempotency/idempotency.module';

@Module({
  imports: [forwardRef(() => RouterModule), IdempotencyModule],            // << novo
  providers: [KafkaConsumerService, KafkaProducerService],
  exports: [KafkaConsumerService, KafkaProducerService],
})
export class KafkaModule {}
