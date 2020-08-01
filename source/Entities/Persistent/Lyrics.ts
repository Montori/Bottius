import { AbstractPartionable } from "./AbstractPartionable";
import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";
import { Guild } from "discord.js";
import { Partition } from "./Partition";

@Entity()
export class Lyrics extends AbstractPartionable
{
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column()
    public songtext: string;

    @Column()
    public artist: string;

    constructor(songtext: string, artist: string, partition: Partition)
    {
        super(partition);
        this.songtext = songtext;
        this.artist = artist;
    }
}