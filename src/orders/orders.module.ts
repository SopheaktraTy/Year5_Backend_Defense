import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order_item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../carts/entities/cart_item.entity';
import { ProductVariable } from '../products/entities/product_variable.entity';
import { Product } from '../products/entities/product.entity';

import { JwtModule } from '@nestjs/jwt';
import { TelegramModule } from '../services/telegrambot.module';

@Module({
  imports: [
    TelegramModule,
    TypeOrmModule.forFeature([Order, OrderItem, Cart, CartItem, ProductVariable, Product]),
    JwtModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
