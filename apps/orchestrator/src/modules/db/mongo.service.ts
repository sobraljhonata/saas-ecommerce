import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { BaseConfig, CONFIG, ConfigToken, OrchestratorConfig } from '@saas/shared-config';
import { MongoClient, Collection, Document } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient | null = null;

  constructor(@Inject(CONFIG as ConfigToken<OrchestratorConfig>) private readonly cfg: OrchestratorConfig,
  ) {}

  async onModuleInit() {
    const url = this.cfg.MONGO_URL || 'mongodb://localhost:27017/saas';
    this.client = new MongoClient(url);
    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  getCollection<T extends Document = Document>(name: string): Collection<T> {
    if (!this.client) throw new Error('Mongo not initialized');
    const db = this.client.db(); // database from URL path
    return db.collection<T>(name);
  }
}
