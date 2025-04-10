import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Products])],
  controllers: [ProductController],
  providers: [ProductsService],
})
export class ProductModule {}
