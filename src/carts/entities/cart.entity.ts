import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { User } from '../../auth/entities/user.entity';

@Entity('carts')
export class Cart {
@PrimaryGeneratedColumn('uuid')
id: string;

@ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
@JoinColumn({ name: 'user_id' })
user_id: User;

@CreateDateColumn({ name: 'created_at', type: 'timestamp' })
createdAt: Date;

@UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
updatedAt: Date;
}
