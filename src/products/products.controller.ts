/*NestJS imports*/
import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

/*Service*/
import { ProductsService } from './products.service';

/*DTOs*/
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductVariableDto } from './dto/create-product-variable.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariableDto } from './dto/update-product-variable.dto';

/*Guards*/
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

/*Decorators*/
import { Permissions } from 'src/roles/decorators/permissions.decorator';

/*Enums*/
import { Resource } from 'src/roles/enums/resource.enum'
import { Action } from 'src/roles/enums/action.enum';


@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiBearerAuth('Access-Token')
@Controller('Products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}
  
  //Product Endpoints
  @Permissions([{resource: Resource.PRODUCTS, actions: [Action.CREATE] }])
  @Post('add-a-product')
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProductWithProductVariable(createProductDto);
  }
  
  @Permissions([{resource: Resource.PRODUCTS, actions: [Action.READ] }])
  @Get('view-all-products')
  async findAll() {
    return this.productService.findAll();
  }

  @Permissions([{resource: Resource.PRODUCTS, actions: [Action.READ] }])
  @Get('/view-a-product/:productId')  
  async findOne(@Param('productId') productId: string) {
    return this.productService.findOne(productId);
  }

  @Permissions([{resource: Resource.PRODUCTS, actions: [Action.UPDATE] }])
  @Put('/update-a-product/:productId')  
  async update(
    @Param('productId') productId: string,  
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(productId, updateProductDto);
  }

  @Permissions([{resource: Resource.PRODUCTS, actions: [Action.DELETE] }])
  @Delete('/remove-a-product/:productId') 
  async delete(@Param('productId') productId: string): Promise<{ message: string }> {
    return this.productService.delete(productId);
  }
  

  //Product Variable Endpoints
  @Permissions([{resource: Resource.PRODUCT_VARIABLES, actions: [Action.CREATE] }])
  @Post('/add-product-variables/:productId')
  async createProductVariable(@Param('productId') productId: string, @Body() createProductVariableDto: CreateProductVariableDto,) {
    return this.productService.createProductVariable(productId, createProductVariableDto);
  }
  
  @Permissions([{resource: Resource.PRODUCT_VARIABLES, actions: [Action.UPDATE] }])
  @Put('/update-a-product-variable/:variableId') 
  async updateProductVariable(
    @Param('variableId') variableId: string,  
    @Body() updateProductVariableDto: UpdateProductVariableDto,) {
    return this.productService.updateProductVariable(variableId, updateProductVariableDto);
  }

  @Permissions([{resource: Resource.PRODUCT_VARIABLES, actions: [Action.DELETE] }])
  @Delete('/remove-a-product-variable/:variableId')
  async deleteProductVariable(@Param('variableId') variableId: string) {
    return this.productService.deleteProductVariable(variableId);
  }
}
 