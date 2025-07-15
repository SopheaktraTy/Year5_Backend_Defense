/*NestJS imports*/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

/*Services and Controllee*/
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

/*Modules*/
import { TelegramModule } from '../services/telegrambot.module';
import { AuthModule } from 'src/auth/auth.module';

/*Entities*/
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order_item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../carts/entities/cart_item.entity';
import { ProductVariable } from '../products/entities/product_variable.entity';
import { Product } from '../products/entities/product.entity';



@Module({
  imports: [
    TelegramModule,
    TypeOrmModule.forFeature([Order, OrderItem, Cart, CartItem, ProductVariable, Product]),
    JwtModule,
    AuthModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
