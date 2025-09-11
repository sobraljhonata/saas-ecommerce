import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    price: number;
    isBundleOptional: boolean;
    categoryId: string;
    tenantId: string;
  }) {
    await this.prisma.product.create({ data });
  }
}
