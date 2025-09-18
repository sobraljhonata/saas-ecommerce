import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private prisma: PrismaService) { }

  async create(data: {
    id: string;
    code: string;
    tenantId: string;
    items: { id: string; productId: string; quantity: number; unitPrice: number; total: number }[];
  }) {
    await this.prisma.order.create({
      data: {
        id: data.id,
        code: data.code,
        status: "PENDING",
        tenantId: data.tenantId,
        items: {
          createMany: {
            data: data.items.map(i => ({
              id: i.id,
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.total
            }))
          }
        }
      }
    });
  }
  async updateStatus(id: string, status: string) {
    await this.prisma.order.update({
      where: { id },
      data: { status }
    });
  }
}
