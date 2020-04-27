import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';

@Entity()
export class Perk extends BaseEntity
{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public reqLevel!: number;

    @Column()
    public role!: string;

    constructor(reqLevel: number, role: string)
    {
        super();
        this.reqLevel = reqLevel;
        this.role = role;
    }
}
