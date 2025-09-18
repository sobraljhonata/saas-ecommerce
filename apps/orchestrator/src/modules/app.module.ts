import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaModule } from './kafka/kafka.module';
import { RouterModule } from './router/router.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    KafkaModule,
    RouterModule,
    DbModule
  ],
})
export class AppModule {}
