import { Global, Module } from '@nestjs/common';
import {
    CONFIG, type ConfigToken,
    loadEnv, PaymentConfig, PaymentConfigSchema} from '@saas/shared-config';

@Global()
@Module({
  providers: [
    {
      provide: CONFIG,
      useValue: loadEnv(PaymentConfigSchema, 'svc-payment') as PaymentConfig,
    },
  ],
  exports: [CONFIG],
})
export class PaymentConfigModule {}
