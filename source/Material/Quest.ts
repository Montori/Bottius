import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany,ManyToOne, JoinTable} from 'typeorm';
import { User } from './User';

@Entity()
export class Quest extends BaseEntity
{
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column()
    public readonly createdAt!: Date;

    @ManyToOne(type => User)
    public readonly assignor!: User;

    @ManyToOne(type => User, {cascade: ["insert"]})
    public assignee!: User;

    @Column()
    public description!: string;

    constructor(assignor: User, assignee: User, description: string){
        super();

        this.createdAt = new Date();
        this.assignor = assignor;
        this.assignee = assignee;
        this.description = description;
    }
}