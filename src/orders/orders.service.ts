import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CartItem } from '../carts/entities/cart_item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../auth/entities/user.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { OrderItem } from './entities/order_item.entity';
import { ProductVariable } from 'src/products/entities/product_variable.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(CartItem) private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Cart) private cartsRepository: Repository<Cart>,
    @InjectRepository(OrderItem) private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(ProductVariable) private productVariablesRepository: Repository<ProductVariable>
  ) {}

  /*------------ Create an Order ------------*/
  // async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
  //   // Step 1: Check if user exists
  //   const user = await this.usersRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   // Step 2: Get the active cart for the user
  //   const userCart = await this.cartsRepository.findOne({
  //     where: { user: { id: userId } },
  //     relations: ['cartItems'],
  //   });

  //   if (!userCart || userCart.cartItems.length === 0) {
  //     throw new BadRequestException('Cart is empty or does not exist');
  //   }

  //   // Step 3: Initialize total price and orderItems array
  //   let totalAmount = 0;
  //   const orderItems: OrderItem[] = [];

  //   // Step 4: Loop through the cart items and calculate total amount
  //   for (const cartItem of userCart.cartItems) {
  //     // Calculate the price for the item (quantity * price_at_cart)
  //     const priceAtOrder = cartItem.price_at_cart * cartItem.quantity;
  //     totalAmount += priceAtOrder;

  //     // Create OrderItem entity
  //     const orderItem = new OrderItem();
  //     orderItem.cart_item_id = cartItem.id;
  //     orderItem.quantity = cartItem.quantity;
  //     orderItem.price_at_order = priceAtOrder;

  //     // Add orderItem to the array
  //     orderItems.push(orderItem);

  //     // Step 5: Update the ProductVariable stock (deduct quantity)
  //     const productVariable = await this.productVariablesRepository.findOne({
  //       where: { id: cartItem.product_variable.id },
  //     });

  //     if (!productVariable) {
  //       throw new NotFoundException('ProductVariable not found');
  //     }

  //     // Check if there's enough stock available for the product's size
  //     if (productVariable.quantity < cartItem.quantity) {
  //       throw new BadRequestException('Not enough stock for this product size');
  //     }

  //     // Reduce the stock by the ordered quantity
  //     productVariable.quantity -= cartItem.quantity;

  //     // Save updated productVariable
  //     await this.productVariablesRepository.save(productVariable);
  //   }

  //   // Step 6: Create the order
  //   const newOrder = this.ordersRepository.create({
  //     user,
  //     cart: userCart,
  //     order_no: Math.floor(Math.random() * 1000000), // Generate random order number
  //     total_amount: totalAmount,
  //   });

  //   // Save the order
  //   const savedOrder = await this.ordersRepository.save(newOrder);

  //   // Step 7: Link OrderItems to the created Order and save them
  //   for (const orderItem of orderItems) {
  //     orderItem.order_id = savedOrder.id; // Link orderItem to the saved order
  //   }

  //   // Save all OrderItems at once
  //   await this.orderItemsRepository.save(orderItems);

  //   // Return the saved order
  //   return savedOrder;
  // }
}
