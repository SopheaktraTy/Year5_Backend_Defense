import { Controller, Post, Get, Delete, Param, Req, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../guards/authentication.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiBearerAuth('Access-Token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private getUserId(request: Request): string {
    const user = (request as any).user;
    return user?.sub || user?.id;
  }

  @Post()
  @ApiOperation({ summary: 'Create an order from a cart payload' })
  create(
    @Req() request: Request,
    @Body() createOrderDto: CreateOrderDto,) {
    const userId = this.getUserId(request);
    return this.ordersService.create(userId, createOrderDto);
  }

  // @Get()
  // @ApiOperation({ summary: 'Get all orders (admin use)' })
  // findAll() {
  //   return this.ordersService.findAll();
  // }

  // @Get('me')
  // @ApiOperation({ summary: 'Get current user’s orders' })
  // findMyOrders(@Req() request: Request) {
  //   const userId = this.getUserId(request);
  //   return this.ordersService.findByUser(userId);
  // }

  // @Get(':orderId')
  // @ApiOperation({ summary: 'Get a specific order by ID' })
  // @ApiParam({ name: 'orderId', type: 'string' })
  // findOne(@Param('orderId', ParseUUIDPipe) orderId: string) {
  //   return this.ordersService.findOne(orderId);
  // }

  // @Delete(':orderId')
  // @ApiOperation({ summary: 'Cancel or delete an order by ID' })
  // @ApiParam({ name: 'orderId', type: 'string' })
  // cancel(@Req() request: Request, @Param('orderId', ParseUUIDPipe) orderId: string) {
  
  //   const userId = this.getUserId(request);
  //   return this.ordersService.cancel(userId, orderId);
  // }
}
