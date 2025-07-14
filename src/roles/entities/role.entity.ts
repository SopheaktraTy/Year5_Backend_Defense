import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Permission, permission => permission.role, { cascade: true, eager: true })
  permissions: Permission[];

  @OneToMany(() => User, user => user.role)
  users: User[];
}