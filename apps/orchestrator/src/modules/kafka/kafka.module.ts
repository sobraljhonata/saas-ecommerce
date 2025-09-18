import { forwardRef, Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka.consumer';
import { KafkaProducerService } from './kafka.producer';
import { RouterModule } from '../router/router.module';

@Module({
  imports: [forwardRef(() => RouterModule)],            // << novo
  providers: [KafkaConsumerService, KafkaProducerService],
  exports: [KafkaConsumerService, KafkaProducerService],
})
export class KafkaModule {}
