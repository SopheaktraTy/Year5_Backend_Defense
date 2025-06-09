import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  /*------------ Create categories ------------*/
  async create(createCategoryDto: CreateCategoryDto): Promise<{ message: string; category: Category }> {
    try {
      // Check if the category already exists
      const existingCategory = await this.categoryRepository.findOne({
        where: { category_name: createCategoryDto.categoryName },
      });

      if (existingCategory) {
        throw new ConflictException(`Category with name "${createCategoryDto.categoryName}" already exists.`);
      }

      // Use categoryRepository.create() to prepare a new category entity
      const category = this.categoryRepository.create({
        category_name: createCategoryDto.categoryName, // Match property name here
        image: createCategoryDto.image,
        description: createCategoryDto.description,
      });

      // Save the category to the database and ensure it's a single entity (not an array)
      const savedCategory = await this.categoryRepository.save(category);

      // Return the saved category and a success message
      return {
        message: 'Category created successfully',
        category: savedCategory, // Return saved category entity
      };
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  }

/*------------ Get All categories ------------*/
async findAll(): Promise<Category[]> {
  return await this.categoryRepository.find({
    relations: ['products'], // Eager load the products with the category
  });
}

/*------------ Get One category ------------*/
async findOne(id: string): Promise<Category> {
  const category = await this.categoryRepository.findOne({
    where: { id },
    relations: ['products'],
  });

  if (!category) {
    throw new NotFoundException(`Category with ID "${id}" not found.`);
  }

  return category;
}

  /*------------ Update category ------------*/
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{ message: string; category: Category }> {
    try {
      // Find the category to update
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ['products'],
      });
  
      if (!category) {
        throw new NotFoundException(`Category with ID "${id}" not found.`);
      }
  
      // Update the category fields with the new data
      category.category_name = updateCategoryDto.categoryName || category.category_name;
      category.image = updateCategoryDto.image || category.image;  // Matches the field name in the entity
      category.description = updateCategoryDto.description || category.description;
  
      // Save the updated category
      const savedCategory = await this.categoryRepository.save(category);
  
      return {
        message: 'Category updated successfully',
        category: savedCategory,
      };
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  }
  


  /*------------ Remove category ------------*/
  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);
  
    // This will produce: UPDATE "products" SET "category_id" = NULL WHERE "category_id" = $1
    await this.productRepository.update(
      { category: { id } },      // find all products whose category.id = the given id
      { category: null },        // set their category relation to null
    );
  
    await this.categoryRepository.remove(category);
  
    return { message: 'Category removed successfully, and products updated' };
  }
  
}
