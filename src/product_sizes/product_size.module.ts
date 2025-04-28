import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSizeService } from './product_size.service';
import { ProductSizeController } from './product_size.controller';
import { Product_Size } from './entities/product_size.entity';
import { ProductModule } from '../products/product.module';  // Import ProductModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Product_Size]),
    ProductModule,  // Make sure to import ProductModule here
  ],
  controllers: [ProductSizeController],
  providers: [ProductSizeService],
  exports: [ProductSizeService],
})
export class ProductSizeModule {}
