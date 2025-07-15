/*Nestjs Hyper Class*/
import { Request } from 'express';
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

/*Services*/
import { CartsService } from './carts.service';

/*DTO*/ 
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

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
@Controller('Carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  private getUserId(request: Request): string {
    return (request as any).user?.sub || (request as any).user?.id;
  }
  
  // Cart Endpoints
  @Permissions([{resource: Resource.CARTS, actions: [Action.CREATE] }])
  @Post('add-to-cart')
  create(@Req() request: Request, @Body() createCartDto: CreateCartDto) {
    const userId = this.getUserId(request);
    return this.cartsService.create(userId, createCartDto);
  }
  
  @Permissions([{resource: Resource.CARTS, actions: [Action.READ] }])
  @Get('view-my-cart')
  findByUser(@Req() request: Request) {
    const userId = this.getUserId(request);
    return this.cartsService.findByUser(userId);
  }
  
  @Permissions([{resource: Resource.CARTS, actions: [Action.UPDATE] }])
  @Put('/update-a-item/:cartItemId')
  updateCartItem(
    @Req() request: Request,
    @Param('cartItemId') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = this.getUserId(request);
    return this.cartsService.updateCartItem(userId, cartItemId, updateCartItemDto);
  }
  
  @Permissions([{resource: Resource.CARTS, actions: [Action.DELETE] }])
  @Delete('/remove-a-item/:cartItemId')
  removeCartItem(
    @Req() request: Request,
    @Param('cartItemId') cartItemId: string,
  ) {
    const userId = this.getUserId(request);
    return this.cartsService.removeCartItem(userId, cartItemId);
  }
  
  @Permissions([{resource: Resource.CARTS, actions: [Action.DELETE] }])
  @Delete('remove-all-items')
  clearCart(@Req() request: Request) {
    const userId = this.getUserId(request);
    return this.cartsService.clearCart(userId);
  }
}

