import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import { ProductVariable } from '../products/entities/product_variable.entity';

@Injectable()
export class CartsService {
  private readonly logger = new Logger(CartsService.name);
  constructor(
    @InjectRepository(Cart) private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(ProductVariable) private productVariablesRepository: Repository<ProductVariable>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

/*------------- Create a new cart or update existing cart with items -------------*/ 
async create(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
  // 1. Ensure user exists
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException(`User ${userId} not found`);

  // 2. Load or init cart with transaction for atomicity
  let cart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: [
      'cart_items',
      'cart_items.product_variable',
      'cart_items.product_variable.product',
    ],
  });

  if (!cart) {
    cart = this.cartsRepository.create({ user });
    await this.cartsRepository.save(cart);
    cart = await this.cartsRepository.findOne({
      where: { id: cart.id },
      relations: [
        'cart_items',
        'cart_items.product_variable',
        'cart_items.product_variable.product',
      ],
    });
  }
  if (!cart) throw new InternalServerErrorException('Failed to initialize cart');

  // Use transaction to ensure consistency
  await this.cartsRepository.manager.transaction(async (transactionalEntityManager) => {
    for (const { productId, size, quantity } of createCartDto.items) {
      const product = await this.productsRepository.findOne({ where: { id: productId } });
      if (!product) throw new NotFoundException(`Product ${productId} not found`);

      const variant = await this.productVariablesRepository.findOne({
        where: { product: { id: productId }, size },
        relations: ['product'],
      });
      if (!variant) {
        throw new BadRequestException(
          `Size "${size}" not available for product ${productId}`
        );
      }
      if (variant.quantity < quantity) {
        throw new BadRequestException(
          `Only ${variant.quantity} in stock for product ${productId} size ${size}`
        );
      }

      const unitPrice = variant.product.discounted_price ?? variant.product.original_price;

      // Check if the item already exists in the cart
      let item = cart.cart_items.find(
        (ci) => ci.product_variable?.id === variant.id
      );

      if (item) {
        // If the item already exists in the cart, update the quantity and price
        if (quantity > variant.quantity) {
          throw new BadRequestException(
            `Cannot update to ${quantity}; exceeds stock of ${variant.quantity}`
          );
        }

        // Update the quantity and price at cart (replacing the old quantity with the new one)
        console.log(`Cart item with product ${productId} and size "${size}" already exists. Updating it.`);

        item.quantity = quantity;  // Set the quantity directly (not adding)
        item.price_at_cart = unitPrice * quantity;  // Recalculate the price based on the new quantity

        await transactionalEntityManager.save(item);
      } else {
        // If the item does not exist in the cart, create a new cart item
        console.log(`Cart item with product ${productId} and size "${size}" added to the cart.`);

        item = this.cartItemsRepository.create({
          cart,
          product,
          product_variable: variant,
          quantity,
          size,
          price_at_cart: unitPrice * quantity,
        });

        await transactionalEntityManager.save(item);
        cart.cart_items.push(item);
      }
    }
  });

  // 3. Return updated cart, with null-check
  const updatedCart = await this.cartsRepository.findOne({
    where: { id: cart.id },
    relations: [
      'cart_items',
      'cart_items.product_variable',
      'cart_items.product_variable.product',
    ],
  });

  if (!updatedCart) {
    throw new InternalServerErrorException('Cart not found after update');
  }

  return updatedCart;
}

/*------------- Get all items in cart and update if product or variant changes -------------*/
async findByUser(userId: string): Promise<Cart> {
  // 1. Ensure user exists
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException(`User ${userId} not found`);

  // 2. Load or create cart
  let cart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: [
      'cart_items',
      'cart_items.product_variable',
      'cart_items.product_variable.product',
      'cart_items.product',
    ],
  });

  if (!cart) {
    cart = this.cartsRepository.create({ user });
    await this.cartsRepository.save(cart);

    cart = await this.cartsRepository.findOne({
      where: { id: cart.id },
      relations: [
        'cart_items',
        'cart_items.product_variable',
        'cart_items.product_variable.product',
        'cart_items.product',
      ],
    });
  }

  if (!cart) throw new InternalServerErrorException('Failed to load cart');

  // 3. Cleanup: remove items with missing product or variant
  for (const item of cart.cart_items) {
    const product = item.product;
    const variant = item.product_variable;

    const prodExists = product
      ? await this.productsRepository.findOne({ where: { id: product.id } })
      : null;

    const varExists = variant
      ? await this.productVariablesRepository.findOne({ where: { id: variant.id } })
      : null;

    // Remove cart item if product or variant is deleted
    if (!prodExists || !varExists) {
      await this.cartItemsRepository.remove(item);
      continue;
    }

    // 4. Update price_at_cart with latest product price
    const latestPrice = prodExists.discounted_price ?? prodExists.original_price;
    const newPriceAtCart = latestPrice * item.quantity;

    if (item.price_at_cart !== newPriceAtCart) {
      item.price_at_cart = newPriceAtCart;
      await this.cartItemsRepository.save(item);
    }
  }

  // 5. Return refreshed cart
  const updatedCart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: [
      'cart_items',
      'cart_items.product_variable',
      'cart_items.product_variable.product',
      'cart_items.product',
    ],
  });

  if (!updatedCart) throw new InternalServerErrorException('Cart not found after cleanup');

  return updatedCart;
}

