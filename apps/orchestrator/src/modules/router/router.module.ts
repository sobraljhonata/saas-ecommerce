import { forwardRef, Module } from '@nestjs/common';
import { RouterService } from './router.service';
import { KafkaModule } from '../kafka/kafka.module';
import { DbModule } from '../db/db.module';
import { IdempotencyModule } from '../idempotency/idempotency.module';

@Module({
  imports: [forwardRef(() => KafkaModule), DbModule, IdempotencyModule],   // << evita ciclo
  providers: [RouterService],
  exports: [RouterService],                             // << exporta o provider
})
export class RouterModule {}
