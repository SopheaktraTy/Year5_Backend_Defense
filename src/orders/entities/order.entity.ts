// src/orders/entities/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { OrderItem } from './order_item.entity';
import { Cart } from '../../carts/entities/cart.entity';
import { User } from '../../auth/entities/user.entity';

export enum OrderStatus {
  NOT_YET_APPROVED = 'not_yet_approved',
  APPROVED = 'approved',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Cart, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ type: 'int' })
  order_no: number;

  @Column({ type: 'numeric' })
  total_amount: number;

  // ✅ NEW STATUS COLUMN
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NOT_YET_APPROVED,
  })
  status: OrderStatus;

  @CreateDateColumn({ name: 'create_at' })
  create_at: Date;

  @UpdateDateColumn({ name: 'update_at' })
  update_at: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  order_items: OrderItem[];
}
