import { Perk } from "../Entities/Persistent/Perk";
import { PartitionService } from "./PartitionService";
import { Guild } from "discord.js";
import { Partition } from "../Entities/Persistent/Partition";

export class PerkService
{
    private static instance: PerkService;
    private partitionService: PartitionService = PartitionService.getInstance();

    public static getInstance(): PerkService
    {
        if(!PerkService.instance)
        {
            this.instance = new PerkService();
        }

        return this.instance;
    }

    public async doesPerkExist(roleID: string): Promise<boolean>
    {
        let result: boolean = false;
        let perk: Perk = await Perk.findOne({where: {role: roleID}});
        
        if(perk) result = true;
        return result;
    }

    public async addPerk(lvl: number, roleID: string, guild: Guild)
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        let perk: Perk = new Perk(lvl, roleID, partition);
        perk.save();
    }

    public async getPerk(roleID: string, guild: Guild) : Promise<Perk>
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        return Perk.findOne({where: {role: roleID, partition: partition}});
    }

    public async removePerk(roleID: string, guild: Guild)
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        let perk: Perk = await Perk.findOne({where: {role: roleID, partition: partition}});
        if(perk) perk.remove();
    }

    public async getAllPerks(guild: Guild) : Promise<Array<Perk>>
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        return await Perk.find({order: {reqLevel:"DESC"}, where: {partition: partition}});
    }
}
