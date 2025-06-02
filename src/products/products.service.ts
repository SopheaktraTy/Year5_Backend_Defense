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

/*------------ Create ------------*/
  async create(
  createProductDto: CreateProductDto,
): Promise<{ message: string; product?: Product }> {
  const { productVariables, categoryId, productName, originalPrice, discountPercentageTag, ...rest } = createProductDto;

  // Find category if ID provided
  const category = categoryId
    ? await this.categoryRepository.findOne({ where: { id: categoryId } })
    : null;
  if (categoryId && !category) {
    throw new NotFoundException(`Category with id ${categoryId} not found`);
  }

  // Check for duplicate product name
  const existingProduct = await this.productRepository.findOne({ where: { product_name: productName } });
  if (existingProduct) {
    return { message: `Product with name "${productName}" already exists.` };
  }

  // Merge duplicates by size, summing quantities
  const mergedVariables = productVariables && productVariables.length > 0
    ? productVariables.reduce<Record<string, { size: string; quantity: number }>>((acc, curr) => {
        const sizeKey = curr.size.trim().toLowerCase();
        if (acc[sizeKey]) {
          acc[sizeKey].quantity += curr.quantity;
        } else {
          acc[sizeKey] = { size: curr.size, quantity: curr.quantity };
        }
        return acc;
      }, {})
    : {};

  // Create product entity
  const product = this.productRepository.create({
    ...rest,
    product_name: productName,
    original_price: originalPrice,
    discount_percentage_tag: discountPercentageTag,
    category,
  });

  // Create product variables and calculate total quantity
  if (mergedVariables && Object.keys(mergedVariables).length > 0) {
    product.product_variables = Object.values(mergedVariables).map(variable =>
      this.productVariableRepository.create(variable),
    );
    product.total_quantity = product.product_variables.reduce((sum, pv) => sum + pv.quantity, 0);
  } else {
    product.total_quantity = 0;
  }

  // Calculate discounted price if applicable
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

  // Save product and return response
  const savedProduct = await this.productRepository.save(product);
  return {
    message: 'Product created successfully!',
    product: savedProduct,
  };
}

/*------------ Get All ------------*/
  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['product_variables', 'category'],
    });
  }

/*------------ Get One ------------*/
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['product_variables', 'category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

/*------------ Update ------------*/
  async update(
  id: string,
  updateProductDto: UpdateProductDto,
): Promise<{ message: string; product?: Product }> {
  // Load existing product with relations
  const product = await this.productRepository.findOne({
    where: { id },
    relations: ['product_variables', 'category'],
  });
  if (!product) throw new NotFoundException('Product not found');

  const { productVariables, categoryId, productName, originalPrice, discountPercentageTag, ...rest } = updateProductDto;

  // Check for duplicate product name if changed
  if (productName && productName !== product.product_name) {
    const existing = await this.productRepository.findOne({ where: { product_name: productName } });
    if (existing && existing.id !== id) {
      throw new BadRequestException(`Product with name "${productName}" already exists.`);
    }
  }

  // Update category or clear if null/empty
  if (categoryId !== undefined) {
    if (categoryId === null || categoryId === '') {
      product.category = null;
    } else {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) throw new NotFoundException(`Category with id ${categoryId} not found`);
      product.category = category;
    }
  }

  // Update other product fields
  Object.assign(product, {
    product_name: productName,
    original_price: originalPrice,
    discount_percentage_tag: discountPercentageTag,
    ...rest,
  });

  // Merge duplicate sizes and sum quantities before saving variables
  if (productVariables) {
    const mergedVariables = productVariables.reduce<Record<string, { size: string; quantity: number }>>((acc, curr) => {
      const sizeKey = curr.size.trim().toLowerCase();
      if (acc[sizeKey]) {
        acc[sizeKey].quantity += curr.quantity;
      } else {
        acc[sizeKey] = { size: curr.size, quantity: curr.quantity };
      }
      return acc;
    }, {});

    // Delete old product variables
    await this.productVariableRepository.delete({ product: { id } });

    // Create new merged product variables
    product.product_variables = Object.values(mergedVariables).map(variable =>
      this.productVariableRepository.create(variable),
    );
  }

  // Calculate total quantity from variables
  product.total_quantity = product.product_variables
    ? product.product_variables.reduce((sum, pv) => sum + pv.quantity, 0)
    : 0;

  // Calculate discounted price if discount is valid
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

  // Save updated product
  const updatedProduct = await this.productRepository.save(product);

  // Return response
  return {
    message: 'Product updated successfully!',
    product: updatedProduct,
  };
}

/*------------ remove ------------*/
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
