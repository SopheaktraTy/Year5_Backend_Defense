import { Controller, Get, Post, Body, Param , Put, Delete} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-products.dto';
import { UpdateProductDto } from './dto/update-products.dto';
import { Products } from './entities/products.entity';  // Assuming Products is the entity

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }
  @Get()
  async findAll() {
    return this.productService.findAll(); // Fetch products with sizes relation
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
