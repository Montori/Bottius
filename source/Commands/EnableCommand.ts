import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { PermissionLevel } from "../Entities/Transient/PermissionLevel";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Entities/Persistent/Partition";

export class EnableCommand extends AbstractCommand
{
    public commandOptions: EnableCommandOptions = new EnableCommandOptions();
    private partitionService: PartitionService = PartitionService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        if (partition.getDisabledCommandsList().indexOf(messageArray[0]) == -1) return message.channel.send(super.getFailedEmbed().setDescription("This command is not disabled!"));
        partition.removeFromDisabledCommandList(messageArray[0]);
        partition.save();
        message.channel.send(super.getSuccessEmbed().setDescription(`The command \`${messageArray[0]}\` has been enabled!`)); 
    }
}

class EnableCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "enable";
        this.description = "enables disabled commands";
        this.reqPermission = PermissionLevel.admin;
        this.cooldown = 0;
        this.usage = `${AbstractCommandOptions.prefix}enable {command}`;
    }
}