import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product_Size } from '../../products_size/entities/product_size.entity';

@Entity()
export class Products {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  originalPrice: number;  // Original price before discount

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  salePrice: number;  // Sale price after discount

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Product_Size, productSize => productSize.product, { cascade: true })
  sizes: Product_Size[];  // A product has many size variations
}
