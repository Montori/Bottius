import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';
import { AbstractPartionable } from './AbstractPartionable';
import { Partition } from './Partition';

@Entity()
export class AutoRole extends AbstractPartionable
{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public role!: string;

    constructor(role: string, partition: Partition)
    {
        super(partition);
        this.role = role;
    }
}
