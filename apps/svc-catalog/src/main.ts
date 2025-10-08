import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './modules/app.module';
import { loadEnv, BaseSchema, type BaseConfig } from '@saas/shared-config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const cfg: BaseConfig = loadEnv(BaseSchema, 'svc-catalog');
  const port = Number(cfg.PORT) ?? 3001;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
