import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Resource } from '../enums/resource.enum';
import { Action } from '../enums/action.enum';
import { Role } from './role.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Resource })
  resource: Resource;

  @Column({ type: 'enum', enum: Action, array: true })
  actions: Action[];

  @ManyToOne(() => Role, role => role.permissions, { onDelete: 'CASCADE' })
  role: Role;
}
