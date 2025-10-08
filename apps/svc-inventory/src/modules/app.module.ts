import { InventoryConfigModule } from './config/config.module';
import { KafkaModule } from './kafka/kafka.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [KafkaModule, InventoryConfigModule],
})
export class AppModule {}
