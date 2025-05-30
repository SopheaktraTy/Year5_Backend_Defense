import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariable } from './entities/product_variables.entity';
import { Category } from '../categories/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(ProductVariable) private productVariableRepository: Repository<ProductVariable>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  // Create a new product with optional product variables
  async create(createProductDto: CreateProductDto): Promise<{ message: string; product?: Product }> {
    const { productVariables, category_id, name, ...productData } = createProductDto;

    // Validate category if category_id is provided
    const category = category_id
      ? await this.categoryRepository.findOne({ where: { id: category_id } })
      : null;

    if (category_id && !category) {
      throw new NotFoundException(`Category with id ${category_id} not found`);
    }

    // Check if a product with the same name already exists (ignores category)
    const existingProduct = await this.productRepository.findOne({ where: { name } });
    if (existingProduct) {
      return { message: `Product with name "${name}" already exists.` };
    }

    // Create new product entity
    const product = this.productRepository.create({
      ...productData,
      name,
      category,
    });

    // Create product variables if provided
    if (productVariables && productVariables.length > 0) {
      product.productVariables = productVariables.map(variable =>
        this.productVariableRepository.create(variable),
      );

      // Calculate total quantity by summing all size quantities
      product.total_quantity = product.productVariables.reduce(
        (sum, pv) => sum + pv.quantity,
        0,
      );
    } else {
      product.total_quantity = 0;
    }

    // Save product with cascade save for variables
    const savedProduct = await this.productRepository.save(product);

    return {
      message: 'Product created successfully!',
      product: savedProduct,
    };
  }

  // Get all products with their product variables and category
  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['productVariables', 'category'],
    });
  }

  // Get a single product by ID with product variables and category
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['productVariables', 'category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Update product and product variables
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<{ message: string; product: Product }> {
    // Find existing product with relations
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['productVariables', 'category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { productVariables, category_id, ...productData } = updateProductDto;

    // Handle category update if category_id is provided
    if (category_id !== undefined) {
      if ([null, '', 0, false].includes(category_id)) {
        // Remove category if explicitly set to null, empty, 0, or false
        product.category = null;
      } else {
        // Find and assign new category
        const category = await this.categoryRepository.findOne({ where: { id: category_id } });
        if (!category) {
          throw new NotFoundException(`Category with id ${category_id} not found`);
        }
        product.category = category;
      }
    }

    // Update other product fields
    Object.assign(product, productData);

    // Update product variables if provided
    if (productVariables) {
      // Remove existing variables
      await this.productVariableRepository.delete({ product: { id } });

      // Create new variables and assign
      product.productVariables = productVariables.map(variable =>
        this.productVariableRepository.create(variable),
      );
    }

    // Recalculate total quantity
    product.total_quantity = product.productVariables
      ? product.productVariables.reduce((sum, pv) => sum + pv.quantity, 0)
      : 0;

    // Save product with cascaded variables
    const updatedProduct = await this.productRepository.save(product);

    return {
      message: 'Product updated successfully!',
      product: updatedProduct,
    };
  }

  // Delete product and its variables (cascade handles variables)
  async remove(id: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['productVariables'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.delete(id);

    return { message: 'Product deleted successfully!' };
  }
}
