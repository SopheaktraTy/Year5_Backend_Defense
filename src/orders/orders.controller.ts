/*NestJS imports*/
import { Controller, Post, Get, Put, Param, Req, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';

/*Services*/
import { OrdersService } from './orders.service';

/*DTOs*/
import { CreateOrderDto } from './dto/create-order.dto';

/*Guard*/
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

/*Decorators*/
import { Permissions } from 'src/roles/decorators/permissions.decorator';

/*Enums*/
import { Resource } from 'src/roles/enums/resource.enum'
import { Action } from 'src/roles/enums/action.enum';



@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiBearerAuth('Access-Token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private getUserId(request: Request): string {
    const user = (request as any).user;
    return user?.sub || user?.id;
  }

  // Order Endpoints
  @Permissions([{resource: Resource.ORDERS, actions: [Action.CREATE] }])
  @Post('add-to-order')
  create(
    @Req() request: Request,
    @Body() createOrderDto: CreateOrderDto,) {
    const userId = this.getUserId(request);
    return this.ordersService.create(userId, createOrderDto);
  }

  @Permissions([{resource: Resource.ORDERS, actions: [Action.READ] }])
  @Get('view-my-orders')
  findMyOrders(@Req() request: Request) {
    const userId = this.getUserId(request);
    return this.ordersService.findByUser(userId);
  }


  // View the Transactions
  @Permissions([{resource: Resource.TRANSACTIONS, actions: [Action.READ] }])
  @Get('view-all-orders')
  findAll() {
    return this.ordersService.findAll();
  }
  
  @Permissions([{resource: Resource.TRANSACTIONS, actions: [Action.READ] }])
  @Get('/view-a-order/:orderId')
  @ApiParam({ name: 'orderId', type: 'string' })
  findOne(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.ordersService.findOne(orderId);
  }

  @Permissions([{ resource: Resource.TRANSACTIONS, actions: [Action.UPDATE] }])
  @Put('toggle-status/:orderId')
  @ApiParam({ name: 'orderId', type: 'string' })
  toggleStatus(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.ordersService.toggleStatus(orderId);
  }
}
