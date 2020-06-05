import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Partition extends BaseEntity
{
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column()
    public readonly guildID: string;

    @Column({nullable: true})
    public suggestChannel: string;

    constructor(guildID: string)
    {
        super();
        this.guildID = guildID;
    }
}