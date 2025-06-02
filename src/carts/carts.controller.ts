import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
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
    return (request as any).userId;
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

  @Patch (':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    const userId = this.getUserId(request);
    return this.cartsService.update(id, userId, updateCartDto);
  }

  @Delete('product/:productId')
  removeProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() request: Request,
  ) {
    const userId = this.getUserId(request);
    return this.cartsService.remove(userId, productId);
  }
}