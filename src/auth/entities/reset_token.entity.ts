import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,ManyToOne,JoinColumn,} from 'typeorm';
import { User } from './user.entity';

@Entity('reset_tokens')
export class ResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reset_token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User,  { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}