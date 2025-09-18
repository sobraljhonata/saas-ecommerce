import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, "Required").optional(),
  KAFKA_BROKERS: z.string().default("localhost:29092"),
  TENANT_ID: z.string().uuid().optional(),
  MONGO_URL: z.string().optional()
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}
