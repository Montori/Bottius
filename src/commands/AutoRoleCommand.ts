import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { Client, Message, Role, MessageEmbed } from "discord.js";
import { PermissionLevel } from "../entities/transient/PermissionLevel";
import { AutoRole } from "../entities/persistent/AutoRole";
import { Partition } from "../entities/persistent/Partition";

export class AutoRoleCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new AutoRoleCommandOptions();
    
    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        if(messageArray[0] == "add")
        {
            let role: Role = message.mentions.roles.first();
            if(!role) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid role"));
            
            new AutoRole(role.id, partition).save();
            return message.channel.send(super.getSuccessEmbed().setDescription(`${role} will now be assigned to new users`));
        }
        if(messageArray[0] == "remove")
        {
            let role: Role = message.mentions.roles.first();
            if(!role) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid role"));
            
            await AutoRole.findOne({where: {partition: partition, roleID: role.id}}).then(autoRole => autoRole.remove());
            return message.channel.send(super.getSuccessEmbed().setDescription(`${role} will no longer be assigned to new users`));
        }
        if(messageArray[0] == "list")
        {
            let autoRoleList: Array<Role> = (await (AutoRole.find({where: {partition: partition}}))).map(autoRole => message.guild.roles.resolve(autoRole.roleID));
            if(!autoRoleList.join().length) return message.channel.send(super.getSuccessEmbed(`There are no autoroles configured for ${message.guild.name}`));

            let autoRoleEmbed: MessageEmbed = super.getSuccessEmbed(`Autoroles of ${message.guild.name}`).setDescription(autoRoleList.join(`\n`));
            return message.channel.send(autoRoleEmbed);
        }
    }
}

class AutoRoleCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "autorole";
        this.description = "adds/removes/lists autoroles for this server";
        this.usage = `${AbstractCommandOptions.prefix}autorole add {role}\n${AbstractCommandOptions.prefix}autorole remove {role}\n${AbstractCommandOptions.prefix}autorole list`;
        this.reqPermission = PermissionLevel.admin;
    }
}