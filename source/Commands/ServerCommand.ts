import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, TextChannel } from "discord.js";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { PermissionLevel } from "../Material/PermissionLevel";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Material/Partition";

export class ServerCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new ServerCommandOptions();
    private partitionService: PartitionService = PartitionService.getInstance();

    public runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        switch(messageArray[0])
        {
            case "suggestchannel": this.handleSuggestChannelCommand(bot, message, messageArray.slice(1)); break;
            case "ignorexp": this.handleXPIgnore(bot, message, messageArray.slice(1));
        }
    }
    
    private async handleXPIgnore(bot: Client, message: Message, messageArray: string[])
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        let channel: TextChannel = message.mentions.channels.first();

        if(messageArray[0] == "add")
        {
            if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
            if(partition.getXPIgnoreList().some(string => string == channel.id)) return message.channel.send(super.getFailedEmbed().setDescription("XP gain has already been disabled in this channel"));
            partition.addToXPIgnoreList(channel.id);
            partition.save();
            message.channel.send(super.getSuccessEmbed().setDescription(`XP gain is now disabled in ${channel}`));
        }
        else if(messageArray[0] == "remove")
        {
            if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
            if(!partition.getXPIgnoreList().some(string => string == channel.id)) return message.channel.send(super.getFailedEmbed().setDescription("XP gain is not disabled in this channel"));
            partition.removeFromXPIgnoreList(channel.id);
            partition.save();
            message.channel.send(super.getSuccessEmbed().setDescription(`XP gain is now enabled in ${channel}`));
        }
    }

    private async handleSuggestChannelCommand(bot: Client, message: Message, messageArray: string[])
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);

        if(messageArray[0] == "set")
        {
            let channel: TextChannel = message.mentions.channels.first();
            if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
            
            partition.suggestChannel = channel.id;
            partition.save();

            message.channel.send(super.getSuccessEmbed().setDescription(`Suggest channel has been set to ${channel}`));
        }
        else if(messageArray[0] == "remove")
        {
            if(!partition.suggestChannel) return message.channel.send(super.getFailedEmbed().setDescription("Suggest channel has not been set"));

            partition.suggestChannel = null;
            partition.save();
            message.channel.send(super.getSuccessEmbed().setDescription("Suggest channel has been removed"));
        }
    }
}

class ServerCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "server";
        this.description = "command for editing the settings of the current server"
        this.usage = ""; //TODO add usage
        this.reqPermission = PermissionLevel.admin;
    }
}