/*Nestjs Hyper Class*/
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

/*Service*/
import { CategoriesService } from './categories.service';

/*DTO*/
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/*Guard*/
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

/*Decorators*/
import { Permissions } from 'src/roles/decorators/permissions.decorator';

/*Enums*/
import { Resource } from 'src/roles/enums/resource.enum'
import { Action } from 'src/roles/enums/action.enum';



@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  
  //Category Endpoints
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.CATEGORYS, actions: [Action.CREATE] }])
  @Post('add-a-category')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
  
 
  @Get('view-all-categories')
  findAll() {
    return this.categoriesService.findAll();
  }
  
  
  @Get('/view-a-category/:categoryId')
  findOne(@Param('categoryId') id: string) {
    return this.categoriesService.findOne(id);
  }
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.CATEGORYS, actions: [Action.UPDATE] }])
  @Put('/update-a-category/:categoryId')
  update(@Param('categoryId') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.CATEGORYS, actions: [Action.DELETE] }])
  @Delete('/remove-a-category/:categoryId')
  remove(@Param('categoryId') id: string) {
    return this.categoriesService.remove(id);
  }
}
