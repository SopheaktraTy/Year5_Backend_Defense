import { Injectable, NotFoundException, BadRequestException, Logger , ForbiddenException} from '@nestjs/common';
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
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(ProductVariable) private productVariablesRepository: Repository<ProductVariable>,
  ) {}

/*------------ Create cart and create item in cart ------------*/
async create(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
  this.logger.log(`Creating/updating cart for userId: ${userId}`);

  // Find existing cart for user
  let cart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'], // Ensure product variables are loaded
  });

  if (!cart) {
    this.logger.log(`No cart found for userId ${userId}, creating new one.`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error(`User with id ${userId} not found`);
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    cart = this.cartsRepository.create({ user });
    cart = await this.cartsRepository.save(cart);
  } else {
    this.logger.log(`Found existing cart with id ${cart.id} for user ${userId}.`);
  }

  // Delete existing cart items
  if (cart.cartItems && cart.cartItems.length > 0) {
    const cartItemIds = cart.cartItems.map(item => item.id);
    this.logger.log(`Deleting ${cartItemIds.length} existing cart items for cart ${cart.id}.`);
    await this.cartItemsRepository.delete(cartItemIds);
  }

  // Create new cart items
  const newItems: CartItem[] = [];
  for (const itemDto of createCartDto.items) {
    this.logger.log(`Processing item - productId: ${itemDto.productId}, quantity: ${itemDto.quantity}, size: ${itemDto.size}`);

    const product = await this.productsRepository.findOne({
      where: { id: itemDto.productId },
      relations: ['product_variables'],  // Ensure product variables are loaded
    });
    if (!product) {
      this.logger.error(`Product with id ${itemDto.productId} not found`);
      throw new NotFoundException(`Product with id ${itemDto.productId} not found`);
    }

    // Validate size and quantity with product variables
    const productVariable = product.product_variables.find(
      (variable) => variable.size.toLowerCase() === itemDto.size.trim().toLowerCase(),
    );

    if (!productVariable) {
      this.logger.error(`Size "${itemDto.size}" not available for product ${itemDto.productId}`);
      throw new BadRequestException(`Size "${itemDto.size}" not available for product ${itemDto.productId}`);
    }

    // Validate quantity against available stock for the size
    if (itemDto.quantity > productVariable.quantity) {
      this.logger.error(`Requested quantity exceeds available stock for size "${itemDto.size}"`);
      throw new BadRequestException(`Requested quantity exceeds available stock for size "${itemDto.size}"`);
    }

    if (itemDto.quantity <= 0) {
      this.logger.error('Quantity must be greater than zero');
      throw new BadRequestException('Quantity must be greater than zero');
    }

    // Create cart item
    const price = product.discounted_price ?? product.original_price;

    const cartItem = this.cartItemsRepository.create({
      cart,
      product,
      quantity: itemDto.quantity,
      size: itemDto.size,
      price_at_cart: price * itemDto.quantity,
    });

    newItems.push(cartItem);
  }

  // Save new cart items
  await this.cartItemsRepository.save(newItems);
  this.logger.log(`Saved ${newItems.length} new cart items for cart ${cart.id}.`);

  // Reload cart with relations and return
  const updatedCart = await this.cartsRepository.findOne({
    where: { id: cart.id },
    relations: ['user', 'cartItems', 'cartItems.product', 'cartItems.product.product_variables'],
  });

  this.logger.log(`Returning cart with id ${cart.id} for user ${userId}.`);
  return updatedCart!;
}



