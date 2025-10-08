import { Global, Module } from '@nestjs/common';
import {
  CONFIG, loadEnv, OrderConfigSchema, type OrderConfig
} from '@saas/shared-config';

@Global()
@Module({
  providers: [
    {
      provide: CONFIG,
      useValue: loadEnv(OrderConfigSchema, 'svc-order') as OrderConfig,
    },
  ],
  exports: [CONFIG],
})
export class OrderConfigModule { }
