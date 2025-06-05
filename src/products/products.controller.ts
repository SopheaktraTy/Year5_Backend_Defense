import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariableDto } from './dto/create-product-variable.dto';
import { Product } from './entities/product.entity';
import { ProductVariable } from './entities/product_variable.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductsService) {}

 /*----------------->   Create a new product: <-----------------*/
  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

 /*----------------->  Get all products: <-----------------*/
  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

/*----------------->  Get a single product by ID: <-----------------*/
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

/*-----------------> Update an existing product by ID: <-----------------*/
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

/*----------------->  Delete a product by ID: <-----------------*/
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.productService.delete(id);
  }

/*-----------------> Delete Product Variable by ID: <-----------------*/ 
  @Delete(':productId/product-variables/:variableId')
  async deleteProductVariable(
    @Param('productId') productId: string,
    @Param('variableId') variableId: string,
  ): Promise<void> {
    return this.productService.deleteProductVariable(productId, variableId);
  }

/*-----------------> Delete All Product Variables by Product ID: <-----------------*/ 
  @Delete(':productId/product-variables')
  async deleteAllProductVariables(
    @Param('productId') productId: string,
  ): Promise<void> {
    return this.productService.deleteAllProductVariables(productId);
  }

/*-----------------> Add Product Variable: <-----------------*/
  @Post(':productId/product-variables')
  async addProductVariable(
    @Param('productId') productId: string,
    @Body() createProductVariableDto: CreateProductVariableDto,
  ): Promise<ProductVariable> {
    return this.productService.addProductVariable(productId, createProductVariableDto);
  }

/*-----------------> Update Product Variable by ID: <-----------------*/ 
  @Put(':productId/product-variables/:variableId')
  async updateProductVariable(
    @Param('productId') productId: string,
    @Param('variableId') variableId: string,
    @Body() updateProductVariableDto: CreateProductVariableDto,
  ): Promise<ProductVariable> {
    return this.productService.updateProductVariable(productId, variableId, updateProductVariableDto);
  }
}
