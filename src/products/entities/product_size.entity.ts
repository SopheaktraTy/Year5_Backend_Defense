// product_size.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Product_Size {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  size: string; // e.g., "S", "M", "L", "XL"

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;  // Timestamp when the size was created

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date; // Automatically updates on every update operation
}


