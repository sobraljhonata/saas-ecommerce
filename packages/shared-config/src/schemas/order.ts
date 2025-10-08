import { z } from 'zod';
import { BaseSchema } from './base';

export const OrderConfigSchema = BaseSchema.extend({
  DATABASE_URL: z.string().url().min(1),
});
export type OrderConfig = z.output<typeof OrderConfigSchema>;