/*------------- Update cart item in cart -------------*/
async updateCartItem(userId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
  // 1. Ensure user exists
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException(`User ${userId} not found`);

  // 2. Load the cart item
  const cartItem = await this.cartItemsRepository.findOne({
    where: { id: cartItemId },
    relations: ['cart', 'cart.user', 'product', 'product_variable', 'product_variable.product'], // Ensure product is loaded
  });

  if (!cartItem) throw new NotFoundException(`Cart item ${cartItemId} not found`);

  // 3. Ensure the cart belongs to the user
  if (cartItem.cart.user.id !== userId) {
    throw new ForbiddenException('Cannot update another user\'s cart item');
  }

  // 4. Check if product exists
  const product = cartItem.product;
  if (!product) {
    throw new NotFoundException(`Product for cart item ${cartItemId} not found`);
  }

  // 5. Fetch the product variant (product_variable)
  const variant = await this.productVariablesRepository.findOne({
    where: { product: { id: product.id }, size: updateCartItemDto.size },
    relations: ['product'],  // Explicitly load the product relation with the variant
  });

  if (!variant) {
    throw new NotFoundException(`Size "${updateCartItemDto.size}" not available for product ${product.id}`);
  }

  // Ensure the product is loaded with the variant
  const associatedProduct = variant.product;
  if (!associatedProduct) {
    throw new NotFoundException(`Product associated with variant size "${updateCartItemDto.size}" not found`);
  }

  // 6. Check if the requested quantity is available in stock
  if (variant.quantity < updateCartItemDto.quantity) {
    throw new BadRequestException(
      `Only ${variant.quantity} in stock for product ${product.id} size ${updateCartItemDto.size}`
    );
  }

  // 7. Get the unit price (either discounted or original)
  const unitPrice = associatedProduct.discounted_price ?? associatedProduct.original_price;
  if (unitPrice === undefined) {
    throw new InternalServerErrorException('Product does not have a price');
  }

  // 8. Update the cart item
  cartItem.quantity = updateCartItemDto.quantity;
  cartItem.size = updateCartItemDto.size;
  cartItem.product_variable = variant;
  cartItem.price_at_cart = unitPrice * updateCartItemDto.quantity;

  // Save the updated cart item
  await this.cartItemsRepository.save(cartItem);

  // 9. Return the updated cart
  const updatedCart = await this.cartsRepository.findOne({
    where: { id: cartItem.cart.id },
    relations: ['cart_items', 'cart_items.product_variable', 'cart_items.product_variable.product'],
  });

  if (!updatedCart) throw new InternalServerErrorException('Failed to update cart');

  return updatedCart;
}

/*------------- Remove cart item from cart -------------*/
async removeCartItem(userId: string, cartItemId: string): Promise<string> {
  // 1. Load the cart item with its cart → user
  const item = await this.cartItemsRepository.findOne({
    where: { id: cartItemId },
    relations: ['cart', 'cart.user', 'product', 'product_variable'],
  });
  if (!item) {
    throw new NotFoundException(`Cart item ${cartItemId} not found`);
  }

  // 2. Ensure it belongs to the requesting user
  if (item.cart.user.id !== userId) {
    throw new ForbiddenException(`Cannot delete another user's cart item`);
  }

  // 3. Delete the cart item
  await this.cartItemsRepository.remove(item);

  // 4. Return success message
  return `Cart item ${cartItemId} has been successfully removed from your cart.`;
}

