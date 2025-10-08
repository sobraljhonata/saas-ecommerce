import { z } from 'zod';
import { BaseSchema } from './base';

export const OrchestratorConfigSchema = BaseSchema.extend({
  DATABASE_URL: z.string().url().min(1),
  MONGO_URL: z.string().url().min(1),
  REDIS_URL: z.string().url().min(1),
});
export type OrchestratorConfig = z.output<typeof OrchestratorConfigSchema>;