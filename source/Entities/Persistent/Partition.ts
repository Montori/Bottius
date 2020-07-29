import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from "typeorm";

@Entity()
export class Partition extends BaseEntity
{
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column({unique: true})
    public readonly guildID: string;

    @Column({nullable: true})
    public suggestChannel: string;

    @Column({nullable: true})
    public birthdayChannel: string;

    @Column({nullable: true})
    public birthdayRole: string;

    @Column({type: "text", array: true, nullable: true})
    private xpIgnoreList: Array<string>;

    @Column({nullable: true})
    public customPrefix: string;

    @Column({type: "text", array: true, nullable: true})
    private disabledCommandsList: Array<string>;

    @Column({type: "text", array: true, nullable: true})
    private noMicList: Array<string>;

    @Column({type: "text", array: true, nullable: true})
    private tumbleWeedChannels: Array<string>;

    @Column({nullable: true})
    public leaveChannel: string;

    @Column({nullable: true})
    public leaveMessage: string;

    @Column({nullable: true})
    public leaveMessageActive: boolean;

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

    public getTumbleWeedChannels(): Array<string> // self explanatory
    {
        if(this.tumbleWeedChannels == null) this.tumbleWeedChannels = new Array<string>();
        return this.tumbleWeedChannels;
    }

    public addToTumbleWeedChannels(command: string)
    {
        if(this.tumbleWeedChannels == null) this.tumbleWeedChannels = new Array<string>();
        this.tumbleWeedChannels.push(command);
    }

    public removeFromTumbleWeedChannels(command: string)
    {
        if(this.tumbleWeedChannels == null) this.tumbleWeedChannels = new Array<string>();
        this.tumbleWeedChannels = this.tumbleWeedChannels.filter(string => string != command);
    }

    public getNoMicList(): Array<string>
    {
        if(this.noMicList == null) this.noMicList = new Array<string>();
        return this.noMicList;
    }

    public addToNoMicList(channelID: string)
    {
        if(this.noMicList == null) this.noMicList = new Array<string>();
        this.noMicList.push(channelID);
    }

    public removeFromNoMicList(channelID: string)
    {
        if(this.noMicList == null) this.noMicList = new Array<string>();
        this.noMicList = this.noMicList.filter(string => string != channelID);
    }

    public getDisabledCommandsList(): Array<string> // self explanatory
    {
        if(this.disabledCommandsList == null) this.disabledCommandsList = new Array<string>();
        return this.disabledCommandsList;
    }

    public addToDisabledCommandList(command: string)
    {
        if(this.disabledCommandsList == null) this.disabledCommandsList = new Array<string>();
        this.disabledCommandsList.push(command);
    }

    public removeFromDisabledCommandList(command: string)
    {
        if(this.disabledCommandsList == null) this.disabledCommandsList = new Array<string>();
        this.disabledCommandsList = this.disabledCommandsList.filter(string => string != command);
    }

    constructor(guildID: string)
    {
        super();
        this.guildID = guildID;
    }
}