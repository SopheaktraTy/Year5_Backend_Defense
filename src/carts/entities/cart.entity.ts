import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, OneToMany, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { CartItem } from '../entities/cart_item.entity';
import { Order } from 'src/orders/entities/order.entity';
@Entity('carts')
export class Cart {
@PrimaryGeneratedColumn('uuid')
id: string;

@ManyToOne(() => User, (user) => user.carts, { nullable: false })
@JoinColumn({ name: 'user_id' })
user: User;

@OneToMany(() => CartItem, cartItem => cartItem.cart)
cartItems: CartItem[];

@CreateDateColumn({ name: 'created_at', type: 'timestamp' })
createdAt: Date;

@UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
updatedAt: Date;

@OneToMany(() => Order, (order) => order.cart)
orders: Order[];
}
