import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from '../guards/authentication.guard';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiBearerAuth('Access-Token')
@ApiTags('carts')
@Controller('carts')
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

  // @Put()
  // update(
  //   @Param( ParseUUIDPipe)
  //   @Req() request: Request,
  //   @Body() updateCartDto: UpdateCartDto,
  // ) {
  //   const userId = this.getUserId(request);
  //   return this.cartsService.update(userId, updateCartDto);
  // }

  // @Delete()
  // remove(@Param(ParseUUIDPipe) id: string, @Req() request: Request) {
  //   const userId = this.getUserId(request);
  //   return this.cartsService.remove( userId);
  // }
}