/*------------ Get all item in cart and update if product change ------------*/
async findByUser(userId: string): Promise<Cart | null> {
  this.logger.log(`Fetching cart for userId: ${userId}`);

  const cart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user', 'cartItems', 'cartItems.product'],
  });

  if (!cart) {
    this.logger.log(`No cart found for userId: ${userId}`);
    return null;
  }

  const orphanItemIds = cart.cartItems
    .filter(item => !item.product)
    .map(item => item.id);

  if (orphanItemIds.length > 0) {
    this.logger.log(`Deleting ${orphanItemIds.length} cart items linked to deleted products.`);
    await this.cartItemsRepository.delete(orphanItemIds);
    // Remove from local array to maintain consistency
    cart.cartItems = cart.cartItems.filter(item => item.product);
  }

  const itemsToDelete: CartItem[] = []; // Explicitly typed as CartItem[]

  let priceUpdated = false;

  for (const item of cart.cartItems) {
    const product = item.product!;
    const currentPrice = product.discounted_price ?? product.original_price;
    const expectedPriceAtAdded = currentPrice * item.quantity;

    // Check if the product has changed
    if (item.product.id !== product.id) {
      itemsToDelete.push(item);
    }

    // Check if the price has changed
    if (item.price_at_cart !== expectedPriceAtAdded) {
      item.price_at_cart = expectedPriceAtAdded;
      priceUpdated = true;
    }
  }

  // Delete cart items where the product has changed
  if (itemsToDelete.length > 0) {
    this.logger.log(`Deleting ${itemsToDelete.length} cart items due to product change.`);
    const itemIdsToDelete = itemsToDelete.map(item => item.id); // TypeScript will now correctly infer item.id
    await this.cartItemsRepository.delete(itemIdsToDelete);
    // Remove from the local array so cart.cartItems remains consistent
    cart.cartItems = cart.cartItems.filter(item => !itemsToDelete.includes(item)); // This will now work correctly
  }

  // Save the updated cart items if there were price updates
  if (priceUpdated) {
    await this.cartItemsRepository.save(cart.cartItems);
    this.logger.log(`Updated price_at_added for cart items in cart ${cart.id}`);
    return await this.cartsRepository.findOne({
      where: { id: cart.id },
      relations: ['user', 'cartItems', 'cartItems.product'],
    });
  }

  this.logger.log(`No price update needed for cart ${cart.id}`);
  return cart;
}



/*------------ Update cart item in cart ------------*/
async updateCartItem(
  userId: string,
  cartItemId: string,
  updateCartItemDto: UpdateCartItemDto,
): Promise<CartItem> {
  this.logger.log(`Updating cart item ${cartItemId} for user ${userId}`);

  // Find cart item with its cart and user for ownership check
  const cartItem = await this.cartItemsRepository.findOne({
    where: { id: cartItemId },
    relations: ['cart', 'cart.user', 'product'],
  });

  if (!cartItem) {
    this.logger.warn(`Cart item ${cartItemId} not found`);
    throw new NotFoundException('Cart item not found');
  }

  if (cartItem.cart.user.id !== userId) {
    this.logger.error(`User ${userId} not authorized to update cart item ${cartItemId}`);
    throw new ForbiddenException('Not authorized to update this cart item');
  }

  // Update quantity if provided
  if (updateCartItemDto.quantity !== undefined) {
    if (updateCartItemDto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }
    cartItem.quantity = updateCartItemDto.quantity;
  }

  // Update size if provided
  if (updateCartItemDto.size !== undefined) {
    cartItem.size = updateCartItemDto.size;
  }

  // Update price_at_added based on product price and new quantity
  const price = cartItem.product.discounted_price ?? cartItem.product.original_price;
  cartItem.price_at_cart = price * cartItem.quantity;

  // Save updated cart item
  await this.cartItemsRepository.save(cartItem);

  this.logger.log(`Updated cart item ${cartItemId} for user ${userId}`);
  return cartItem;
}

/*------------ Remove cart item in cart ------------*/
async removeCartItem(userId: string, cartItemId: string): Promise<{ message: string }> {
  this.logger.log(`Removing cart item ${cartItemId} for user ${userId}`);

  // Find the cart item including its cart and the cart's owner (user)
  const cartItem = await this.cartItemsRepository.findOne({
    where: { id: cartItemId },
    relations: ['cart', 'cart.user'],
  });

  // If cart item doesn't exist, throw 404 error
  if (!cartItem) {
    this.logger.warn(`Cart item ${cartItemId} not found`);
    throw new NotFoundException('Cart item not found');
  }

  // Verify that the cart belongs to the requesting user
  if (cartItem.cart.user.id !== userId) {
    this.logger.error(`User ${userId} not authorized to delete cart item ${cartItemId}`);
    throw new ForbiddenException('Not authorized to delete this cart item');
  }

  // Delete the cart item
  await this.cartItemsRepository.delete(cartItemId);
  this.logger.log(`Deleted cart item ${cartItemId} for user ${userId}`);

  // Return success message
  return { message: 'Cart item deleted successfully' };
}

}