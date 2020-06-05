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

    @Column({nullable: true})
    public leaveChannel: string;

    @Column({nullable: true})
    public leaveMessage: string;

    @Column({nullable: true})
    public leaveMessageActive: boolean;

    constructor(guildID: string)
    {
        super();
        this.guildID = guildID;
    }
}