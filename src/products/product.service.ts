import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  // Create a new product
  async create(createProductDto: CreateProductDto): Promise<{ message: string; products: Product }> {
    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    return {
      message: '✅ ផលិតផលបានបង្កើតដោយជោគជ័យ!',
      products: savedProduct
    };
  }
  // Get all products with their sizes
  findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['sizes'] }); // Corrected syntax here
  }

  // Get a product by id with their sizes
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['sizes'] });
    if (!product) {
      throw new NotFoundException('❌ មិនឃើញផលិតផល'); // Product not found
    }
    return product;
  }

  //Update a product id with their sizes
  async update(id: string, updateProductDto: UpdateProductDto): Promise<{ message: string; product: Product }> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['sizes'] });
    if (!product) {
      throw new NotFoundException('❌ មិនឃើញផលិតផល');
    }
    Object.assign(product, updateProductDto);
    const updated = await this.productRepository.save(product);
    return {
      message: '✅ ផលិតផលបានកែប្រែដោយជោគជ័យ!',
      product: updated
    };
  }

  //remove a product by id with their sizes
  async remove(id: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['sizes'] });
    if (!product) {
      throw new NotFoundException('❌ មិនឃើញផលិតផល');
    }
    await this.productRepository.delete(id);
    return { message: '🗑️ ផលិតផលត្រូវបានលុបដោយជោគជ័យ!' };
  }
}


