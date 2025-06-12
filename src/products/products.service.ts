import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariable } from './entities/product_variable.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariableDto } from './dto/create-product-variable.dto';  
import { Category } from '../categories/entities/category.entity';
import { CartItem } from '../carts/entities/cart_item.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariable) private readonly productVariableRepository: Repository<ProductVariable>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CartItem) private readonly cartItemRepository: Repository<CartItem>,
  ) {}

/*-----------------> Create a new product: <-----------------*/
async create(createProductDto: CreateProductDto): Promise<Product> {

  // Ensure product name is provided
  if (!createProductDto.productName) {
    throw new BadRequestException('Product name is required');
  }

  if (createProductDto.originalPrice == null) {
    throw new BadRequestException('Original price is required');
  }

  // 1. Check if the product name already exists
  const existingProduct = await this.productRepository.findOne({
    where: { product_name: createProductDto.productName },
  });
  if (existingProduct) {
    throw new BadRequestException('Product name already exists');
  }

  // 2. Check if the category exists
  let category: Category | null = null;
  if (createProductDto.categoryId) {
    category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category does not exist');
    }
  }

  // 3. Merge duplicate product sizes (case insensitive)
  const mergedVariables: CreateProductVariableDto[] = [];
  const sizeMap = new Map<string, number>();

  createProductDto.productVariables.forEach((variable) => {
    const sizeKey = variable.size.toLowerCase(); // Case-insensitive check for merging
    const existingQuantity = sizeMap.get(sizeKey) || 0; // Handle undefined value safely
    sizeMap.set(sizeKey, existingQuantity + variable.quantity); // Merge quantity for the same size
  });

  // 4. Preserve the original case for the size and push the merged variables
  sizeMap.forEach((quantity, size) => {
    const originalSize = createProductDto.productVariables.find(
      (variable) => variable.size.toLowerCase() === size
    )?.size;  // Find the original case-sensitive size
    mergedVariables.push({ size: originalSize!, quantity });
  });

  // 5. Calculate the total quantity of the product
  const totalQuantity = mergedVariables.reduce((sum, variable) => sum + variable.quantity, 0);

  // 6. Calculate the discounted price if discountPercentageTag is provided
  let discountedPrice = createProductDto.originalPrice;
  if (createProductDto.discountPercentageTag) {
    const discount = (createProductDto.discountPercentageTag / 100) * createProductDto.originalPrice;
    discountedPrice = createProductDto.originalPrice - discount;
  }

  // 7. Create a new product entity
  const newProduct = this.productRepository.create({
    product_name: createProductDto.productName,
    original_price: createProductDto.originalPrice,
    discounted_price: discountedPrice,
    total_quantity: totalQuantity,
    discount_percentage_tag: createProductDto.discountPercentageTag, // Save the discount percentage tag
    category, // Correctly assign the category
    ...createProductDto,
  });

  // 8. Save the product
  await this.productRepository.save(newProduct);

  // 9. Create and save the product variables (sizes)
  for (const variable of mergedVariables) {
    const productVariable = this.productVariableRepository.create({
      size: variable.size,  // Save the size exactly as entered
      quantity: variable.quantity,
      product: newProduct,
    });
    await this.productVariableRepository.save(productVariable);
  }

  // 10. Fetch the product along with product variables and assert it's not null using findOneOrFail
  return this.productRepository.findOneOrFail({
    where: { id: newProduct.id },
    relations: ['product_variables', 'category'],  // Use the camelCase 'productVariables' and category
  });
}

/*-----------------> Get all products: <-----------------*/
async findAll(): Promise<Product[]> {
  return this.productRepository.find({
    relations: ['product_variables', 'category'],  // Fetch related product variables as well
  });
}

