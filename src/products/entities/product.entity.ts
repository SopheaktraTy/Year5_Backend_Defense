// products.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn } from 'typeorm';
import { Product_Size } from '../../product_sizes/entities/product_size.entity';

@Entity()
export class Product{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  category_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;  // Product name

  @Column({ nullable: true, type: 'varchar', length: 255 })
  picture: string;  // Optional product picture URL

  @Column({ nullable: true, type: 'text' })
  description: string;  // Optional product description

  @Column('float', { nullable: true })
  price: number;  // Product price

  @Column({ nullable: true, type: 'varchar', length: 50 })
  discount_type: string;  // 'percent' or 'fixed'

  @Column('float', { nullable: true })
  discount_value: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;  // Timestamp when the product was created

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date; // Timestamp for the last product update

  // One-to-many relationship with Product_Sizes
  @OneToMany(() => Product_Size, (productSize) => productSize.product, { cascade: true })
  sizes: Product_Size[];  // Product can have multiple sizes
}
