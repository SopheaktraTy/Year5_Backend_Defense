import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Products) private productRepository: Repository<Products>,
  ) {}

  create(createProductDto: CreateProductDto) : Promise<Products> {
    const product = this.productRepository.create(createProductDto)
    return this.productRepository.save(product);
  }

  findAll(): Promise<Products[]> {
    return this.productRepository.find();
  }
}
