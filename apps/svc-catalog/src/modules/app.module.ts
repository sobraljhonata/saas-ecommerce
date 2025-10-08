import { CatalogModule } from './catalog/catalog.module';
import { Module } from '@nestjs/common';
import { CatalogConfigModule } from './config/config.module';

@Module({
  imports: [CatalogModule, CatalogConfigModule],
})
export class AppModule {}
