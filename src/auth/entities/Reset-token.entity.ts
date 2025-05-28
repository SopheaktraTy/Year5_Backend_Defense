import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,ManyToOne,JoinColumn,} from 'typeorm';
import { User } from './User.entity';

@Entity('reset_tokens')
export class ResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User,  { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}