// apps/svc-order/src/modules/order/order.dto.ts
import { z } from "zod";

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  total: z.number().positive()
});

export const CreateOrderSchema = z.object({
  code: z.string().min(6),
  items: z.array(OrderItemSchema).min(1),
  tenantId: z.string().uuid()
});

// 👉 use z.output para o tipo “de saída” após parse:
export type OrderItemDto = z.output<typeof OrderItemSchema>;
export type CreateOrderDto = z.output<typeof CreateOrderSchema>;
