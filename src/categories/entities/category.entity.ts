import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category_name: string; // Matches categoryName in DTO

  @Column({ nullable: true })
  image: string; // Make sure this property exists

  @Column({ nullable: true })
  description: string; // Matches description in DTO

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
