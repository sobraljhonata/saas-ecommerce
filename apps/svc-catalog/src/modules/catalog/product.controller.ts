import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProductCommand } from './usecases/create-product.handler';
import { type CreateProductDto, CreateProductSchema } from './product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() body: unknown) {
    const dto = CreateProductSchema.parse(body) satisfies CreateProductDto;
    const id = await this.commandBus.execute(new CreateProductCommand(dto));
    return { id };
  }
}