/*------------- Clear all items from user's cart -------------*/
async clearCart(userId: string): Promise<string> {
  // 1. Find the cart for the user
  const cart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: ['cart_items'],
  });
  if (!cart) {
    throw new NotFoundException(`Cart for user ${userId} not found`);
  }

  // 2. Remove all items from the cart
  if (cart.cart_items.length > 0) {
    await this.cartItemsRepository.remove(cart.cart_items);
  }

  // 3. Return success message
  return `All items have been removed from your cart.`;
}
}









































































  
// /*------------ Create cart and create item in cart ------------*/
// async create(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
//   this.logger.log(`Creating/updating cart for userId: ${userId}`);

//   // Log the items in the DTO
//   this.logger.log('Items in cart:', createCartDto.items);

//   // Find or create cart
//   let cart = await this.cartsRepository.findOne({
//     where: { user: { id: userId } },
//     relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
//   });

//   // If cart does not exist, create a new cart for the user
//   if (!cart) {
//     const user = await this.userRepository.findOne({ where: { id: userId } });
//     if (!user) {
//       this.logger.error(`User with id ${userId} not found`);
//       throw new NotFoundException(`User with id ${userId} not found`);
//     }
//     cart = this.cartsRepository.create({ user });
//     cart = await this.cartsRepository.save(cart);  // Save the newly created cart
//     this.logger.log(`New cart created for user ${userId}`);
//   }

//   // Ensure that the user exists in the cart
//   if (!cart.user) {
//     this.logger.error(`User with id ${userId} not found`);
//     throw new NotFoundException(`User with id ${userId} not found`);
//   }

//   // Create new cart items
//   const newItems = await Promise.all(createCartDto.items.map(async (itemDto) => {
//     const product = await this.productsRepository.findOne({
//       where: { id: itemDto.productId },
//       relations: ['product_variables'],
//     });
//     if (!product) {
//       this.logger.error(`Product with id ${itemDto.productId} not found`);
//       throw new NotFoundException(`Product with id ${itemDto.productId} not found`);
//     }

//     let productVariable: ProductVariable | null = null;

//     // If product has size variants
//     if (product.product_variables && product.product_variables.length > 0) {
//       // If only one size exists, automatically select it
//       if (product.product_variables.length === 1) {
//         productVariable = product.product_variables[0];
//         itemDto.size = productVariable.size; // Automatically set the size
//       } else {
//         // If multiple size variants, validate the provided size
//         productVariable = product.product_variables.find(variable =>
//           variable.size.toLowerCase() === itemDto.size.trim().toLowerCase()) || null;
//         if (!productVariable) {
//           this.logger.error(`Size "${itemDto.size}" not found for product ${itemDto.productId}`);
//           throw new BadRequestException(`Size "${itemDto.size}" not available for the product`);
//         }
//       }
//     } else {
//       // If no size variants exist, ensure size is omitted
//       if (itemDto.size) {
//         this.logger.error(`Product ${itemDto.productId} does not have size variants. Please omit the size.`);
//         throw new BadRequestException(`Product does not have size variants. Please provide only quantity.`);
//       }
//     }

//     // Validate quantity
//     const availableQuantity = productVariable ? productVariable.quantity : product.total_quantity;

//     if (itemDto.quantity <= 0 || itemDto.quantity > availableQuantity) {
//       const errorMessage = itemDto.quantity <= 0 ? 'Quantity must be greater than zero' :
//         `Requested quantity exceeds available stock for ${productVariable ? `size "${itemDto.size}"` : 'product'}`;
//       this.logger.error(errorMessage);
//       throw new BadRequestException(errorMessage);
//     }

//     // Calculate price
//     const price = product.discounted_price ?? product.original_price;

//     // Check if the cart already contains the item with the same product and size
//     const existingCartItem = cart.cartItems.find(
//       (cartItem) => cartItem.product.id === itemDto.productId && cartItem.size === itemDto.size
//     );

//     if (existingCartItem) {
//       // Log message and do not merge or update
//       this.logger.log(`Item with product ${itemDto.productId} and size ${itemDto.size} already exists in the cart, skipping.`);
//       throw new BadRequestException(`Item with product ${itemDto.productId} and size ${itemDto.size} already exists in the cart.`);
//     }

