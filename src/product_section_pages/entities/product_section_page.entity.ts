import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('product_section_pages')
export class ProductSectionPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string; // e.g., "Top Trending", "New Arrivals"

  @Column({ type: 'text', nullable: true })
  banner_image: string | null; // base64 or image URL

  @ManyToMany(() => Product, { eager: true })
  @JoinTable({
    name: 'product_section_products',
    joinColumn: { name: 'section_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: Product[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
