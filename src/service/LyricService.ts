import { Guild } from "discord.js";
import { PartitionService } from "./PartitionService";
import { Lyrics } from "../entities/persistent/Lyrics";

export class LyricService
{
    private static instance: LyricService;
    private partitionService: PartitionService = PartitionService.getInstance();
    
    public static getInstance(): LyricService
    {
        if(!LyricService.instance)
        {
            this.instance = new LyricService();
        }
        return this.instance;
    }

    public async addLyrics(artist: string, songtext: string, guild: Guild): Promise<Lyrics>
    {
        let lyrics: Lyrics = new Lyrics(songtext, artist, await this.partitionService.getPartition(guild));
        (await lyrics.save()).reload();

        return lyrics;
    }

    public async removeLyrics(id: number): Promise<Lyrics>
    {
        let removedLyrics: Lyrics = await Lyrics.findOne({where: {id: id}});
        if(removedLyrics) removedLyrics.remove();
        return removedLyrics;
    }

    public async getRandomLyrics(): Promise<Lyrics>
    {
        return await Lyrics.getRepository().createQueryBuilder().orderBy("random()").getOne();
    }
}