import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateOrderCommand } from './usecases/create-order.handler';
import { CreateOrderDto } from './order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() body: unknown) {
    const dto = CreateOrderDto.parse(body);
    const id = await this.commandBus.execute(new CreateOrderCommand(dto));
    return { id, code: dto.code };
  }
}
