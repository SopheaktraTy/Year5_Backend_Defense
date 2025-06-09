import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductsService) {}

  /*-----------------> Create a new product: <-----------------*/
  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  /*-----------------> Get all products: <-----------------*/
  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  /*-----------------> Get a single product by ID: <-----------------*/
  @Get(':productId')  
  async findOne(@Param('productId') productId: string): Promise<Product> {
    return this.productService.findOne(productId);
  }

  /*-----------------> Update an existing product by ID: <-----------------*/
  @Put(':productId')  
  async update(
    @Param('productId') productId: string,  
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<{ message: string; product: Product }> {
    return this.productService.update(productId, updateProductDto);
  }

  /*-----------------> Delete a product by ID: <-----------------*/
  @Delete(':productId') 
  async delete(@Param('productId') productId: string): Promise<{ message: string }> {
    return this.productService.delete(productId);
  }
}
