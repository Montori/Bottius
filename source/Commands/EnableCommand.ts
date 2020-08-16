import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { PermissionLevel } from "../Entities/Transient/PermissionLevel";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Entities/Persistent/Partition";
import { CommandService } from "../Service/CommandService";

export class EnableCommand extends AbstractCommand
{
    public commandOptions: EnableCommandOptions = new EnableCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        let commandToEnable: string = messageArray[0];

        if(!messageArray.length) return super.sendHelp(message);
        if (!(CommandService.getInstance().getCommandMap().has(messageArray[0]))) 
            return message.channel.send(super.getFailedEmbed().setDescription("Please specify a valid command!"));
        if (!partition.getDisabledCommandsList().some(disabledCommand => disabledCommand == commandToEnable)) return message.channel.send(super.getFailedEmbed().setDescription("This command is not disabled!"));
        
        partition.removeFromDisabledCommandList(commandToEnable);
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