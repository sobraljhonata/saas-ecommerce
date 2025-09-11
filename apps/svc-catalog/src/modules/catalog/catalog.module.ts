import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductController } from './product.controller';
import { PrismaService } from './prisma.service';
import { CreateProductHandler } from './usecases/create-product.handler';
import { ProductRepository } from './product.repository';

export const CommandHandlers = [CreateProductHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ProductController],
  providers: [PrismaService, ProductRepository, ...CommandHandlers],
})
export class CatalogModule {}
