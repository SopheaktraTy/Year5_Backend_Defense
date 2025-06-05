import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Cart } from '../../carts/entities/cart.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  otp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otp_expires_at: Date | null;


  @Column({ default: false })
  is_verified: boolean;

  @Column({ type: 'text', nullable: true })
  image: string | null ;

  @Column({ nullable: true })
  role_id: string;

  @Column({ nullable: true })
  firstname: string;

  @Column({ nullable: true })
  lastname: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'bigint', nullable: true })
  phone_number: number | null;

  @Column({ type: 'timestamp', nullable: true })
  date_of_birth: Date | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

}
