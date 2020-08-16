import { Partition } from "../entities/persistent/Partition";
import { Guild } from "discord.js";
import { Not, IsNull } from "typeorm";

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
            await (await foundPartition.save()).reload();
        }
        
        return foundPartition;
    }

    public async getPartitionsWithBirthday(): Promise<Array<Partition>>
    {
        return Partition.find({where: [{birthdayChannel: Not(IsNull())}, {birthdayRole: Not(IsNull())}]});  
    }

    public deletePartition(guild: Guild) 
    {
        this.getPartition(guild).then(partition => partition.remove());
    }
}