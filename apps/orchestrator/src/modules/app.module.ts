import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaModule } from './kafka/kafka.module';
import { RouterModule } from './router/router.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    KafkaModule,
    RouterModule
  ],
})
export class AppModule {}
