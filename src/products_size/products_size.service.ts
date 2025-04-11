import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductsSizeDto } from './dto/create-products-size.dto';
import { UpdateProductsSizeDto } from './dto/update-products-size.dto';
import { Products_Sizes } from '../products_size/entities/product_size.entity';

@Injectable()
export class ProductSizeService {
  constructor(
      @InjectRepository(Products_Sizes) private productRepository: Repository<Products_Sizes>,
    ) {}
   // Create a new products_size
  async create(createProductsSizeDto: CreateProductsSizeDto): Promise<{ message: string; products_size: Products_Sizes }> {
    const size = this.productRepository.create(createProductsSizeDto);
    const savedProduct_size = await this.productRepository.save(size);

    return {
      message: '✅ ទំហំនៃផលិតផលបង្កើតដោយជោគជ័យ!',
      products_size: savedProduct_size
    };
  }

  // Get all products_sizes
  findAll(): Promise<Products_Sizes[]> {
    return this.productRepository.find(); // Corrected syntax here
  }

  // Get a product by id
  async findOne(id: string): Promise<Products_Sizes> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['productID'] });
    if (!product) {
      throw new NotFoundException('❌ មិនឃើញផលិតផល'); // Product not found
    }
    return product;
  }


  update(id: number, updateProductSizeDto: UpdateProductsSizeDto) {
    return `This action updates a #${id} productSize`;
  }

  remove(id: number) {
    return `This action removes a #${id} productSize`;
  }
}
