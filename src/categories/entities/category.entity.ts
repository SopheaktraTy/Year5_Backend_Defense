import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category_name: string; // Matches categoryName in DTO

  @Column({ nullable: true })
  description: string; // Matches description in DTO

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @Column({ nullable: true })
  image: string; // Make sure this property exists
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  
}
