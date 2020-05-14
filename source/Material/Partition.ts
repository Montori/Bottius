import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Partition extends BaseEntity
{
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column()
    public readonly guildID: string;

    constructor(guildID: string)
    {
        super();
        this.guildID = guildID;
    }
}