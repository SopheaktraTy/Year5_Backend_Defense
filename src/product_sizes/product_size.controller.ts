import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductSizeService } from './product_size.service';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
// import { UpdateProductSizeDto } from './dto/update-products-size.dto';

@Controller('product-sizes')
export class ProductSizeController {
  constructor(private readonly productSizeService: ProductSizeService) {}

  @Post()
  create(@Body() createProductSizeDto: CreateProductSizeDto) {
    return this.productSizeService.create(createProductSizeDto);
  }

  // @Get()
  // findAll() {
  //   return this.productSizeService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productSizeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductSizeDto: UpdateProductSizeDto) {
  //   return this.productSizeService.update(+id, updateProductSizeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productSizeService.remove(+id);
  // }
}
