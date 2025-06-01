import { Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariable } from './entities/product_variable.entity';
import { Category } from '../categories/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(ProductVariable) private productVariableRepository: Repository<ProductVariable>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<{ message: string; product?: Product }> {
    const { productVariables, categoryId, productName, originalPrice, discountPercentageTag, ...rest } = createProductDto;

    const category = categoryId
      ? await this.categoryRepository.findOne({ where: { id: categoryId } })
      : null;
    if (categoryId && !category) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }

    // Check duplicate product name using entity field name
    const existingProduct = await this.productRepository.findOne({ where: { product_name: productName } });
    if (existingProduct) {
      return { message: `Product with name "${productName}" already exists.` };
    }

    const product = this.productRepository.create({
      ...rest,
      product_name: productName,
      original_price: originalPrice,
      discount_percentage_tag: discountPercentageTag,
      category,
    });

    if (productVariables && productVariables.length > 0) {
      product.product_variables = productVariables.map(variable =>
        this.productVariableRepository.create(variable),
      );
      product.total_quantity = product.product_variables.reduce((sum, pv) => sum + pv.quantity, 0);
    } else {
      product.total_quantity = 0;
    }

    if (
      typeof discountPercentageTag === 'number' &&
      discountPercentageTag >= 0 &&
      discountPercentageTag <= 100
    ) {
      const discountFactor = (100 - discountPercentageTag) / 100;
      product.discounted_price = parseFloat((originalPrice * discountFactor).toFixed(2));
    } else {
      product.discounted_price = null;
    }

    const savedProduct = await this.productRepository.save(product);
    return {
      message: 'Product created successfully!',
      product: savedProduct,
    };
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['product_variables', 'category'],
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['product_variables', 'category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<{ message: string; product?: Product }> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['product_variables', 'category'],
    });
    if (!product) throw new NotFoundException('Product not found');
  
    const { productVariables, categoryId, productName, originalPrice, discountPercentageTag, ...rest } = updateProductDto;
  
    // If productName is unchanged, return message (optional early return)
    if (productName === product.product_name) {
      return {
        message: 'The product name is the same as the current one. No update needed.',
        product,
      };
    }
  
    // Check duplicate product name if changed
    if (productName && productName !== product.product_name) {
      const existing = await this.productRepository.findOne({ where: { product_name: productName } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Product with name "${productName}" already exists.`);
      }
    }
  
    // ...rest of your update logic
    if (categoryId !== undefined) {
      if ([null, '', 0, false].includes(categoryId)) {
        product.category = null;
      } else {
        const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) throw new NotFoundException(`Category with id ${categoryId} not found`);
        product.category = category;
      }
    }
  
    Object.assign(product, {
      product_name: productName,
      original_price: originalPrice,
      discount_percentage_tag: discountPercentageTag,
      ...rest,
    });
  
    if (productVariables) {
      await this.productVariableRepository.delete({ product: { id } });
      product.product_variables = productVariables.map(variable =>
        this.productVariableRepository.create(variable),
      );
    }
  
    product.total_quantity = product.product_variables
      ? product.product_variables.reduce((sum, pv) => sum + pv.quantity, 0)
      : 0;
  
    if (
      typeof product.discount_percentage_tag === 'number' &&
      product.discount_percentage_tag >= 0 &&
      product.discount_percentage_tag <= 100
    ) {
      const discountFactor = (100 - product.discount_percentage_tag) / 100;
      product.discounted_price = parseFloat(
        (product.original_price * discountFactor).toFixed(2),
      );
    } else {
      product.discounted_price = null;
    }
  
    const updatedProduct = await this.productRepository.save(product);
  
    return {
      message: 'Product updated successfully!',
      product: updatedProduct,
    };
  }
  

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['product_variables'],
    });
    if (!product) throw new NotFoundException('Product not found');

    await this.productRepository.delete(id);
    return { message: 'Product deleted successfully!' };
  }
}
