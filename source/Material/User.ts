import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany} from 'typeorm';
import { Quest } from './Quest';
import { PermissionLevel } from './PermissionLevel';

@Entity()
export class User extends BaseEntity
{
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column({default: "", unique: true})
    public readonly discordID!: string;
    
    @Column()
    public readonly addedDate!: Date; 

    @Column()
    public lastMessage!: Date;

    @Column({default: 0})
    public totalMessages!: number;

    @Column({default: 0})
    public totalPings!: number;

    @Column({default: 0})
    public headPats! : number;

    @Column({default: 0})
    public xp!: number;

    @Column({type: "integer", enum: PermissionLevel, default: PermissionLevel.member})
    public permissionLevel!: PermissionLevel;

    @Column()
    public birthday: Date;

    constructor(discordID: string)
    {
        super();

        this.discordID = discordID;
        this.addedDate = new Date();
        this.lastMessage = new Date();
        this.totalMessages = 0;
        this.totalPings = 0;
        this.headPats = 0;
        this.xp = 0;
        this.permissionLevel = PermissionLevel.member;
    }

    public getLevel(): number
    {
        return Math.floor((Math.log((this.xp*Math.log(1.1))/(700)+1))/(Math.log(1.1)))+1;
    }

    public static getXP(level: number): number {
        return Math.ceil((Math.pow(1.1, level - 1) - 1) * 700 / Math.log(1.1));
    }

    public getXPToNextLevel(): number {
        return User.getXP(this.getLevel() + 1) - this.xp;
    }
}