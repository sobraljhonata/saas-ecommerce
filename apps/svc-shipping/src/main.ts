import { NestFactory } from '@nestjs/core';
import { loadEnv, BaseSchema, type BaseConfig } from '@saas/shared-config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const cfg: BaseConfig = loadEnv(BaseSchema, 'svc-shipping');
  const port = Number(cfg.PORT) ?? 3005;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
