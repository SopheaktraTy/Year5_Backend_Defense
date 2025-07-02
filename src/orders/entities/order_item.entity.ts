// src/orders/entities/order-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, } from 'typeorm';
import { Order } from './order.entity';
import { CartItem } from '../../carts/entities/cart_item.entity';
  
  @Entity('order_items')
  export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Order, order => order.order_items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;
  
    @ManyToOne(() => CartItem, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'cart_item_id' })
    cart_item: CartItem;
  
    @Column({ type: 'int' })
    quantity: number;
  
    @Column({ type: 'numeric' }) // or float/decimal depending on your price model
    price_at_order: number;
  
    @CreateDateColumn({ name: 'create_at' })
    create_at: Date;
  
    @UpdateDateColumn({ name: 'update_at' })
    update_at: Date;
  }
  