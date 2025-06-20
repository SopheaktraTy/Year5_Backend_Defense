import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { IsOptional, Min, Max } from 'class-validator';
import { Category } from '../../categories/entities/category.entity';
import { ProductVariable } from './product_variable.entity';
import { CartItem } from '../../carts/entities/cart_item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Category, category => category.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @OneToMany(() => CartItem, cartItem => cartItem.product)  // Correct relation
  cart_items: CartItem[];

  @Column({ type: 'varchar', length: 255 })
  product_name: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  image: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column('float')
  original_price: number;
  
  @Column('float', { nullable: true, default: null })
  discounted_price: number | null;

  @Column({ type: 'int', default: 0 })
  total_quantity: number;

  @IsOptional()
  @Min(0)
  @Max(100)
  @Column({ type: 'float', nullable: true, default: null })
  discount_percentage_tag?: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
  
  @OneToMany(() => ProductVariable, (product_variable) => product_variable.product)
  product_variables: ProductVariable[];  // Changed from 'product_variables' to 'productVariables'
}
