import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Products } from '../../products/entities/products.entity';

@Entity()
export class Products_Sizes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Products, (product) => product.sizes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' }) // tells TypeORM to use this column as the FK
  product_id: Products;

  @Column()
  size: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int', { default: 0 })
  size_quantity: number;
}
