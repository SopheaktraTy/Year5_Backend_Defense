import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-products.dto';
import { UpdateProductDto } from './dto/update-products.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products) private productRepository: Repository<Products>,
  ) {}

  // Create a new product
  create(createProductDto: CreateProductDto): Promise<Products> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  // Get all products with their sizes
  findAll(): Promise<Products[]> {
    return this.productRepository.find({ relations: ['sizes'] }); // Corrected syntax here
  }

  // Get a product by id
  async findOne(id: string): Promise<Products> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['sizes'] });
    if (!product) {
      throw new NotFoundException('មិនឃើញផលិតផល'); // Product not found
    }
    return product;
  }

  //Update a product id
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Products> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['sizes'] });
    if (!product) {
      throw new NotFoundException('មិនឃើញផលិតផល');
    }
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }
  //remove a product by id
  async remove(id: string): Promise<Products>{
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('មិនឃើញផលិតផល');
    }
    return product;
  }
}
