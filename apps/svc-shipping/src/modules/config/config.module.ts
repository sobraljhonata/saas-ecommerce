import { Global, Module } from '@nestjs/common';
import {
  CONFIG, type ConfigToken,
  loadEnv, ShippingConfigSchema, type ShippingConfig
} from '@saas/shared-config';

@Global()
@Module({
  providers: [
    {
      provide: CONFIG as ConfigToken<ShippingConfig>,
      useValue: loadEnv(ShippingConfigSchema, 'svc-shipping'),
    },
  ],
  exports: [CONFIG],
})
export class ShippingConfigModule { }
