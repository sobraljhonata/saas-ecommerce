import { z } from "zod";

export const OrderItemDto = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  total: z.number().positive()
});

export const CreateOrderDto = z.object({
  code: z.string().min(6),
  items: z.array(OrderItemDto).min(1),
  tenantId: z.string().uuid()
});

export type CreateOrderDto = z.infer<typeof CreateOrderDto>;
