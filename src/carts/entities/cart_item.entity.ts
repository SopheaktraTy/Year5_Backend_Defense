import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Cart } from './/cart.entity';           // adjust import path
import { Product } from '../../products/entities/product.entity';     // adjust import path
import { ProductVariable } from '../../products/entities/product_variable.entity'; // adjust import path

@Entity('cart_items')
export class CartItem {
@PrimaryGeneratedColumn('uuid')
id: string;

@ManyToOne(() => Cart, cart => cart.cartItems, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'cart_id' })
cart: Cart;

@ManyToOne(() => Product,{ onDelete: 'SET NULL' })
@JoinColumn({ name: 'product_id' })
product: Product;

@ManyToOne(() => ProductVariable, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'product_variable_id' }) // Reference to ProductVariable entity
product_variable: ProductVariable;

@Column('int')
quantity: number;

@Column()
size: string;

@Column('float')
price_at_cart: number;

@CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
createdAt: Date;

@UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
updatedAt: Date;
}