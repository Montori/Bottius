import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { PermissionLevel } from "../Entities/Transient/PermissionLevel";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Entities/Persistent/Partition";
import { CommandService } from "../Service/CommandService";

export class DisableCommand extends AbstractCommand
{
    public commandOptions: DisableCommandOptions = new DisableCommandOptions();
    private partitionService: PartitionService = PartitionService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        
        if (messageArray.length == 0 || !(CommandService.getInstance().getCommandMap().has(messageArray[0]))) 
            return message.channel.send(super.getFailedEmbed().setDescription("Please specify a valid command!"));
        if (messageArray[0] == "disable") return message.channel.send(super.getFailedEmbed().setDescription("You cannot disable this command!"));
        if (messageArray[0] == "enable") return message.channel.send(super.getFailedEmbed().setDescription("You cannot disable this command!"));
        if (partition.getDisabledCommandsList().indexOf(messageArray[0]) != -1) return message.channel.send(super.getFailedEmbed().setDescription("This command is already disabled!"));

        partition.addToDisabledCommandList(messageArray[0].toLowerCase());
        partition.save();
        message.channel.send(super.getSuccessEmbed().setDescription(`The command \`${messageArray[0]}\` has been disabled!`)); 
    }
}

class DisableCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "disable";
        this.description = "disables commands";
        this.reqPermission = PermissionLevel.admin;
        this.cooldown = 0;
        this.usage = `${AbstractCommandOptions.prefix}disable {command}`;
    }
}