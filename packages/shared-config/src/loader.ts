import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

/** Carrega .env obedecendo apps/<APP_NAME>/.env → ./.env; variáveis do ambiente prevalecem. */
export function hydrateEnvFiles(appName?: string) {
  const files: string[] = [];
  if (appName) files.push(path.resolve(process.cwd(), 'apps', appName, '.env'));
  files.push(path.resolve(process.cwd(), '.env'));
  for (const p of files) if (fs.existsSync(p)) dotenv.config({ path: p });
}

/** Fonte da verdade: valida e retorna config tipada (agnóstico de framework). */
export function loadEnv<T extends z.ZodTypeAny>(schema: T, appName?: string): z.output<T> {
  hydrateEnvFiles(appName ?? process.env.APP_NAME);
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const detail = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment variables: ${detail}`);
  }
  return parsed.data;
}
