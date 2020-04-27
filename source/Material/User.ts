import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany} from 'typeorm';
import { Quest } from './Quest';

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
    }

    public getLevel(): number
    {
        let lvl: number = 1;
        let xp: number = this.xp;

        while(xp > 0)
        {
            let nextLvl: number = Math.pow(1.1,lvl)*1000;

            if(xp >= nextLvl)
            {
                lvl++;
            }
            xp -= nextLvl;
        }

        return lvl;
    }
}