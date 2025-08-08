/*NestJS imports*/
import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/*Service*/
import { TelegramBotService } from '../services/telegrambot.service';

/*DTOs*/
import { CreateOrderDto } from './dto/create-order.dto';

/*Entities*/
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order_item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../carts/entities/cart_item.entity';
import { ProductVariable } from '../products/entities/product_variable.entity';
import { Product } from '../products/entities/product.entity';


@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>, 
    private readonly telegramBotService: TelegramBotService,
  ) {}

  /*-----------------> Create a Order: <-----------------*/
  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Load user's cart with necessary relations
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['cart_items', 'cart_items.product_variable', 'cart_items.product_variable.product'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart for user ${userId} not found`);
      }

      const validCartItems = createOrderDto.order_items.map(i => i.cart_item_id);
      const itemsToProcess = cart.cart_items.filter(i => validCartItems.includes(i.id));

      if (itemsToProcess.length !== validCartItems.length) {
        throw new BadRequestException('Invalid or missing cart items in request');
      }

      let totalAmount = 0;

      for (const item of itemsToProcess) {
        const variant = item.product_variable;
        const product = variant?.product;

        if (!variant || !product) {
          throw new NotFoundException(`Product or variant not found for cart item ${item.id}`);
        }

        if (variant.quantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.product_name} size ${variant.size}`);
        }

        // Deduct variant quantity
        variant.quantity -= item.quantity;
        await queryRunner.manager.save(ProductVariable, variant);

        // Recalculate total_quantity for product
        const allVariants = await queryRunner.manager.find(ProductVariable, {
          where: { product: { id: product.id } },
        });

        product.total_quantity = allVariants.reduce((sum, v) => sum + v.quantity, 0);

        await queryRunner.manager.save(Product, product);

        // Accumulate total amount
        const unitPrice = product.discounted_price ?? product.original_price;
        totalAmount += unitPrice * item.quantity;
      }

      // 2. Create Order
      const order = this.orderRepository.create({
        user: { id: userId },
        cart: { id: cart.id },
        order_no: Math.floor(Math.random() * 1000000),
        total_amount: totalAmount,
      });

      await queryRunner.manager.save(Order, order);

      // 3. Create Order Items
      const orderItems: OrderItem[] = [];

      for (const item of itemsToProcess) {
        const product = item.product_variable?.product!;
        const unitPrice = product.discounted_price ?? product.original_price;

        const orderItem = this.orderItemRepository.create({
          order,
          product,
          quantity: item.quantity,
          price_at_order: unitPrice * item.quantity,
        });

        orderItems.push(orderItem);
      }

      await queryRunner.manager.save(OrderItem, orderItems);

      // 4. Remove Cart Items
      for (const item of itemsToProcess) {
        await queryRunner.manager.delete(CartItem, item.id);
      }

      // 5. Commit
      await queryRunner.commitTransaction();

      // 6. Reload order with relations for notification and returning
      const fullOrder = await this.orderRepository.findOne({
        where: { id: order.id },
        relations: ['order_items', 'order_items.product', 'user', 'cart'],
      });

      if (!fullOrder) {
        throw new InternalServerErrorException('Failed to load created order');
      }

      // Prepare user's full name safely
      const userName = fullOrder.user
        ? `${fullOrder.user.firstname ?? ''} ${fullOrder.user.lastname ?? ''}`.trim() || 'Unknown User'
        : 'Unknown User';

      // Get list of product names from order items
      const productNames = fullOrder.order_items.length > 0
        ? fullOrder.order_items.map(item => item.product?.product_name || 'Unknown Product').join(', ')
        : 'Unknown Product';

      const productDetails = orderItems
  .map(
    (item, index) =>
      `item-${index + 1}: ${item.product.product_name} x${item.quantity} – ${item.price_at_order.toLocaleString()}$`
  )
  .join('\n');

      // Send Telegram notification with all data
      await this.telegramBotService.sendOrderNotification(
        fullOrder.order_no.toString(),
        fullOrder.total_amount,
        userName,
        productDetails, // product name + quantity list
        fullOrder.user.email || 'N/A',
        fullOrder.user.phone_number ? fullOrder.user.phone_number.toString() : 'N/A'
      );
      // 7. Return full order
      return fullOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  /*-----------------> Find order by User: <-----------------*/
  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['order_items', 'order_items.product', 'user', 'cart'],
      order: { create_at: 'DESC' },
    });
  }


  /*-----------------> Find all order : <-----------------*/
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['order_items', 'order_items.product', 'user', 'cart'],
      order: { create_at: 'DESC' },
    });
  }

  /*-----------------> Find order by ID : <-----------------*/
  async findOne(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['order_items', 'order_items.product', 'user', 'cart'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }
    return order;
  }

  
  async toggleStatus(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    // ✅ Toggle between statuses
    order.status =
      order.status === OrderStatus.NOT_YET_APPROVED
        ? OrderStatus.APPROVED
        : OrderStatus.NOT_YET_APPROVED;

    return this.orderRepository.save(order);
  }

}



