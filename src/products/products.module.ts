import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariable } from './entities/product_variable.entity';
import { Category } from '../categories/entities/category.entity';



@Module({
  imports : [TypeOrmModule.forFeature([Product, ProductVariable, Category ])],
  exports: [TypeOrmModule],  // Export TypeOrmModule so other modules can access the ProductsRepository
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductModule {}