/*-----------------> Get a single product by ID: <-----------------*/
async findOne(productId: string): Promise<Product> {
  // Ensure productId is a valid UUID (no quotes around it)
  const validProductId = productId.replace(/"/g, '');  // Remove any extra quotes

  const product = await this.productRepository.findOne({
    where: { id: validProductId },
    relations: ['product_variables', 'category'],
  });

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  return product;
}

/*-----------------> Update an existing product: <-----------------*/
async update(productId: string, updateProductDto: UpdateProductDto): Promise<{ message: string; product: Product }> {
  // 1. Ensure the product exists
  const existingProduct = await this.productRepository.findOne({
    where: { id: productId },
    relations: ['product_variables', 'cart_items'],  // Fetch cart items to check if they exist
  });

  if (!existingProduct) {
    throw new NotFoundException('Product not found');
  }

  // 2. Check if the category exists (if provided)
  let category: Category | null = null;
  if (updateProductDto.categoryId) {
    category = await this.categoryRepository.findOne({
      where: { id: updateProductDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  // 3. Merge duplicate product sizes (case insensitive)
  const mergedVariables: CreateProductVariableDto[] = [];
  const sizeMap = new Map<string, number>();

  if (updateProductDto.productVariables && updateProductDto.productVariables.length > 0) {
    updateProductDto.productVariables.forEach((variable) => {
      const sizeKey = variable.size.toLowerCase();
      const existingQuantity = sizeMap.get(sizeKey) || 0;
      sizeMap.set(sizeKey, existingQuantity + variable.quantity);
    });

    sizeMap.forEach((quantity, size) => {
      const originalSize = updateProductDto.productVariables?.find(
        (variable) => variable.size.toLowerCase() === size
      )?.size;
      mergedVariables.push({ size: originalSize!, quantity });
    });
  }

  // 4. Calculate total quantity
  const totalQuantity = mergedVariables.length > 0
    ? mergedVariables.reduce((sum, variable) => sum + variable.quantity, 0) 
    : existingProduct.product_variables.reduce((sum, variable) => sum + variable.quantity, 0);

  // 5. Calculate the discounted price if necessary
  let discountedPrice = existingProduct.discounted_price;
  if (updateProductDto.originalPrice !== undefined && updateProductDto.originalPrice !== existingProduct.original_price) {
    existingProduct.original_price = updateProductDto.originalPrice;
    if (existingProduct.discount_percentage_tag !== undefined) {
      const discount = (existingProduct.discount_percentage_tag / 100) * existingProduct.original_price;
      discountedPrice = existingProduct.original_price - discount;
    }
  }

  if (updateProductDto.discountPercentageTag !== undefined && updateProductDto.discountPercentageTag !== existingProduct.discount_percentage_tag) {
    if (updateProductDto.discountPercentageTag < 0 || updateProductDto.discountPercentageTag > 100) {
      throw new BadRequestException('Discount percentage must be between 0 and 100');
    }
    existingProduct.discount_percentage_tag = updateProductDto.discountPercentageTag;
    const discount = (existingProduct.discount_percentage_tag / 100) * existingProduct.original_price;
    discountedPrice = existingProduct.original_price - discount;
  }

  // 6. Update the product with new values
  existingProduct.product_name = updateProductDto.productName ?? existingProduct.product_name;
  existingProduct.image = updateProductDto.image ?? existingProduct.image;
  existingProduct.description = updateProductDto.description ?? existingProduct.description;
  existingProduct.discounted_price = discountedPrice;
  existingProduct.total_quantity = totalQuantity;
  existingProduct.category = category ?? existingProduct.category;

  // 7. Use transaction to delete related CartItems, update product, and product variables
  await this.productRepository.manager.transaction(async (transactionalEntityManager) => {
    // 7.1 Delete related CartItems for the current product (or its product variables)
    if (existingProduct.cart_items.length > 0) {
      await transactionalEntityManager.delete(CartItem, {
        product: existingProduct, // Delete CartItems related to the product
      });
    }

    // 7.2 Delete related CartItems for each product variable
    if (existingProduct.product_variables.length > 0) {
      for (const variable of existingProduct.product_variables) {
        const relatedCartItems = await transactionalEntityManager.find(CartItem, {
          where: { product_variable: variable },
        });

        if (relatedCartItems.length > 0) {
          await transactionalEntityManager.delete(CartItem, { product_variable: variable });
        }
      }
    }

    // 7.3 Save the updated product
    await transactionalEntityManager.save(Product, existingProduct);

    // 7.4 Update or create new product variables
    for (const variable of mergedVariables) {
      const existingProductVariable = existingProduct.product_variables.find(
        (productVariable) => productVariable.size.toLowerCase() === variable.size.toLowerCase()
      );

      if (existingProductVariable) {
        existingProductVariable.quantity = variable.quantity;
        await transactionalEntityManager.save(ProductVariable, existingProductVariable);
      } else {
        const newProductVariable = transactionalEntityManager.create(ProductVariable, {
          size: variable.size,
          quantity: variable.quantity,
          product: existingProduct,
        });
        await transactionalEntityManager.save(ProductVariable, newProductVariable);
      }
    }
  });

  // 8. Fetch the updated product with its variables and category
  const updatedProduct = await this.productRepository.findOneOrFail({
    where: { id: existingProduct.id },
    relations: ['product_variables', 'category'],
  });

  return { message: 'Product updated successfully', product: updatedProduct };
}



/*-----------------> Delete a product by ID: <-----------------*/
async delete(productId: string): Promise<{ message: string }> {
  const product = await this.productRepository.findOne({
    where: { id: productId },
    relations: ['product_variables', 'cart_items'],  // Fetch related cart items
  });

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  // Use transaction for consistency
  await this.productRepository.manager.transaction(async (transactionalEntityManager) => {
    // 1. Delete related CartItems using delete (by product id)
    if (product.cart_items.length > 0) {
      await transactionalEntityManager.delete(CartItem, { product: product });
    }

    // 2. Delete related CartItems for each product variable
    if (product.product_variables.length > 0) {
      for (const variable of product.product_variables) {
        const relatedCartItems = await transactionalEntityManager.find(CartItem, {
          where: { product_variable: variable },
        });

        if (relatedCartItems.length > 0) {
          await transactionalEntityManager.delete(CartItem, { product_variable: variable });
        }
      }
    }

    // 3. Remove the product
    await transactionalEntityManager.remove(Product, product);
  });

  return { message: 'Product deleted successfully' };
}


/*-----------------> Delete a product variable by ID: <-----------------*/
async deleteProductVariable(product_variableId: string): Promise<{ message: string }> {
  const productVariable = await this.productVariableRepository.findOne({
    where: { id: product_variableId },
  });

  if (!productVariable) {
    throw new NotFoundException('Product variable not found');
  }

  // Use transaction for consistency
  await this.productVariableRepository.manager.transaction(async (transactionalEntityManager) => {
    // 1. Delete related CartItems using delete (by product_variable id)
    const relatedCartItems = await transactionalEntityManager.find(CartItem, {
      where: { product_variable: productVariable },
    });

    if (relatedCartItems.length > 0) {
      await transactionalEntityManager.delete(CartItem, { product_variable: productVariable });
    }

    // 2. Remove the product variable
    await transactionalEntityManager.remove(ProductVariable, productVariable);
  });

  return { message: 'Product variable deleted successfully' };
}
}