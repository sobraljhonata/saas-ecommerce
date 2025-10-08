import { z } from 'zod';
import { BaseSchema } from './base';

export const ShippingConfigSchema = BaseSchema;
export type ShippingConfig = z.output<typeof ShippingConfigSchema>;
