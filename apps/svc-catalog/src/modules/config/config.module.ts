import { Global, Module } from '@nestjs/common';
import {
  CONFIG, type ConfigToken,
  loadEnv, CatalogConfigSchema, type CatalogConfig
} from '@saas/shared-config';

@Global()
@Module({
  providers: [
    {
      provide: CONFIG,
      useValue: loadEnv(CatalogConfigSchema, 'svc-catalog') as CatalogConfig,
    },
  ],
  exports: [CONFIG],
})
export class CatalogConfigModule {}