//     // If item does not exist, create a new cart item
//     const newCartItem = this.cartItemsRepository.create({
//       cart,
//       product,
//       quantity: itemDto.quantity,
//       size: itemDto.size,
//       price_at_cart: price * itemDto.quantity,
//     });
//     return newCartItem; // Return the new cart item to be saved
//   }));

//   // Save new cart items (including any merged items)
//   await this.cartItemsRepository.save(newItems);
//   this.logger.log(`Saved ${newItems.length} new cart items`);

//   // Reload and return updated cart, excluding product_variable data
//   const updatedCart = await this.cartsRepository.findOne({
//     where: { id: cart.id },
//     relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
//   });

//   this.logger.log(`Returning updated cart with id ${cart.id}`);
//   return updatedCart!;
// }



// /*------------ Get all item in cart and update if product change ------------*/
// async findByUser(userId: string): Promise<Cart> {
//   this.logger.log(`Fetching cart for userId: ${userId}`);

//   // Find the cart associated with the user
//   const cart = await this.cartsRepository.findOne({
//     where: { user: { id: userId } },
//     relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
//   });

//   if (!cart) {
//     this.logger.error(`Cart for userId ${userId} not found`);
//     throw new NotFoundException(`Cart for userId ${userId} not found`);
//   }

//   this.logger.log(`Found cart with id ${cart.id} for user ${userId}`);

//   // Check and delete cart items that are no longer related to valid products or product variables
//   const itemsToDelete: string[] = [];

//   for (const cartItem of cart.cartItems) {
//     const product = cartItem.product;

//     // If the product no longer exists (i.e., it has been deleted), mark cart item for deletion
//     if (!product) {
//       this.logger.log(`Product for cart item ${cartItem.id} not found, marking for deletion.`);
//       itemsToDelete.push(cartItem.id);
//       continue;
//     }

//     // If the product has product variables, check if the corresponding product variable exists
//     if (product.product_variables && product.product_variables.length > 0) {
//       const productVariable = product.product_variables.find(
//         (variable) => variable.size.toLowerCase() === cartItem.size.trim().toLowerCase(),
//       );

//       // If no matching product variable is found, mark cart item for deletion
//       if (!productVariable) {
//         this.logger.log(`Product variable for size "${cartItem.size}" not found, marking for deletion.`);
//         itemsToDelete.push(cartItem.id);
//       }
//     } else {
//       // If the product has no product variables, check if the total_quantity is still valid
//       if (product.total_quantity <= 0) {
//         this.logger.log(`Product quantity is zero or less for product ${product.id}, marking cart item for deletion.`);
//         itemsToDelete.push(cartItem.id);
//       }
//     }
//   }

//   // Delete invalid cart items
//   if (itemsToDelete.length > 0) {
//     this.logger.log(`Deleting ${itemsToDelete.length} invalid cart items`);
//     await this.cartItemsRepository.delete(itemsToDelete);
//   }

//   // Reload and return the updated cart with valid items only
//   const updatedCart = await this.cartsRepository.findOne({
//     where: { id: cart.id },
//     relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
//   });

//   this.logger.log(`Returning updated cart with id ${cart.id}`);
//   return updatedCart!;
// }

// /*------------ Update cart item in cart ------------*/
// async updateCartItem(userId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
//   this.logger.log(`Updating cart item for userId: ${userId}, cartItemId: ${cartItemId}`);

//   // Find the cart item to update
//   const cartItem = await this.cartItemsRepository.findOne({
//     where: { id: cartItemId },
//     relations: ['cart', 'product', 'product.product_variables'],
//   });

//   if (!cartItem) {
//     this.logger.error(`Cart item with id ${cartItemId} not found`);
//     throw new NotFoundException(`Cart item with id ${cartItemId} not found`);
//   }

//   const product = cartItem.product;
//   const { quantity, size } = updateCartItemDto;

//   // Check if quantity and size are defined
//   if (quantity === undefined || size === undefined) {
//     this.logger.error(`Quantity or size is undefined for cart item ${cartItemId}`);
//     throw new BadRequestException('Quantity and size must be defined');
//   }

//   // If the product no longer exists, delete the cart item and return the updated cart
//   if (!product) {
//     this.logger.log(`Product for cart item ${cartItem.id} not found, deleting cart item.`);
//     await this.cartItemsRepository.delete(cartItem.id);
//     return this.findByUser(userId); // Return updated cart after deletion
//   }

//   let productVariable: ProductVariable | null = null;

