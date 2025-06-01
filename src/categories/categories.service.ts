import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity'
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<{ message: string; category: Category }> {
    try {
      const existingCategory = await this.categoryRepository.findOne({
        where: { category_name: createCategoryDto.categoryName },
      });
      if (existingCategory) {
        throw new ConflictException(`Category with name "${createCategoryDto.categoryName}" already exists.`);
      }
  
      // Map categoryName (DTO) to category_name (entity)
      const category = this.categoryRepository.create({
        category_name: createCategoryDto.categoryName,
        image: createCategoryDto.image,
        description: createCategoryDto.description,
      });
  
      const savedCategory = await this.categoryRepository.save(category);
      return {
        message: 'Category created successfully',
        category: savedCategory,
      };
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  }
  


  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({ relations: ['products'] });
  }

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

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{ message: string; category: Category }> {
    try {
      const category = await this.categoryRepository.preload({
        id,
        ...updateCategoryDto,
      });
      if (!category) {
        throw new NotFoundException(`Category with ID "${id}" not found.`);
      }
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
  

 async remove(id: string): Promise<{ message: string }> {
  const category = await this.findOne(id);

  // Set category to null for all products having this category
  await this.productRepository
    .createQueryBuilder()
    .update()
    .set({ category: null })
    .where('categoryId = :id', { id })
    .execute();
  // Now remove the category
  await this.categoryRepository.remove(category);
  return { message: 'Category removed successfully, and products updated' };
}
}
