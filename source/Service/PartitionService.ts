import { Partition } from "../Material/Partition";
import { Guild } from "discord.js";

export class PartitionService
{
    private static instance: PartitionService;

    public static getInstance(): PartitionService
    {
        if(!PartitionService.instance)
        {
            this.instance = new PartitionService();
        }
        return this.instance;
    }

    public async getPartition(guild: Guild): Promise<Partition>
    {
        let foundPartition = await Partition.findOne({where: {guildID: guild.id}});

        if(!foundPartition)
        {
            foundPartition = new Partition(guild.id);
            (await foundPartition.save()).reload();
        }

        return foundPartition;
    }
}