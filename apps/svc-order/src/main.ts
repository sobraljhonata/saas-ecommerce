import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import { CONFIG, type ConfigToken, loadEnv, BaseSchema, type BaseConfig } from '@saas/shared-config';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const cfg: BaseConfig = loadEnv(BaseSchema, 'svc-order');
  const port = cfg.PORT ?? 3001;
  await app.listen(port);
}
bootstrap();
