import { Module } from '@nestjs/common';
import { ProductsService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Product])],
  exports: [TypeOrmModule],  // Export TypeOrmModule so other modules can access the ProductsRepository
  controllers: [ProductController],
  providers: [ProductsService],
})
export class ProductModule {}
