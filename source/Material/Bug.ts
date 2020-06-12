import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany,ManyToOne, JoinTable} from 'typeorm';
import { User } from './User';

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
    public readonly assignor!: User;

    constructor(assignor: User, description: string){
        super();

        this.createdAt = new Date();
        this.assignor = assignor;
        this.description = description;
    }
}