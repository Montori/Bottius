import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { PermissionLevel } from "../entities/transient/PermissionLevel";
import { PartitionService } from "../service/PartitionService";
import { Partition } from "../entities/persistent/Partition";

export class PrefixCommand extends AbstractCommand
{
    public commandOptions: PrefixCommandOptions = new PrefixCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        
        if (messageArray[0] == "set")
        {
            if (messageArray.length != 2) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid prefix, the prefix may not have spaces or be empty"));
            let prefix = messageArray[1];
            partition.customPrefix = prefix;
            partition.save();
            
            return message.channel.send(super.getSuccessEmbed().setDescription(`The prefix now is \`${prefix}\``));
        }
        if (messageArray[0] == "reset")
        {
            partition.customPrefix = null;
            partition.save();
            return message.channel.send(super.getSuccessEmbed().setDescription(`The prefix has been successfully reset to \`${AbstractCommandOptions.prefix}\``));
        }

        return super.sendHelp(message);
    }
}

class PrefixCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "prefix";
        this.description = "changes the prefix for bottius";
        this.reqPermission = PermissionLevel.admin;
        this.usage = `${AbstractCommandOptions.prefix}prefix set {prefix}` +
                     `\n${AbstractCommandOptions.prefix}prefix reset`;
    }
}