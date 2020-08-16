import { Entity, Unique, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AbstractPartionable } from './AbstractPartionable';
import { Partition } from './Partition';
import { PermissionLevel } from '../transient/PermissionLevel';

@Entity()
@Unique(["discordID", "partition"])
export class User extends AbstractPartionable
{
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column({default: ""})
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

    @Column({default: 0})
    public vcxp!: number;

    @Column({type: "integer", enum: PermissionLevel, default: PermissionLevel.member})
    public permissionLevel!: PermissionLevel;

    @Column({nullable: true})
    public birthdate: Date;

    constructor(discordID: string, partition: Partition)
    {
        super(partition);

        this.discordID = discordID;
        this.addedDate = new Date();
        this.lastMessage = new Date();
        this.totalMessages = 0;
        this.totalPings = 0;
        this.headPats = 0;
        this.xp = 0;
        this.vcxp = 0;
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

    public getVCLevel(): number
    {
        return Math.floor((Math.log((this.vcxp*Math.log(1.1))/(700)+1))/(Math.log(1.1)))+1;
    }
}