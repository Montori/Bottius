import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from "typeorm";

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
    public birthdayChannel: string;

    @Column({nullable: true})
    public birthdayRole: string;

    @Column("simple-array", {nullable: true})
    private xpIgnoreList: Array<string>;

    @Column({nullable: true})
    public customPrefix: string; // prefix in db

    public getXPIgnoreList(): Array<string>
    {
        if(this.xpIgnoreList == null) this.xpIgnoreList = new Array<string>();
        return this.xpIgnoreList;
    }

    public addToXPIgnoreList(channelID: string)
    {
        if(this.xpIgnoreList == null) this.xpIgnoreList = new Array<string>();
        this.xpIgnoreList.push(channelID);
    }

    public removeFromXPIgnoreList(channelID: string)
    {
        if(this.xpIgnoreList == null) this.xpIgnoreList = new Array<string>();
        this.xpIgnoreList = this.xpIgnoreList.filter(string => string != channelID);
    }

    public getNoMicList(): Array<string>
    {
        if(this.xpIgnoreList == null) this.xpIgnoreList = new Array<string>();
        return this.xpIgnoreList;
    }

    public addToNoMicList(channelID: string)
    {
        if(this.xpIgnoreList == null) this.xpIgnoreList = new Array<string>();
        this.xpIgnoreList.push(channelID);
    }

    public removeFromNoMicList(channelID: string)
    {
        if(this.xpIgnoreList == null) this.xpIgnoreList = new Array<string>();
        this.xpIgnoreList = this.xpIgnoreList.filter(string => string != channelID);
    }

    constructor(guildID: string)
    {
        super();
        this.guildID = guildID;
    }
}