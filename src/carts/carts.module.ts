import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';


/*Entities*/
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart_item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import { ProductVariable } from '../products/entities/product_variable.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product, User, ProductVariable]),
    JwtModule,
    AuthModule
],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
