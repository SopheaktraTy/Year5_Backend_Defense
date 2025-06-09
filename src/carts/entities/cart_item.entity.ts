// src/carts/entities/cart_item.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Cart } from './cart.entity';
  import { Product } from '../../products/entities/product.entity';
  import { ProductVariable } from '../../products/entities/product_variable.entity';
  
  @Entity('cart_items')
  export class CartItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Cart, cart => cart.cart_items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cart_id' })
    cart: Cart;
  
    @ManyToOne(() => Product, {  onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'product_id' })
    product?: Product;
  
    @ManyToOne(() => ProductVariable, pv => pv.cart_items, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'product_variable_id' })
    product_variable?: ProductVariable;
  
    @Column('int')
    quantity: number;
  
    @Column({ length: 10 })
    size: string;
  
    @Column('float')
    price_at_cart: number;
  
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updated_at: Date;
  }
  