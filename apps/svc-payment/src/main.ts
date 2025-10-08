import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './modules/app.module';
import { loadEnv, PaymentConfig, PaymentConfigSchema } from '@saas/shared-config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const cfg: PaymentConfig = loadEnv(PaymentConfigSchema, 'svc-payment');
  const port = cfg.PORT ?? 3004;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
