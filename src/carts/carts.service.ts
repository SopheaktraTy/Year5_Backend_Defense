import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import { ProductVariable } from '../products/entities/product_variable.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(ProductVariable) private productVariablesRepository: Repository<ProductVariable>,
  ) {}

  async create(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
    // 1) Try to load an existing cart for this user (include the `user` relation)
    let cart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'cartItems'],
    });
  
    // 2) If no cart exists yet, load the actual User and create a new Cart
    if (!cart) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
  
      cart = this.cartsRepository.create({ user });
      cart = await this.cartsRepository.save(cart);
    }
  
    // 3) Clear any existing CartItem rows for this cart
    await this.cartItemsRepository.delete({ cart: { id: cart.id } });
  
    // 4) Insert each new CartItem from createCartDto.items with quantity and size check
    for (const itemDto of createCartDto.items) {
      // Find the product
      const product = await this.productsRepository.findOne({
        where: { id: itemDto.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with id ${itemDto.productId} not found`);
      }
  
      if (!itemDto.size) {
        throw new BadRequestException(`Size must be specified for product ${itemDto.productId}`);
      }
  
      // Find the corresponding ProductVariable (size stock)
      const productVariable = await this.productVariablesRepository.findOne({
        where: { product: { id: itemDto.productId }, size: itemDto.size },
      });
  
      if (!productVariable) {
        throw new NotFoundException(
          `Size '${itemDto.size}' not found for product ${itemDto.productId}`,
        );
      }
  
      // Check if requested quantity is available
      if (itemDto.quantity > productVariable.quantity) {
        throw new BadRequestException(
          `Requested quantity (${itemDto.quantity}) exceeds available stock (${productVariable.quantity}) for product ${itemDto.productId} size ${itemDto.size}`,
        );
      }
  
      // Use discounted_price if not null, else original_price
      const unitPrice = product.discounted_price != null ? product.discounted_price : product.original_price;
  
      // Create and save cart item with total price calculated
      const cartItem = this.cartItemsRepository.create({
        cart,
        product,
        quantity: itemDto.quantity,
        price_at_added: unitPrice * itemDto.quantity,
        size: itemDto.size,
      });
      await this.cartItemsRepository.save(cartItem);
    }
  
    // 5) Return the fully loaded cart (with `user` and `cartItems.product` relations)
    const loadedCart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'cartItems', 'cartItems.product'],
    });
    if (!loadedCart) {
      throw new NotFoundException(`Cart for user ${userId} not found`);
    }
    return loadedCart;
  }
  

  async findByUser(userId: string): Promise<Cart | null> {
    const cart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'cartItems', 'cartItems.product'],
    });
    if (!cart) {
      return null;
    }
    let updated = false;
    // Update each cart item's price_at_added if product price changed
    for (const item of cart.cartItems) {
      const currentUnitPrice = item.product.discounted_price ?? item.product.original_price;
      const expectedPrice = currentUnitPrice * item.quantity;
  
      if (item.price_at_added !== expectedPrice) {
        item.price_at_added = expectedPrice;
        updated = true;
      }
    }
    if (updated) {
      // Save all updated cart items (you can optimize batch save if needed)
      await this.cartItemsRepository.save(cart.cartItems);
    }
    return cart;
  }
  
  











































  // async update(id: string, userId: string, updateCartDto: UpdateCartDto): Promise<Cart | null> {
  //   // Verify cart ownership
  //   const cart = await this.cartsRepository.findOne({ where: { id, user: { id: userId } } });
  //   if (!cart) {
  //     throw new NotFoundException('Cart not found or access denied');
  //   }
  
  //   if (updateCartDto.items) {
  //     // Remove old items
  //     await this.cartItemsRepository.delete({ cart: { id } });
  
  //     // Add new items with size and quantity checks
  //     for (const itemDto of updateCartDto.items) {
  //       const product = await this.productsRepository.findOne({ where: { id: itemDto.productId } });
  //       if (!product) {
  //         throw new NotFoundException(`Product with id ${itemDto.productId} not found`);
  //       }
  
  //       if (!itemDto.size) {
  //         throw new BadRequestException(`Size must be specified for product ${itemDto.productId}`);
  //       }
  
  //       const productVariable = await this.productVariablesRepository.findOne({
  //         where: { product: { id: itemDto.productId }, size: itemDto.size },
  //       });
  
  //       if (!productVariable) {
  //         throw new NotFoundException(
  //           `Size '${itemDto.size}' not found for product ${itemDto.productId}`,
  //         );
  //       }
  
  //       if (itemDto.quantity > productVariable.quantity) {
  //         throw new BadRequestException(
  //           `Requested quantity (${itemDto.quantity}) exceeds available stock (${productVariable.quantity}) for product ${itemDto.productId} size ${itemDto.size}`,
  //         );
  //       }
  
  //       const unitPrice = product.discounted_price != null ? product.discounted_price : product.original_price;
  
  //       const cartItem = this.cartItemsRepository.create({
  //         cart,
  //         product,
  //         quantity: itemDto.quantity,
  //         price_at_added: unitPrice * itemDto.quantity,
  //         size: itemDto.size,
  //       });
  
  //       await this.cartItemsRepository.save(cartItem);
  //     }
  //   }
  
  //   return this.findByUser(userId);
  // }
  
  // async remove(id: string, userId: string): Promise<void> {
  //   const cart = await this.cartsRepository.findOne({ where: { id, user: { id: userId } } });
  //   if (!cart) {
  //     throw new NotFoundException('Cart not found or access denied');
  //   }
  
  //   await this.cartsRepository.delete(id);
  // }
}