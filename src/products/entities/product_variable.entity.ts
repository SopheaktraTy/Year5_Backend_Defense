import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variables')
export class ProductVariable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  size: string; // e.g., "S", "M", "L", "XL"

  @Column({ type: 'int', default: 0 })
  quantity: number; // quantity of the product in this size

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;  // Timestamp when the size was created

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date; // Automatically updates on every update operation
}