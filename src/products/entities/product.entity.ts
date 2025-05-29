import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn, ManyToOne} from 'typeorm';
import { Product_Size } from './product_size.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Category, category => category.products, { onDelete: 'SET NULL' })
  category: Category; // This adds the relation

  @Column({ type: 'varchar', length: 255 })
  name: string;  // Product name

  @Column({ nullable: true, type: 'varchar', length: 255 })
  image: string;  // Optional product picture URL

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


}
