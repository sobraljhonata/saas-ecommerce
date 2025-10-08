import { OrderModule } from './order/order.module';
import { Module } from '@nestjs/common';
import { OrderConfigModule } from '../config/config.module';

@Module({
  imports: [OrderModule, OrderConfigModule]
})
export class AppModule { }
