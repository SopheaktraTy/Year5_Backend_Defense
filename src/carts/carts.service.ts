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

  async create(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
    // 1. Ensure user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    // 2. Load or init cart
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

    // 3. Process each DTO item
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

      const unitPrice =
        variant.product.discounted_price ?? variant.product.original_price;

      // <-- use ?. on product_variable here -->
      let item = cart.cart_items.find(
        ci => ci.product_variable?.id === variant.id
      );

      if (item) {
        const newQty = item.quantity + quantity;
        if (newQty > variant.quantity) {
          throw new BadRequestException(
            `Cannot add ${quantity}; exceeds stock of ${variant.quantity}`
          );
        }
        item.quantity = newQty;
        item.price_at_cart = unitPrice * newQty;
        await this.cartItemsRepository.save(item);
      } else {
        item = this.cartItemsRepository.create({
          cart,
          product,
          product_variable: variant,
          quantity,
          size,
          price_at_cart: unitPrice * quantity,
        });
        await this.cartItemsRepository.save(item);
        cart.cart_items.push(item);
      }
    }

    // 4. Return updated cart, with null-check
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



  async findByUser(userId: string): Promise<Cart> {
    // ensure user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    // load or create cart
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

    // cleanup: remove items whose product or variant was deleted/updated
    for (const item of cart.cart_items) {
      const prodExists = item.product
        ? await this.productsRepository.findOne({ where: { id: item.product.id } })
        : false;
      const varExists = item.product_variable
        ? await this.productVariablesRepository.findOne({ where: { id: item.product_variable.id } })
        : false;
      if (!prodExists || !varExists) {
        await this.cartItemsRepository.remove(item);
      }
    }

    // return fresh cart after cleanup
    const updated = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'cart_items',
        'cart_items.product_variable',
        'cart_items.product_variable.product',
        'cart_items.product',
      ],
    });
    if (!updated) throw new InternalServerErrorException('Cart not found after cleanup');
    return updated;
  }


async updateCartItem(
  userId: string,
  cartItemId: string,
  dto: UpdateCartItemDto,
): Promise<CartItem> {
  // 1. Load the CartItem with its cart → user
  const item = await this.cartItemsRepository.findOne({
    where: { id: cartItemId },
    relations: ['cart', 'cart.user', 'product_variable', 'product_variable.product'],
  });
  if (!item) {
    throw new NotFoundException(`Cart item ${cartItemId} not found`);
  }

  // 2. Ensure ownership
  if (item.cart.user.id !== userId) {
    throw new ForbiddenException(`Cannot modify another user's cart item`);
  }

  // 3. CLEANUP STALE: if the underlying product_variable was deleted, remove this cart item
  const variantExists = await this.productVariablesRepository.findOne({
    where: { id: item.product_variable?.id },
  });
  if (!variantExists) {
    await this.cartItemsRepository.remove(item);
    throw new NotFoundException(
      `Product variant no longer exists; cart item ${cartItemId} has been removed`
    );
  }

  // 4. Find the (possibly new) variant by dto.size
  const variant = await this.productVariablesRepository.findOne({
    where: { product: { id: variantExists.product.id }, size: dto.size },
    relations: ['product'],
  });
  if (!variant) {
    throw new BadRequestException(
      `Size "${dto.size}" not available for product ${variantExists.product.id}`
    );
  }

  // 5. Check stock
  if (dto.quantity > variant.quantity) {
    throw new BadRequestException(
      `Only ${variant.quantity} in stock for size ${dto.size}`
    );
  }

  // 6. Recalculate line–total price
  const unitPrice = variant.product.discounted_price ?? variant.product.original_price;
  item.product_variable = variant;
  item.size = dto.size;
  item.quantity = dto.quantity;
  item.price_at_cart = unitPrice * dto.quantity;

  // 7. Persist and return
  await this.cartItemsRepository.save(item);
  return item;
}


async removeCartItem(userId: string, cartItemId: string): Promise<void> {
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