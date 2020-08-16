import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { PermissionLevel } from "../entities/transient/PermissionLevel";
import { PartitionService } from "../service/PartitionService";
import { Partition } from "../entities/persistent/Partition";
import { CommandService } from "../service/CommandService";

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