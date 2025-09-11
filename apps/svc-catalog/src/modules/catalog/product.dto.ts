import { z } from "zod";

export const CreateProductDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  isBundleOptional: z.boolean().optional().default(false),
  tenantId: z.string().uuid()
});
export type CreateProductDto = z.infer<typeof CreateProductDto>;
