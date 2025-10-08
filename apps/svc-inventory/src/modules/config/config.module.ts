import { Global, Module } from '@nestjs/common';
import {
  CONFIG, type ConfigToken,
  loadEnv, InventoryConfigSchema, type InventoryConfig
} from '@saas/shared-config';

@Global()
@Module({
  providers: [
    {
      provide: CONFIG,
      useValue: loadEnv(InventoryConfigSchema, 'inventory') as InventoryConfig,
    },
  ],
  exports: [CONFIG],
})
export class InventoryConfigModule {}
