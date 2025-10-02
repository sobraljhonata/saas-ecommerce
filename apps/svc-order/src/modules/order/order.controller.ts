import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateOrderDto, CreateOrderSchema } from './order.dto';
import { CreateOrderCommand } from './usecases/create-order.handler';

@Controller('orders')
export class OrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() body: unknown) {
    // valida e tipa:
    console.log(body)
    const dto = CreateOrderSchema.parse(body) satisfies CreateOrderDto;
    const id = await this.commandBus.execute(new CreateOrderCommand(dto));
    return { id, code: dto.code };
  }
}
