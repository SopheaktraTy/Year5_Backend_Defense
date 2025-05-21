import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { UpdateProductSizeDto } from './dto/update-product-size.dto';
import { Product_Size } from './entities/product_size.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ProductSizeService {
  constructor(
      @InjectRepository(Product_Size) private productSizeRepository: Repository<Product_Size>,
      @InjectRepository(Product) private productRepository: Repository<Product>, // Injecting Products repository
    ) {}


// Create a new product_sizes
async create(createProductSizeDto: CreateProductSizeDto): Promise<{ message: string; product_size: Product_Size }> {
  // Check if the product exists
  const product = await this.productRepository.findOne({
    where: { id: createProductSizeDto.product_id }
  });
  if (!product) {
    throw new NotFoundException('❌ មិនឃើញផលិតផល'); // Product not found
  }
  // Create a new Product_Sizes entry
  const productSize = this.productSizeRepository.create(createProductSizeDto);
  // Explicitly set the product relationship (product object)
  productSize.product = product;  // This sets the product in the Product_Sizes entity
  // Save the product size
  const savedProductSize = await this.productSizeRepository.save(productSize);
  return {
    message: '✅ ទំហំនៃផលិតផលបង្កើតដោយជោគជ័យ!',
    product_size: savedProductSize,
  };
}

  // // Get all product_sizes
  // findAll(): Promise<Product_Sizes[]> {
  //   return this.productRepository.find(); // Corrected syntax here
  // }

  // // Get a product_sizes by id
  // async findOne(id: string): Promise<Product_Sizes> {
  //   const product = await this.productRepository.findOne({ where: { id }, relations: ['product_id'] });
  //   if (!product) {
  //     throw new NotFoundException('❌ មិនឃើញផលិតផល'); // Product not found
  //   }
  //   return product;
  // }


  // // update(id: number, updateProductSizeDto: UpdateProductsSizeDto) {
  // //   return `This action updates a #${id} productSize`;
  // // }


  // remove(id: number) {
  //   return `This action removes a #${id} productSize`;
  // }
}

