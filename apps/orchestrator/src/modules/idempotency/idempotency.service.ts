import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CONFIG, ConfigToken, OrchestratorConfig } from '@saas/shared-config';
import Redis from 'ioredis';

@Injectable()
export class IdempotencyService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  constructor(@Inject(CONFIG as ConfigToken<OrchestratorConfig>) private readonly cfg: OrchestratorConfig,
    ) {}

  async onModuleInit() {
    const url = this.cfg.REDIS_URL ?? 'redis://localhost:6379';
    this.client = new Redis(url, { lazyConnect: true });
    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }

  /**
   * setOnce: retorna true se a chave foi gravada agora (NX), false se já existia.
   */
  async setOnce(key: string, ttlSeconds: number): Promise<boolean> {
    const res = await this.client.set(key, '1', 'EX', ttlSeconds, 'NX');
    return res === 'OK';
  }
}
