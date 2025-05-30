import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column()
refresh_token: string;

@Column({ type: 'timestamp' })
expires_at: Date;

@ManyToOne(() => User, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'user_id' })
user: User;

@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
created_at: Date;

@UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
updated_at: Date;
}
