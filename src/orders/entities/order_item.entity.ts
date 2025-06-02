import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column('uuid')
order_id: string;

@Column('uuid')
cart_item_id: string;

@Column('integer')
quantity: number;

@Column('integer')
price_at_order: number;

@CreateDateColumn({ name: 'create_at' })
create_at: Date;

@UpdateDateColumn({ name: 'update_at' })
update_at: Date;
}
