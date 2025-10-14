import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { CreateProductDto } from './product.dto';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateProductDto & { id: string }) {
    await this.prisma.product.create({ data });
  }
}
