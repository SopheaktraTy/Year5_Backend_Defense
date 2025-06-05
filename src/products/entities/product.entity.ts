import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn, ManyToOne} from 'typeorm';
import { IsOptional, Min, Max } from 'class-validator';
import { Category } from '../../categories/entities/category.entity';
import { ProductVariable } from './product_variable.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Category, category => category.products, { onDelete: 'SET NULL', nullable: true })
  category: Category | null;


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
  created_at: Date;  // Timestamp when the product was created

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date; // Timestamp for the last product update

  @OneToMany(() => ProductVariable, (product_variable) => product_variable.product, { cascade: true })
  product_variables: ProductVariable[];
}
