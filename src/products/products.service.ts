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

/*------------ Create a Product ------------*/
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

/*------------ Get All Product------------*/
async findAll(): Promise<Product[]> {
  return this.productRepository.find({
    relations: ['product_variables', 'category'],
  });
}

/*------------ Get One Product ------------*/
async findOne(id: string): Promise<Product> {
  const product = await this.productRepository.findOne({
    where: { id },
    relations: ['product_variables', 'category'],
  });
  if (!product) throw new NotFoundException('Product not found');
  return product;
}

/*------------ Update a Product ------------*/
async update(
  id: string,
  updateProductDto: UpdateProductDto,
): Promise<{ message: string; product?: Product }> {
  const { productVariables, categoryId, productName, originalPrice, discountPercentageTag, ...rest } = updateProductDto;

  // Fetch the existing product by id with related product_variables
  const product = await this.productRepository.findOne({
    where: { id },
    relations: ['product_variables', 'category'],
  });

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  // Check if the product name is being changed and ensure it's unique
  if (productName && productName !== product.product_name) {
    const existingProduct = await this.productRepository.findOne({ where: { product_name: productName } });
    if (existingProduct) {
      throw new BadRequestException(`Product with name "${productName}" already exists.`);
    }
  }

  // Update category if the categoryId is provided
  if (categoryId !== undefined) {
    if (categoryId === null || categoryId === '') {
      product.category = null; // Clear the category if null/empty
    } else {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }
      product.category = category;
    }
  }

  // Update other product fields if provided
  if (productName !== undefined) product.product_name = productName;
  if (originalPrice !== undefined && originalPrice !== null) product.original_price = originalPrice;
  if (discountPercentageTag !== undefined && discountPercentageTag !== null) {
    product.discount_percentage_tag = discountPercentageTag;
  }
  
  Object.assign(product, rest);

  // Merge product variables by size and sum quantities if provided
  if (productVariables) {
    const mergedVariables = productVariables.reduce<Record<string, { size: string; quantity: number }>>(
      (acc, curr) => {
        const sizeKey = curr.size.trim().toLowerCase();
        if (acc[sizeKey]) {
          acc[sizeKey].quantity += curr.quantity;
        } else {
          acc[sizeKey] = { size: curr.size, quantity: curr.quantity };
        }
        return acc;
      },
      {},
    );

    // Delete old product variables using QueryBuilder
    await this.productVariableRepository.createQueryBuilder()
      .delete()
      .where('product_id = :id', { id }) // Use the correct foreign key reference
      .execute();

    // Create new merged product variables
    product.product_variables = Object.values(mergedVariables).map(variable =>
      this.productVariableRepository.create(variable),
    );
  }

  // Calculate total quantity from the updated product variables
  product.total_quantity = product.product_variables
    ? product.product_variables.reduce((sum, pv) => sum + pv.quantity, 0)
    : 0;

  // Calculate discounted price if applicable
  if (
    typeof product.discount_percentage_tag === 'number' &&
    product.discount_percentage_tag >= 0 &&
    product.discount_percentage_tag <= 100 &&
    typeof product.original_price === 'number'
  ) {
    const discountFactor = (100 - product.discount_percentage_tag) / 100;
    product.discounted_price = parseFloat(
      (product.original_price * discountFactor).toFixed(2),
    );
  } else {
    product.discounted_price = product.original_price;
  }

  // Save the updated product
  const updatedProduct = await this.productRepository.save(product);

  return {
    message: 'Product updated successfully!',
    product: updatedProduct,
  };
}



/*------------ Remove a Product ------------*/
async remove(id: string): Promise<{ message: string }> {
  // Fetch the product with its related product_variables
  const product = await this.productRepository.findOne({
    where: { id },
    relations: ['product_variables'],
  });

  if (!product) throw new NotFoundException('Product not found');

  // Delete related product variables first
  if (product.product_variables && product.product_variables.length > 0) {
    // Delete all product variables related to the product
    await this.productVariableRepository.remove(product.product_variables);
  }

  // Delete the product itself
  await this.productRepository.remove(product);

  return { message: 'Product and related product variables deleted successfully!' };
}




}