import { Global, Module } from '@nestjs/common';
import { CONFIG, loadEnv, OrchestratorConfigSchema, type OrchestratorConfig } from '@saas/shared-config';

@Global()
@Module({
  providers: [
    {
      provide: CONFIG,
      useValue: loadEnv(OrchestratorConfigSchema, 'orchestrator') as OrchestratorConfig,
    },
  ],
  exports: [CONFIG],
})
export class OrchestratorConfigModule {}
