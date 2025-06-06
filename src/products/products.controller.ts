import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariableDto } from './dto/create-product-variable.dto';
import { UpdateProductVariableDto } from './dto/update-product-variable.dto';
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
  @Get(':productId')  // Changed 'product_id' to 'productId' for consistency
  async findOne(@Param('productId') productId: string): Promise<Product> {
    return this.productService.findOne(productId);
  }

  /*-----------------> Update an existing product by ID: <-----------------*/
  @Put(':productId')  // Changed 'product_id' to 'productId' for consistency
  async update(
    @Param('productId') productId: string,  // Changed 'product_id' to 'productId' for consistency
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<{ message: string; product: Product }> {
    return this.productService.update(productId, updateProductDto);
  }

  /*----------------->  Delete a product by ID: <-----------------*/
  @Delete(':productId')  // Changed 'product_id' to 'productId' for consistency
  async delete(@Param('productId') productId: string): Promise<{ message: string }> {
    return this.productService.delete(productId);
  }

  /*----------------->  Delete Product Variable by ID: <-----------------*/
  @Delete(':productId/product-variables/:variableId')  // Updated parameter names to match consistent naming
  async deleteProductVariable(
    @Param('productId') productId: string,
    @Param('variableId') variableId: string,
  ): Promise<{ message: string }> {
    return this.productService.deleteProductVariable(productId, variableId);
  }

  /*----------------->  Delete All Product Variables by Product ID: <-----------------*/
  @Delete(':productId/product-variables')  // Updated parameter names to match consistent naming
  async deleteAllProductVariables(
    @Param('productId') productId: string,
  ): Promise<{ message: string }> {
    return this.productService.deleteAllProductVariables(productId);
  }

  /*----------------->  Add a Product Variable: <-----------------*/
  @Post(':productId/product-variables')  // Updated parameter names to match consistent naming
  async addProductVariable(
    @Param('productId') productId: string,
    @Body() createProductVariableDto: CreateProductVariableDto,
  ): Promise<{ message: string; productVariable: ProductVariable }> {
    return this.productService.addProductVariable(productId, createProductVariableDto);
  }

  /*-----------------> Update a Product Variable by ID: <-----------------*/
  @Put(':productId/product-variables/:variableId')  // Updated parameter names to match consistent naming
  async updateProductVariable(
    @Param('productId') productId: string,
    @Param('variableId') variableId: string,
    @Body() updateProductVariableDto: UpdateProductVariableDto,
  ): Promise<{ message: string; productVariable: ProductVariable }> {
    return this.productService.updateProductVariable(
      productId,
      variableId,
      updateProductVariableDto,
    );
  }
}
