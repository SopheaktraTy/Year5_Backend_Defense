import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Products } from './products.entity';

@Entity()
export class Product_Size {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Products, product => product.sizes)
  product: Products;

  @Column()
  size: string;  // Size of the product (e.g., Small, Medium, Large)

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;  // Price for this specific size

  @Column('int', { default: 0 })
  quantity: number;  // Quantity of this specific size
}
