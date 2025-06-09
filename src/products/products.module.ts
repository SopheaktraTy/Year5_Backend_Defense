import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariable } from './entities/product_variable.entity';
import { Category } from '../categories/entities/category.entity';
import { CartItem } from 'src/carts/entities/cart_item.entity';



@Module({
  imports : [TypeOrmModule.forFeature([Product, ProductVariable, Category, CartItem ])],
  exports: [TypeOrmModule],  // Export TypeOrmModule so other modules can access the ProductsRepository
  controllers: [ProductController],
  providers: [ProductsService],
})
export class ProductModule {}
