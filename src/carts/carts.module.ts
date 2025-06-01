import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart_item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import { JwtModule, } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from '../config/jwt.config'; 
import { ProductVariable } from '../products/entities/product_variable.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Product, User, ProductVariable]),
  JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to access environment variables
      useFactory: async (configService: ConfigService) => jwtConfig(configService), // Call jwtConfig to configure JWT
      inject: [ConfigService], // Inject ConfigService to access environment variables
    }),
],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
