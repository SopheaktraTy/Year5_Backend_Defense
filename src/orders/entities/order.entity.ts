import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity'; // Adjust path as needed
import { Cart } from 'src/carts/entities/cart.entity';

@Entity('orders')
export class Order {
@PrimaryGeneratedColumn('uuid')
id: string;

@ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'user_id' })
user: User;

@ManyToOne(() => Cart, (cart) => cart.orders, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'cart_id' })
cart: Cart;

@Column('integer')
order_no: number;

@Column('integer')
total_amount: number;

@CreateDateColumn({ name: 'create_at' })
create_at: Date;

@UpdateDateColumn({ name: 'update_at' })
update_at: Date;
}
