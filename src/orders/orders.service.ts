import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order_item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { ProductVariable } from '../products/entities/product_variable.entity';
import { CartItem } from '../carts/entities/cart_item.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductVariable) private productVariableRepository: Repository<ProductVariable>,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
  
    try {
      // 1. Find the user’s cart
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['cart_items', 'cart_items.product_variable', 'cart_items.product_variable.product']
      });
  
      if (!cart) {
        throw new NotFoundException(`Cart for user ${userId} not found`);
      }
  
      // 2. Validate cart items
      const cartItems = cart.cart_items;
      const validCartItems = createOrderDto.order_items.map(item => item.cart_item_id);
      const itemsToProcess: CartItem[] = [];
  
      for (const item of cartItems) {
        if (validCartItems.includes(item.id)) {
          itemsToProcess.push(item);
        }
      }
  
      if (itemsToProcess.length !== validCartItems.length) {
        throw new BadRequestException('Invalid cart items or cart items not belonging to the user');
      }
  
      let totalAmount = 0;
      for (const item of itemsToProcess) {
        const variant = item.product_variable;
  
        if (!variant || !variant.product) {
          throw new NotFoundException(`Product variant not found for item ${item.id}`);
        }
  
        // Check stock and update
        if (variant.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${variant.product.product_name} size ${variant.size}. Available stock: ${variant.quantity}`
          );
        }
  
        variant.quantity -= item.quantity;
        await queryRunner.manager.save(variant);
  
        const unitPrice = variant.product.discounted_price ?? variant.product.original_price;
        totalAmount += unitPrice * item.quantity;
      }
  
      // 3. Create the order
      const newOrder = this.orderRepository.create({
        user: { id: userId },
        cart: { id: cart.id },
        order_no: Math.floor(Math.random() * 1000000), // Example order number
        total_amount: totalAmount,
      });
  
      await queryRunner.manager.save(newOrder);
  
      // 4. Create order items
      const orderItems: OrderItem[] = [];
      for (const item of itemsToProcess) {
        const variant = item.product_variable;
        const unitPrice = variant?.product ? variant.product.discounted_price ?? variant.product.original_price: 0;
        const priceAtOrder = unitPrice * item.quantity;
  
        const orderItem = this.orderItemRepository.create({
          order: newOrder,
          cart_item: item,
          quantity: item.quantity,
          price_at_order: priceAtOrder,
        });
        orderItems.push(orderItem);
      }
  
      await queryRunner.manager.save(orderItems);
  
      // 5. Delete cart items
      for (const item of itemsToProcess) {
        await queryRunner.manager.delete(CartItem, item.id);
      }
  
      // Commit the transaction
      await queryRunner.commitTransaction();
  
      // 6. Retrieve and return the full order
      const fullOrder = await this.orderRepository.findOne({
        where: { id: newOrder.id },
        relations: ['order_items', 'order_items.cart_item', 'order_items.cart_item.product_variable', 'user', 'cart'],
      });
  
      if (!fullOrder) {
        throw new InternalServerErrorException('Failed to retrieve the created order');
      }
  
      return fullOrder;
    } catch (error) {
      // Rollback the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
  
}


