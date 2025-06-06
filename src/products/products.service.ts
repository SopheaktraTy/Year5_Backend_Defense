import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariable } from './entities/product_variable.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariableDto } from './dto/create-product-variable.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariable) private readonly productVariableRepository: Repository<ProductVariable>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  /*-----------------> Create a new product <-----------------*/
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if the category exists
    if (createProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: createProductDto.categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Ensure product name is unique
    const existingProduct = await this.productRepository.findOne({ where: { product_name: createProductDto.productName } });
    if (existingProduct) {
      throw new BadRequestException('Product name already exists');
    }

    // Calculate discounted price if discount percentage is provided
    let discountedPrice = createProductDto.originalPrice;
    const discountPercentage = createProductDto.discountPercentageTag ?? 0;
    if (discountPercentage > 0) {
      discountedPrice = createProductDto.originalPrice * (1 - discountPercentage / 100);
    }

    // Create the product with the provided details
    const product = this.productRepository.create({
      product_name: createProductDto.productName,
      image: createProductDto.image,
      description: createProductDto.description,
      original_price: createProductDto.originalPrice,
      discounted_price: discountedPrice,
      total_quantity: 0,  // Initialize total quantity, will calculate later
      discount_percentage_tag: discountPercentage, // Store the discount percentage
    });

    // Save the product to get the ID
    const savedProduct = await this.productRepository.save(product);

    // Calculate total quantity and check for size duplication
    let totalQuantity = 0;
    for (const variable of createProductDto.productVariables) {
      const normalizedSize = variable.size.toLowerCase();  // Normalize size to lowercase for case-insensitive comparison

      // Check if the size already exists for the product (case-insensitive)
      const existingSize = await this.productVariableRepository.findOne({
        where: { size: normalizedSize, product: { id: savedProduct.id } },
      });

      if (existingSize) {
        // If size already exists, merge the quantities
        existingSize.quantity += variable.quantity; // Add the new quantity to the existing quantity
        await this.productVariableRepository.save(existingSize);  // Save the updated variable
      } else {
        // If size does not exist, create a new product variable
        const productVariable = this.productVariableRepository.create({
          size: normalizedSize,  // Store the normalized (lowercase) size
          quantity: variable.quantity,
          product: savedProduct,
        });

        await this.productVariableRepository.save(productVariable);
      }

      totalQuantity += variable.quantity;  // Add to the total quantity
    }

    // Update total quantity of the product
    savedProduct.total_quantity = totalQuantity;
    await this.productRepository.save(savedProduct);

    // Include product variables in the returned product object
    savedProduct.product_variables = await this.productVariableRepository.find({
      where: { product: { id: savedProduct.id } },
    });

    return savedProduct;  // Return product with product variables
  }

  /*-----------------> Find All Products <-----------------*/
  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['product_variables', 'category'], // Optionally include related entities
    });
  }

  /*----------------->  Find Product by ID: <-----------------*/
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['product_variables', 'category'], // Include related entities
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Normalize the sizes for case-insensitive comparison
    product.product_variables.forEach(variable => {
      variable.size = variable.size.toLowerCase();
    });

    return product;
  }

  /*----------------->  Update Product by ID: <-----------------*/
  async update(id: string, updateProductDto: UpdateProductDto): Promise<{ message: string; product: Product }> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['product_variables'] });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Ensure product name is unique if it's updated
    if (updateProductDto.productName && updateProductDto.productName !== product.product_name) {
      const existingProduct = await this.productRepository.findOne({
        where: { product_name: updateProductDto.productName },
      });

      if (existingProduct) {
        throw new BadRequestException('Product name already exists');
      }
    }

    // Set originalPrice to the current price if it's not provided in updateProductDto
    const originalPrice = updateProductDto.originalPrice ?? product.original_price;

    // Calculate discounted price if discount percentage is provided
    let discountedPrice = originalPrice;
    const discountPercentage = updateProductDto.discountPercentageTag ?? 0;

    if (discountPercentage > 0) {
      discountedPrice = originalPrice * (1 - discountPercentage / 100);
    }

    // Ensure discountedPrice is always a valid number
    discountedPrice = discountedPrice || 0; // Default to 0 if undefined

    // Apply updates to the product
    Object.assign(product, updateProductDto);
    product.discounted_price = discountedPrice;

    // Calculate total quantity and total price
    let totalQuantity = 0;

    for (const variable of product.product_variables) {
      totalQuantity += variable.quantity;
    }

    // Update total quantity of the product
    product.total_quantity = totalQuantity;

    // Save updated product
    await this.productRepository.save(product);

    return {
      message: `Product with ID ${id} updated successfully`,
      product, // Return the updated product
    };
  }

  /*----------------->  Delete Product by ID: <-----------------*/
  async delete(id: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['product_variables'], // Include related product variables
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Delete associated product variables if necessary
    await this.productVariableRepository.remove(product.product_variables);

    // Delete the product
    await this.productRepository.remove(product);

    return { message: `Product with ID ${id} deleted successfully` };  // Return success message
  }

  /*----------------->  Update Product variable by ID: <-----------------*/
  async updateProductVariable(productId: string, variableId: string, updateProductVariableDto: CreateProductVariableDto): Promise<{ message: string; productVariable: ProductVariable }> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const productVariable = await this.productVariableRepository.findOne({
      where: { id: variableId, product: { id: productId } },
    });

    if (!productVariable) {
      throw new NotFoundException(`Product variable with ID ${variableId} not found for this product`);
    }

    // Update product variable
    Object.assign(productVariable, updateProductVariableDto);

    const updatedProductVariable = await this.productVariableRepository.save(productVariable);

    return {
      message: `Product variable with ID ${variableId} updated successfully`,
      productVariable: updatedProductVariable,
    };
  }

  /*----------------->  Add Product variable by ID: <-----------------*/
  async addProductVariable(productId: string, createProductVariableDto: CreateProductVariableDto): Promise<{ message: string; productVariable: ProductVariable }> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Create and save new product variable (size variant)
    const productVariable = this.productVariableRepository.create({
      ...createProductVariableDto,
      product,
    });

    const savedProductVariable = await this.productVariableRepository.save(productVariable);

    return {
      message: `Product variable for product with ID ${productId} added successfully`,
      productVariable: savedProductVariable,
    };
  }

  /*----------------->  Delete Product Variable by ID: <-----------------*/ 
  async deleteProductVariable(productId: string, variableId: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['product_variables'], // Ensure we load the product's product variables
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Find the specific product variable to delete
    const productVariable = product.product_variables.find(variable => variable.id === variableId);

    if (!productVariable) {
      throw new NotFoundException(`Product variable with ID ${variableId} not found for this product`);
    }

    // Delete the product variable
    await this.productVariableRepository.remove(productVariable);

    return { message: `Product variable with ID ${variableId} deleted successfully` };  // Return message
  }

  /*----------------->  Delete All Product Variables by Product ID: <-----------------*/ 
  async deleteAllProductVariables(productId: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['product_variables'], // Ensure we load all product variables
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Delete all associated product variables
    await this.productVariableRepository.remove(product.product_variables);

    return { message: `All product variables for product with ID ${productId} deleted successfully` };  // Return message
  }
}
