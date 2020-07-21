import { AutoRole } from "../Entities/Persistent/AutoRole";
import { PartitionService } from "./PartitionService";
import { Guild } from "discord.js";
import { Partition } from "../Entities/Persistent/Partition";

export class AutoRoleService
{
    private static instance: AutoRoleService;
    private partitionService: PartitionService = PartitionService.getInstance();

    public static getInstance(): AutoRoleService
    {
        if(!AutoRoleService.instance)
        {
            this.instance = new AutoRoleService();
        }

        return this.instance;
    }

    public async doesAutoRoleExist(role: string): Promise<boolean>
    {
        let result: boolean = false;
        let autoRole: AutoRole = await AutoRole.findOne({where: {role: role}});
        
        if(autoRole) result = true;
        return result;
    }

    public async addAutoRole(role: string, guild: Guild)
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        let autoRole: AutoRole = new AutoRole(role, partition);
        autoRole.save();
    }

    public async getAutoRole(role: string, guild: Guild) : Promise<AutoRole>
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        return AutoRole.findOne({where: {role: role, partition: partition}});
    }

    public async removeAutoRole(role: string, guild: Guild)
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        let autoRole: AutoRole = await AutoRole.findOne({where: {role: role, partition: partition}});
        if(autoRole) autoRole.remove();
    }

    public async getAllAutoRoles(guild: Guild) : Promise<Array<AutoRole>>
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        return await AutoRole.find({where: {partition: partition}});
    }
}