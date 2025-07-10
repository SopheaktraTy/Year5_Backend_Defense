import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariable } from './entities/product_variable.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariableDto } from './dto/update-product-variable.dto';
import { CreateProductVariableDto } from './dto/create-product-variable.dto';  
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariable) private readonly productVariableRepository: Repository<ProductVariable>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async createProductWithProductVariable(createProductDto: CreateProductDto): Promise<Product> {
    if (!createProductDto.productName) {
      throw new BadRequestException('Product name is required');
    }
  
    if (createProductDto.originalPrice == null) {
      throw new BadRequestException('Original price is required');
    }
  
    const existingProduct = await this.productRepository.findOne({
      where: { product_name: createProductDto.productName },
    });
  
    if (existingProduct) {
      throw new BadRequestException('Product name already exists');
    }
  
    let category: Category | null = null;
    if (createProductDto.categoryId) {
      category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category does not exist');
      }
    }
  
    // Check for duplicate sizes (case-sensitive)
    const sizeSet = new Set<string>();
    for (const variable of createProductDto.productVariables) {
      if (sizeSet.has(variable.size)) {
        throw new BadRequestException(`Duplicate size found: '${variable.size}'`);
      }
      sizeSet.add(variable.size);
    }
  
    // Calculate total quantity
    const totalQuantity = createProductDto.productVariables.reduce(
      (sum, variable) => sum + variable.quantity,
      0,
    );
  
    // Calculate discounted price
    let discountedPrice = createProductDto.originalPrice;
    if (createProductDto.discountPercentageTag) {
      const discount =
        (createProductDto.discountPercentageTag / 100) *
        createProductDto.originalPrice;
      discountedPrice = createProductDto.originalPrice - discount;
    }
  
    // Create and save product
    const newProduct = this.productRepository.create({
      product_name: createProductDto.productName,
      original_price: createProductDto.originalPrice,
      discounted_price: discountedPrice,
      total_quantity: totalQuantity,
      discount_percentage_tag: createProductDto.discountPercentageTag,
      category,
      ...createProductDto,
    });
  
    await this.productRepository.save(newProduct);
  
    // Save product variables
    for (const variable of createProductDto.productVariables) {
      const productVariable = this.productVariableRepository.create({
        size: variable.size,
        quantity: variable.quantity,
        product: newProduct,
      });
      await this.productVariableRepository.save(productVariable);
    }
  
    return this.productRepository.findOneOrFail({
      where: { id: newProduct.id },
      relations: ['product_variables', 'category'],
    });
  }

  async createProductVariable( productId: string, createProductVariableDto: CreateProductVariableDto,): Promise<Product> {
    // Step 1: Ensure product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
  
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  
    // Step 2: Check if a variable with the same size already exists for this product (live DB check)
    const existingVariable = await this.productVariableRepository.findOne({
      where: {
        product: { id: productId },
        size: createProductVariableDto.size,
      },
    });
  
    if (existingVariable) {
      throw new BadRequestException(
        `Product variable with size "${createProductVariableDto.size}" already exists`
      );
    }
  
    // Step 3: Create and save the new product variable
    const newProductVariable = this.productVariableRepository.create({
      size: createProductVariableDto.size,
      quantity: createProductVariableDto.quantity,
      product,
    });
  
    await this.productVariableRepository.save(newProductVariable);
  
    // Step 4: Recalculate total quantity from DB (not from stale relation)
    const allVariables = await this.productVariableRepository.find({
      where: { product: { id: productId } },
    });
  
    const totalQuantity = allVariables.reduce(
      (sum, variable) => sum + variable.quantity,
      0,
    );
  
    product.total_quantity = totalQuantity;
    await this.productRepository.save(product);
  
    // Step 5: Return the fresh product with full relations
    const updatedProduct = await this.productRepository.findOneOrFail({
      where: { id: productId },
      relations: ['product_variables', 'category'],
    });
  
    return updatedProduct;
  }
  
  async updateProduct(productId: string, updateProductDto: UpdateProductDto,): Promise<{ message: string; product: Product }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['product_variables', 'category'],
    });
  
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  
    // Check if product name is updated and unique
    if (
      updateProductDto.productName &&
      updateProductDto.productName !== product.product_name
    ) {
      const existingProduct = await this.productRepository.findOne({
        where: { product_name: updateProductDto.productName },
      });
      if (existingProduct) {
        throw new BadRequestException('Product name already exists');
      }
      product.product_name = updateProductDto.productName;
    }
  
    // Update original_price only if provided (including zero)
    if (updateProductDto.originalPrice !== undefined) {
      product.original_price = updateProductDto.originalPrice;
    }
  
    // Update discount_percentage_tag only if provided (including zero)
    if (updateProductDto.discountPercentageTag !== undefined) {
      product.discount_percentage_tag = updateProductDto.discountPercentageTag;
    }
  
    // Recalculate discounted_price based on original_price and discount_percentage_tag
    if (product.discount_percentage_tag) {
      const discount =
        (product.discount_percentage_tag / 100) * product.original_price;
      product.discounted_price = product.original_price - discount;
    } else {
      product.discounted_price = product.original_price;
    }
  
    // Update category if categoryId is provided
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category does not exist');
      }
      product.category = category;
    }
  
    // Recalculate total quantity from product variables
    const totalQuantity = product.product_variables.reduce(
      (sum, variable) => sum + variable.quantity,
      0,
    );
    product.total_quantity = totalQuantity;
  
    // Save product
    await this.productRepository.save(product);
  
    // Return updated product with relations
    const updatedProduct = await this.productRepository.findOneOrFail({
      where: { id: productId },
      relations: ['product_variables', 'category'],
    });
  
    return {
      message: 'Product updated successfully',
      product: updatedProduct,
    };
  }
  
  async updateProductVariable(
    productVariableId: string,
    updateDto: UpdateProductVariableDto,
  ): Promise<Product> {
    // 1. Find the product variable with its product relation
    const productVariable = await this.productVariableRepository.findOne({
      where: { id: productVariableId },
      relations: ['product'],
    });
  
    if (!productVariable) {
      throw new NotFoundException('Product variable not found');
    }
  
    // 2. If updating size, check if the new size already exists for the same product (excluding this variable)
    if (updateDto.size && updateDto.size !== productVariable.size) {
      const duplicate = await this.productVariableRepository.findOne({
        where: {
          product: { id: productVariable.product.id },
          size: updateDto.size,
        },
      });
  
      if (duplicate) {
        throw new BadRequestException(`Size "${updateDto.size}" already exists for this product.`);
      }
    }
  
    // 3. Update the product variable fields if provided
    if (updateDto.size !== undefined) productVariable.size = updateDto.size;
    if (updateDto.quantity !== undefined) productVariable.quantity = updateDto.quantity;
  
    // 4. Save the updated product variable to DB
    await this.productVariableRepository.save(productVariable);
  
    // 5. Reload all product variables for this product to get updated quantities
    const updatedVariables = await this.productVariableRepository.find({
      where: { product: { id: productVariable.product.id } },
    });
  
    // 6. Recalculate the total quantity based on fresh data
    const totalQuantity = updatedVariables.reduce(
      (sum, variable) => sum + variable.quantity,
      0,
    );
  
    // 7. Update and save the parent product's total_quantity
    const product = productVariable.product;
    product.total_quantity = totalQuantity;
    await this.productRepository.save(product);
  
    // 8. Return the updated product with relations
    return this.productRepository.findOneOrFail({
      where: { id: product.id },
      relations: ['product_variables', 'category'],
    });
  }
  

  async findAll(): Promise<Product[]> {
    const products = await this.productRepository.find({
      relations: ['product_variables', 'category'],
    });
  
    // Loop through each product to recalc and save
    for (const product of products) {
      // Recalculate total_quantity
      const totalQuantity = product.product_variables.reduce(
        (sum, variable) => sum + variable.quantity,
        0,
      );
      product.total_quantity = totalQuantity;
  
      // Recalculate discounted_price
      product.discounted_price = product.original_price;
      if (product.discount_percentage_tag) {
        const discount =
          (product.discount_percentage_tag / 100) * product.original_price;
        product.discounted_price = product.original_price - discount;
      }
  
      // Save updated product to DB
      await this.productRepository.save(product);
    }
  
    // Return updated products
    return products;
  }

  async findOne(productId: string): Promise<Product> {
    const validProductId = productId.replace(/"/g, '');
  
    const product = await this.productRepository.findOne({
      where: { id: validProductId },
      relations: ['product_variables', 'category'],
    });
  
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  
    // Recalculate total_quantity
    const totalQuantity = product.product_variables.reduce(
      (sum, variable) => sum + variable.quantity,
      0,
    );
    product.total_quantity = totalQuantity;
  
    // Recalculate discounted_price
    product.discounted_price = product.original_price;
    if (product.discount_percentage_tag) {
      const discount =
        (product.discount_percentage_tag / 100) * product.original_price;
      product.discounted_price = product.original_price - discount;
    }
  
    // Save recalculated fields in the DB
    await this.productRepository.save(product);
  
    return product;
  }
  
  async delete(productId: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['product_variables'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.remove(Product, product);
    });

    return { message: 'Product deleted successfully' };
  }

  async deleteProductVariable(product_variableId: string): Promise<{ message: string }> {
    // Find the product variable with its product relation
    const productVariable = await this.productVariableRepository.findOne({
      where: { id: product_variableId },
      relations: ['product'],
    });
  
    if (!productVariable) {
      throw new NotFoundException('Product variable not found');
    }
  
    await this.productVariableRepository.manager.transaction(async (transactionalEntityManager) => {
      // Remove the product variable
      await transactionalEntityManager.remove(ProductVariable, productVariable);
  
      // Get the product
      const product = productVariable.product;
  
      // Fetch remaining variables of the product
      const remainingVariables = await transactionalEntityManager.find(ProductVariable, {
        where: { product: { id: product.id } },
      });
  
      // Recalculate total quantity
      const updatedTotalQuantity = remainingVariables.reduce(
        (sum, variable) => sum + variable.quantity,
        0,
      );
  
      // Update and save product
      product.total_quantity = updatedTotalQuantity;
      await transactionalEntityManager.save(product);
    });
  
    return { message: 'Product variable deleted successfully' };
  }
}
