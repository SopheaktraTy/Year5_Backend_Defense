import{ Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity({name: 'product'})
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true})
    name: string;

    @Column({type: 'text', nullable: true})
    description: string;

    @Column({type: 'boolean', default: true})
    active: boolean;
}
