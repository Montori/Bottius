import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';
import { AbstractPartionable } from './AbstractPartionable';
import { Partition } from './Partition';

@Entity()
export class Perk extends AbstractPartionable
{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public reqLevel!: number;

    @Column()
    public role!: string;

    constructor(reqLevel: number, role: string, partition: Partition)
    {
        super(partition);
        this.reqLevel = reqLevel;
        this.role = role;
    }
}
