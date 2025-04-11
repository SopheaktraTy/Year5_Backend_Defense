import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSizeService } from './products_size.service';
import { ProductSizeController } from './products_size.controller';
import { Products_Sizes } from './entities/product_size.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Products_Sizes])],
  controllers: [ProductSizeController],
  providers: [ProductSizeService],
  exports: [ProductSizeService],
})
export class ProductSizeModule {}
