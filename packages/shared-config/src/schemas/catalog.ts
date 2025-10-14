import { z } from 'zod';
import { BaseSchema } from './base';

export const CatalogConfigSchema = BaseSchema.extend({
  DATABASE_URL: z.string().url().min(1),
  SHADOW_DATABASE_URL: z.string().url().min(1)
});
export type CatalogConfig = z.output<typeof CatalogConfigSchema>;
