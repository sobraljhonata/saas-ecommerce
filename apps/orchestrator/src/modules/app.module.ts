import { ScheduleModule } from '@nestjs/schedule';
import { KafkaModule } from './kafka/kafka.module';
import { RouterModule } from './router/router.module';
import { DbModule } from './db/db.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { Module } from '@nestjs/common';
import { OrchestratorConfigModule } from './config/config.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    KafkaModule,
    RouterModule,
    DbModule,
    IdempotencyModule,
    OrchestratorConfigModule
  ]
})
export class AppModule { }
