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

/*------------ Create cart and create item in cart ------------*/
async create(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
  // 1) Find existing cart for user
  let cart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user', 'cartItems'],
  });
  // 2) Create new cart only if none exists
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
  // 3) Clear existing cart items
  await this.cartItemsRepository.delete({ cart: { id: cart.id } });

  // 4) Add new cart items from DTO
  for (const itemDto of createCartDto.items) {
    const product = await this.productsRepository.findOne({
      where: { id: itemDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${itemDto.productId} not found`);
    }

    if (!itemDto.size) {
      throw new BadRequestException(`Size must be specified for product ${itemDto.productId}`);
    }

    const productVariable = await this.productVariablesRepository.findOne({
      where: { product: { id: itemDto.productId }, size: itemDto.size },
    });

    if (!productVariable) {
      throw new NotFoundException(
        `Size '${itemDto.size}' not found for product ${itemDto.productId}`,
      );
    }

    if (itemDto.quantity > productVariable.quantity) {
      throw new BadRequestException(
        `Requested quantity (${itemDto.quantity}) exceeds available stock (${productVariable.quantity}) for product ${itemDto.productId} size ${itemDto.size}`,
      );
    }

    const unitPrice = product.discounted_price ?? product.original_price;

    const cartItem = this.cartItemsRepository.create({
      cart,
      product,
      quantity: itemDto.quantity,
      price_at_added: unitPrice * itemDto.quantity,
      size: itemDto.size,
    });

    await this.cartItemsRepository.save(cartItem);
  }

  // 5) Return updated cart with relations loaded
  const loadedCart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user', 'cartItems', 'cartItems.product'],
  });

  if (!loadedCart) {
    throw new NotFoundException(`Cart for user ${userId} not found`);
  }

  return loadedCart;
}


/*------------ Get all item in cart and update if product change ------------*/
  async findByUser(userId: string): Promise<Cart | null> {
    const cart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'cartItems', 'cartItems.product'],
    });
    if (!cart) {
      return null;
    }
    let updated = false;
//1) Update each cart item's price_at_added if product price changed
    for (const item of cart.cartItems) {
      const currentUnitPrice = item.product.discounted_price ?? item.product.original_price;
      const expectedPrice = currentUnitPrice * item.quantity;
      if (item.price_at_added !== expectedPrice) {
        item.price_at_added = expectedPrice;
        updated = true;
      }
    }
    if (updated) {
//2) Save all updated cart items (you can optimize batch save if needed)
      await this.cartItemsRepository.save(cart.cartItems);
    }
    return cart;
  }

/*------------ Update cart item in cart ------------*/
  async update(id: string, userId: string, updateCartDto: UpdateCartDto,): Promise<Cart> {
// 1) Find the cart by ID and user to ensure ownership
    const cart = await this.cartsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'cartItems'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart with id ${id} for user ${userId} not found`);
    }

// 2) Clear existing cart items for this cart
    await this.cartItemsRepository.delete({ cart: { id: cart.id } });
// 3) Validate and add updated cart items
    for (const itemDto of updateCartDto.items) {
      const product = await this.productsRepository.findOne({
        where: { id: itemDto.productId },
      });
      if (!product) {throw new NotFoundException(`Product with id ${itemDto.productId} not found`);}
      if (!itemDto.size) {throw new BadRequestException(`Size must be specified for product ${itemDto.productId}`);}
      const productVariable = await this.productVariablesRepository.findOne({
        where: { product: { id: itemDto.productId }, size: itemDto.size },
      });
      if (!productVariable) {throw new NotFoundException(`Size '${itemDto.size}' not found for product ${itemDto.productId}`,);}

      if (itemDto.quantity > productVariable.quantity) {
        throw new BadRequestException(
          `Requested quantity (${itemDto.quantity}) exceeds available stock (${productVariable.quantity}) for product ${itemDto.productId} size ${itemDto.size}`,
        );
      }
      const unitPrice = product.discounted_price != null ? product.discounted_price : product.original_price;
      const cartItem = this.cartItemsRepository.create({
        cart,
        product,
        quantity: itemDto.quantity,
        price_at_added: unitPrice * itemDto.quantity,
        size: itemDto.size,
      });
      await this.cartItemsRepository.save(cartItem);
    }
// 4) Reload and return the updated cart with relations
    const updatedCart = await this.cartsRepository.findOne({
      where: { id: cart.id },
      relations: ['user', 'cartItems', 'cartItems.product'],
    });
    if (!updatedCart) {
      throw new NotFoundException(`Updated cart with id ${cart.id} not found`);
    }

    return updatedCart;
    }

/*------------ Remove cart item in cart ------------*/
async remove(userId: string, productId: string): Promise<{ message: string }> {
  // Find the cart for the user, including cart items
  const cart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
    relations: ['cartItems', 'cartItems.product'],
  });
  if (!cart) {
    throw new NotFoundException(`Cart not found for user with id ${userId}`);
  }
  // Find the cart item with the specified productId
  const cartItem = cart.cartItems.find(item => item.product.id === productId);
  if (!cartItem) {
    throw new NotFoundException(`Product with id ${productId} not found in the cart`);
  }
  // Remove the cart item
  await this.cartItemsRepository.remove(cartItem);
  return { message: `Product with id ${productId} removed from cart successfully.` };
}

}