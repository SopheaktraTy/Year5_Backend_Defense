import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Products])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
