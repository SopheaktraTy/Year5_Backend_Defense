import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<{ message: string; category: Category }> {
  try {
    const existingCategory = await this.categoryRepository.findOne({ where: { name: createCategoryDto.name } });
    if (existingCategory) {
      throw new ConflictException(`Category with name "${createCategoryDto.name}" already exists.`);
    }
    const category = this.categoryRepository.create(createCategoryDto);
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
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { message: 'Category removed successfully' };
  }
}
