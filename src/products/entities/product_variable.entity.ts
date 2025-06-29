import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { CartItem } from '../../carts/entities/cart_item.entity';

@Entity('product_variables')
export class ProductVariable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  size: string; // e.g., "S", "M", "L", "XL"

  @Column({ type: 'int', default: 0 })
  quantity: number; // quantity of the product in this size

  @ManyToOne(() => Product, (product) => product.product_variables ,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })  // Ensure the column name is 'product_id'
  product: Product;

  @OneToMany(() => CartItem, ci => ci.product_variable)
  cart_items: CartItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;  // Timestamp when the size was created

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date; // Automatically updates on every update operation

}