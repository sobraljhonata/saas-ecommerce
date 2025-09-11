import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductController } from './product.controller';
import { PrismaService } from './prisma.service';
import { CreateProductHandler } from './usecases/create-product.handler';
import { ProductRepository } from './product.repository';
import { OutboxRepository } from './outbox.repository';
import { KafkaModule } from './kafka/kafka.module';
import { OutboxPublisher } from './outbox.publisher';

export const CommandHandlers = [CreateProductHandler];

@Module({
  imports: [CqrsModule, KafkaModule],
  controllers: [ProductController],
  providers: [PrismaService, ProductRepository, OutboxRepository, OutboxPublisher, ...CommandHandlers],
})
export class CatalogModule {}
