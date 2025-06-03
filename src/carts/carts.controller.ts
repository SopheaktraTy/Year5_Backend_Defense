import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthGuard } from '../guards/authentication.guard';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiBearerAuth('Access-Token')
// @ApiTags('carts')
@Controller('Carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  private getUserId(request: Request): string {
    console.log('Decoded user on request:', (request as any).user);
    return (request as any).user?.sub || (request as any).user?.id;
  }

  @Post()
  create(@Req() request: Request, @Body() createCartDto: CreateCartDto) {
    const userId = this.getUserId(request);
    return this.cartsService.create(userId, createCartDto);
  }

  @Get()
  findByUser(@Req() request: Request) {
    const userId = this.getUserId(request);
    return this.cartsService.findByUser(userId);
  }

  @Put(':cartItemId')
  updateCartItem(
    @Req() request: Request,
    @Param('cartItemId') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = this.getUserId(request);
    return this.cartsService.updateCartItem(userId, cartItemId, updateCartItemDto);
  }

  
  @Delete(':cartItemId')
  removeCartItem(
    @Req() request: Request,
    @Param('cartItemId') cartItemId: string,
  ) {
    const userId = this.getUserId(request);
    return this.cartsService.removeCartItem(userId, cartItemId);
  }
}

