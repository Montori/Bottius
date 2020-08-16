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
    private DO_NOT_DISABLE: Array<string> = ["disable", "enable", "server", "info", "permission", "bug", "prefix", "help"];

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        let commandToDisable: string = messageArray[0];
        
        if(!messageArray.length) return super.sendHelp(message);
        if (!(CommandService.getInstance().getCommandMap().has(messageArray[0]))) 
            return message.channel.send(super.getFailedEmbed().setDescription("Please specify a valid command!"));
        if (this.DO_NOT_DISABLE.some(command => command == commandToDisable)) return message.channel.send(super.getFailedEmbed().setDescription("You cannot disable this command!"));
        if(partition.getDisabledCommandsList().some(alreadyDisabledCommand => alreadyDisabledCommand == commandToDisable)) return message.channel.send(super.getFailedEmbed().setDescription("This command is already disabled!"));

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
        this.description = "disables a command";
        this.reqPermission = PermissionLevel.admin;
        this.usage = `${AbstractCommandOptions.prefix}disable {command}`;
    }
}