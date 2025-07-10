import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductVariableDto } from './dto/create-product-variable.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariableDto } from './dto/update-product-variable.dto';
import { Product } from './entities/product.entity';

@Controller('Products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  /*-----------------> Create a new product: <-----------------*/
  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.createProductWithProductVariable(createProductDto);
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
    return this.productService.updateProduct(productId, updateProductDto);
  }

  /*-----------------> Delete a product by ID: <-----------------*/
  @Delete(':productId') 
  async delete(@Param('productId') productId: string): Promise<{ message: string }> {
    return this.productService.delete(productId);
  }

  /*-----------------> Create a new product variable: <-----------------*/
  @Post('productVariable/:productId')
  async createProductVariable(@Param('productId') productId: string, @Body() createProductVariableDto: CreateProductVariableDto,): Promise<Product> {
    return this.productService.createProductVariable(productId, createProductVariableDto);
  }

  /*-----------------> Update a product variable by ID: <-----------------*/
  @Put('productVariable/:variableId') 
  async updateProductVariable(
    @Param('variableId') variableId: string,  
    @Body() updateProductVariableDto: UpdateProductVariableDto,
  ): Promise<Product> {
    return this.productService.updateProductVariable(variableId, updateProductVariableDto);
  }

  /*-----------------> Delete a product variableId by ID: <-----------------*/
  @Delete('productVariable/:variableId')
  async deleteProductVariable(@Param('variableId') variableId: string) {
    return this.productService.deleteProductVariable(variableId);
  }
}
 