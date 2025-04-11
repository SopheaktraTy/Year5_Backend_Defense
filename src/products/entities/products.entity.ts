import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Products_Sizes } from '../../products_size/entities/product_size.entity';
@Entity()
export class Products {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  category_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  description: string;

  @Column('float', { nullable: true })
  price: number;

  @Column({ nullable: true })
  discount_type: string;

  @Column('float', { nullable: true })
  discount_value: number;

  @Column('int', { default: 0 })
  total_quantity: number; // ✅ Added here

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany( () => Products_Sizes, productSize => productSize.product, { cascade: true })
  sizes: Products_Sizes[];
}
