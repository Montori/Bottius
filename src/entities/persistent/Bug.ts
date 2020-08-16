import { User } from './User';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Bug extends BaseEntity
{
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column()
    public readonly createdAt!: Date;

    @Column()
    public description!: string;

    @ManyToOne(type => User)
    public assignor!: User;

    constructor(assignor: User, description: string){
        super();

        this.createdAt = new Date();
        this.assignor = assignor;
        this.description = description;
    }
}