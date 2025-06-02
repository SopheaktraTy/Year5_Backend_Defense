import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from 'src/guards/authentication.guard';
import { ApiBearerAuth, ApiTags, } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiBearerAuth('Access-Token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  private getUserId(request: Request): string {return (request as any).userId;}

  // @Post()
  // create(@Req() request: Request, @Body() createOrderDto: CreateOrderDto) {
  //   const userId = this.getUserId(request)
  //   return this.ordersService.create(userId, createOrderDto);
  // }


  // @Post()
  //   create(@Req() request: Request, @Body() createCartDto: CreateCartDto) {
  //     const userId = this.getUserId(request);
  //     return this.cartsService.create(userId, createCartDto);
  //   }
  // @Get()
  // findAll() {
  //   return this.ordersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ordersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.ordersService.update(+id, updateOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ordersService.remove(+id);
  // }
}
