import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Category {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({ nullable: true, type: 'text' }) // Use text for large base64 string
image: string;

@Column({ type: 'varchar', length: 255 })
category_name: string;

@Column({ nullable: true, type: 'varchar', length: 255 })
description: string; // Optional category description

@OneToMany(() => Product, product => product.category)
products: Product[];
}
