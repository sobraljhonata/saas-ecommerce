import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './modules/app.module';
import { NestFactory } from '@nestjs/core';
import { loadEnv, BaseSchema, type BaseConfig } from '@saas/shared-config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const cfg: BaseConfig = loadEnv(BaseSchema, 'svc-inventory');
  const port = Number(cfg.PORT) ?? 3003;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
