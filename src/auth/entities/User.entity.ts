import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm';
import { Cart } from '../../carts/entities/cart.entity';
import { Role } from '../../roles/entities/role.entity';

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


  @Column({ type: 'enum', enum: ['active', 'not_verified', 'suspended'], default: 'not_verified' })
  status: 'active' | 'not_verified' | 'suspended';

  @Column({ type: 'text', nullable: true })
  image: string | null ;

  @ManyToOne(() => Role, role => role.users, { eager: true })  
  @JoinColumn({ name: 'role_id' })
  role: Role;

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
