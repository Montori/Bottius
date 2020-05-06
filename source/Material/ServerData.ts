import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class ServerData extends BaseEntity {
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column({ unique: true })
    public readonly guildID!: string;

    @Column()
    public readonly addedDate!: Date;

    @Column({ default: "" })
    public birthdayChannelID: string;

    @Column({ default: "" })
    public birthdayRoleID: string;

    constructor(guildID: string) {
        super();

        this.guildID = guildID;
        this.addedDate = new Date();
    }
}