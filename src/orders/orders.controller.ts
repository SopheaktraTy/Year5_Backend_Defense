import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../guards/authentication.guard'; // Ensure the AuthGuard is correctly imported
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth('Access-Token')
@ApiTags('orders')
@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  private getUserId(request: Request): string {
    console.log('Decoded user on request:', (request as any).user);
    return (request as any).user?.sub || (request as any).user?.id;
  }

  // Create an order for a user
  // @Post()
  // create(@Req() request: Request, @Body() createOrderDto: CreateOrderDto) {
  //   const userId = this.getUserId(request);
  //   return this.orderService.create(userId, createOrderDto);
  // }

  // // Get all orders for a user
  // @Get()
  // async findOrdersByUser(@Req() request: Request) {
  //   const userId = this.getUserId(request);
  //   return this.orderService.findOrdersByUser(userId);
  // }

  // // Get a specific order by its ID
  // @Get(':id')
  // @UseGuards(UserGuard)  // Ensuring the user is allowed to access this specific order
  // async findOne(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Req() request: Request
  // ) {
  //   const userId = this.getUserId(request);
  //   return this.orderService.findOrderById(id, userId);
  // }

  // // Update an order by its ID
  // @Put(':id')
  // @UseGuards(UserGuard)  // Ensuring the user is allowed to update this specific order
  // async update(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() updateOrderDto: UpdateOrderDto,
  //   @Req() request: Request
  // ) {
  //   const userId = this.getUserId(request);
  //   return this.orderService.updateOrder(id, userId, updateOrderDto);
  // }

  // // Delete an order by its ID
  // @Delete(':id')
  // @UseGuards(UserGuard)  // Ensuring the user is allowed to delete this specific order
  // async delete(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Req() request: Request
  // ) {
  //   const userId = this.getUserId(request);
  //   return this.orderService.deleteOrder(id, userId);
  }

