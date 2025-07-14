import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

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

  @Put('/update-a-category/:categoryId')
  update(@Param('categoryId') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete('/remove-a-category/:categoryId')
  remove(@Param('categoryId') id: string) {
    return this.categoriesService.remove(id);
  }
}
