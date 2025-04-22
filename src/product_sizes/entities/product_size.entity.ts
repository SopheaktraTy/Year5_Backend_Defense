// product_size.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Products } from '../../products/entities/product.entity';

@Entity()
export class Product_Sizes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Many-to-one relationship with Products
  @ManyToOne(() => Products, (product) => product.sizes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })  // Explicit foreign key column
  product: Products;

  @Column()
  size_tag: string;  // Size of the product, e.g., "Small", "Medium", "Large"

  @Column('float')
  price: number;  // Price for this specific size

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;  // Timestamp when the size was created

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date; // Automatically updates on every update operation
}
