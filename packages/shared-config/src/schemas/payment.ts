import { z } from 'zod';
import { BaseSchema } from './base';

export const PaymentConfigSchema = BaseSchema.extend({
  REJECT_OVER: z.coerce.number().default(0),
});

export type PaymentConfig = z.output<typeof PaymentConfigSchema>;
