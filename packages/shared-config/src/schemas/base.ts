import { z } from 'zod';

export const BaseSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3000),
  KAFKA_BROKERS: z.string().min(1), // CSV: "host1:9092,host2:9092"
});

export type BaseConfig = z.output<typeof BaseSchema>;
