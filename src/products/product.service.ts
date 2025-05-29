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
  async create(createProductDto: CreateProductDto): Promise<{ message: string; product: Product }> {
    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    return {
      message: 'Product created successfully!',
      product: savedProduct,
    };
  }

  // Get all products with their sizes
  findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['sizes'] });
  }

  // Get a product by id with their sizes
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['sizes'] });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // Update a product by id with their sizes
  async update(id: string, updateProductDto: UpdateProductDto): Promise<{ message: string; product: Product }> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['sizes'] });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    Object.assign(product, updateProductDto);
    const updated = await this.productRepository.save(product);
    return {
      message: 'Product updated successfully!',
      product: updated,
    };
  }

  // Remove a product by id with their sizes
  async remove(id: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['sizes'] });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.delete(id);
    return { message: 'Product deleted successfully!' };
  }
}
