import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from './prisma.service';
import { OrderRepository } from './order.repository';
import { OutboxRepository } from './outbox.repository';
import { CreateOrderHandler } from './usecases/create-order.handler';
import { OrderController } from './order.controller';
import { KafkaModule } from './kafka/kafka.module';
import { OutboxPublisher } from './outbox.publisher';

export const CommandHandlers = [CreateOrderHandler];

@Module({
  imports: [CqrsModule, KafkaModule],
  controllers: [OrderController],
  providers: [PrismaService, OrderRepository, OutboxRepository, OutboxPublisher, ...CommandHandlers],
})
export class OrderModule {}
