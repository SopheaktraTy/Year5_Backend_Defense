import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order_item.entity';
import { User } from '../auth/entities/user.entity';
import { JwtModule, } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from '../config/jwt.config';
import { CartItem } from 'src/carts/entities/cart_item.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { ProductVariable } from 'src/products/entities/product_variable.entity';


@Module({
  imports: [ TypeOrmModule.forFeature([Order, OrderItem, User, CartItem, Cart, ProductVariable]),
  JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to access environment variables
      useFactory: async (configService: ConfigService) => jwtConfig(configService), // Call jwtConfig to configure JWT
      inject: [ConfigService], // Inject ConfigService to access environment variables
    }),
],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
