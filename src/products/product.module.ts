import { Module } from '@nestjs/common';
import { ProductsService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariable } from './entities/product_variables.entity';
import { Category } from '../categories/entities/category.entity';


@Module({
  imports : [TypeOrmModule.forFeature([Product, ProductVariable, Category])],
  exports: [TypeOrmModule],  // Export TypeOrmModule so other modules can access the ProductsRepository
  controllers: [ProductController],
  providers: [ProductsService],
})
export class ProductModule {}