//   // If the product has product variables, check if the corresponding product variable exists
//   if (product.product_variables && product.product_variables.length > 0) {
//     if (product.product_variables.length === 1) {
//       // Automatically select the only available size if only one size exists
//       productVariable = product.product_variables[0];
//       cartItem.size = productVariable.size; // Automatically set the size
//     } else {
//       // Validate the provided size
//       productVariable = product.product_variables.find(variable =>
//         variable.size.toLowerCase() === size.trim().toLowerCase()) || null;
//       if (!productVariable) {
//         this.logger.error(`Size "${size}" not found for product ${product.id}`);
//         throw new BadRequestException(`Size "${size}" not available for the product`);
//       }
//     }
//   } else {
//     // If no product variants exist, check if size is provided
//     if (size) {
//       this.logger.error(`Product ${product.id} does not have size variants. Please omit the size.`);
//       throw new BadRequestException(`Product does not have size variants. Please provide only quantity.`);
//     }
//     // Create a dummy ProductVariable if no sizes exist
//     productVariable = {
//       id: '',
//       size: '',
//       product: product,
//       quantity: product.total_quantity,
//       created_at: new Date(),
//       updated_at: new Date(),
//     } as ProductVariable;
//   }

//   const availableQuantity = productVariable ? productVariable.quantity : product.total_quantity;

//   // Validate quantity
//   if (quantity <= 0 || quantity > availableQuantity) {
//     const errorMessage = quantity <= 0 ? 'Quantity must be greater than zero' :
//       `Requested quantity exceeds available stock for ${productVariable ? `size "${size}"` : 'product'}`;
//     this.logger.error(errorMessage);
//     throw new BadRequestException(errorMessage);
//   }

//   // Calculate price (use discounted price if available, otherwise use original price)
//   const price = product.discounted_price ?? product.original_price;

//   // Check if the cart already contains the item with the same product and size
//   const cart = cartItem.cart;  // Access cart directly from cartItem relation

//   const existingCartItem = cart.cartItems.find(
//     (item) => item.product.id === product.id && item.size === size
//   );

//   if (existingCartItem) {
//     // Log a message for the duplicate item (no merge/update here)
//     this.logger.log(`Item with product ${product.id} and size ${size} already exists in the cart, skipping.`);
//     throw new BadRequestException(`Item with product ${product.id} and size ${size} already exists in the cart.`);
//   }

//   // If item does not exist, update the cart item
//   cartItem.quantity = quantity;
//   cartItem.size = size;
//   cartItem.price_at_cart = price * quantity; // Update price based on quantity
//   cartItem.product_variable = productVariable

//   // Save the updated cart item
//   await this.cartItemsRepository.save(cartItem);

//   // Return updated cart after cart item update
//   return this.findByUser(userId);
// }


// /*------------ Remove cart item in cart ------------*/
// async removeCartItem(userId: string, cartItemId: string): Promise<Cart> {
//   this.logger.log(`Removing cart item for userId: ${userId}, cartItemId: ${cartItemId}`);

//   // Find the cart item to remove
//   const cartItem = await this.cartItemsRepository.findOne({
//     where: { id: cartItemId },
//     relations: ['cart', 'cart.user', 'product', 'product.product_variables'],
//   });

//   if (!cartItem) {
//     this.logger.error(`Cart item with id ${cartItemId} not found`);
//     throw new NotFoundException(`Cart item with id ${cartItemId} not found`);
//   }

//   // Ensure the cart and the user are linked
//   if (!cartItem.cart || !cartItem.cart.user) {
//     this.logger.error(`No cart or user associated with cart item ${cartItemId}`);
//     throw new NotFoundException(`Cart or user not found for cart item ${cartItemId}`);
//   }

//   // Validate the cart item belongs to the correct user
//   if (cartItem.cart.user.id !== userId) {
//     this.logger.error(`Cart item does not belong to user ${userId}`);
//     throw new BadRequestException(`This cart item does not belong to user ${userId}`);
//   }

//   // Remove the cart item from the cart
//   await this.cartItemsRepository.remove(cartItem);
//   this.logger.log(`Cart item with id ${cartItemId} removed successfully`);

//   // Reload and return the updated cart
//   const updatedCart = await this.cartsRepository.findOne({
//     where: { id: cartItem.cart.id },
//     relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
//   });

//   this.logger.log(`Returning updated cart with id ${cartItem.cart.id}`);
//   return updatedCart!;
// }



// }