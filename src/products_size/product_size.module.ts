import { Module } from '@nestjs/common';
import { ProductSizeService } from './products_size.service';
import { ProductSizeController } from './products_size.controller';

@Module({
  controllers: [ProductSizeController],
  providers: [ProductSizeService],
})
export class ProductSizeModule {}
