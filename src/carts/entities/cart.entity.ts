import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { CartItem } from './cart_item.entity';
  
  @Entity('carts')
  export class Cart {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, user => user.carts, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @OneToMany(() => CartItem, item => item.cart)
    cart_items: CartItem[];
  
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updated_at: Date;
  }
  