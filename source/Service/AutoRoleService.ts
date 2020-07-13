import { AutoRole } from "../Material/AutoRole";
import { PartitionService } from "./PartitionService";
import { Guild } from "discord.js";
import { Partition } from "../Material/Partition";

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

    public async doesAutoRoleExist(roleID: string): Promise<boolean>
    {
        let result: boolean = false;
        let role: AutoRole = await AutoRole.findOne({where: {role: roleID}});
        
        if(role) result = true;
        return result;
    }

    public async addAutoRole(roleID: string, guild: Guild)
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        let role: AutoRole = new AutoRole(roleID, partition);
        role.save();
    }

    public async getAutoRole(roleID: string, guild: Guild) : Promise<AutoRole>
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        return AutoRole.findOne({where: {role: roleID, partition: partition}});
    }

    public async removeAutoRole(roleID: string, guild: Guild)
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        let role: AutoRole = await AutoRole.findOne({where: {role: roleID, partition: partition}});
        if(role) role.remove();
    }

    public async getAllAutoRoles(guild: Guild) : Promise<Array<AutoRole>>
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        return await AutoRole.find({where: {partition: partition}});
    }
}
