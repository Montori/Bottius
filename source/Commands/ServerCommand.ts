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
            case "ignorexp": this.handleXPIgnore(bot, message, messageArray.slice(1)); break; // added break
            case "nomic": this.handleNoMic(bot, message, messageArray.slice(1)); break; // added break
            case "prefix": this.customPrefix(bot, message, messageArray.slice(1)); // prefix case
        }
    }

    private async customPrefix(bot: Client, message: Message, messageArray: string[])
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        if (messageArray[0] == "set")
        {
            // only valid input
            if (messageArray.length != 2) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid prefix, the prefix may not have spaces or be empty"));
            let prefix = messageArray[1]; // parse prefix
            partition.customPrefix = prefix; // set prefix in db and save
            partition.save();
            message.channel.send(super.getSuccessEmbed().setDescription(`The prefix now is \`${prefix}\``)); // feedback
        }
        else if (messageArray[0] == "reset")
        {
            partition.customPrefix = null; // reset, save and feedback
            partition.save();
            message.channel.send(super.getSuccessEmbed().setDescription(`The prefix has been successfully reset to ${AbstractCommandOptions.prefix}`));
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

    private async handleNoMic(bot: Client, message: Message, messageArray: string[])
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        let channel: TextChannel = message.mentions.channels.first();

        if(messageArray[0] == "add")
        {
            if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
            if(partition.getNoMicList().some(string => string == channel.id)) return message.channel.send(super.getFailedEmbed().setDescription("VC XP gain has already been enabled in this channel"));
            partition.addToNoMicList(channel.id);
            partition.save();
            message.channel.send(super.getSuccessEmbed().setDescription(`VC XP will now be gained in ${channel}`));
        }
        else if(messageArray[0] == "remove")
        {
            if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
            if(!partition.getNoMicList().some(string => string == channel.id)) return message.channel.send(super.getFailedEmbed().setDescription("VC XP gain is not enabled in this channel"));
            partition.removeFromNoMicList(channel.id);
            partition.save();
            message.channel.send(super.getSuccessEmbed().setDescription(`Regular XP gain is now enabled in ${channel}`));
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
        let prefix = AbstractCommandOptions.prefix;
        super();
        this.commandName = "server";
        this.description = "command for editing the settings of the current server"
        this.usage = `${prefix}${this.commandName} suggestchannel {set|remove} {#channel}\n${prefix}${this.commandName} ignorexp {add|remove} {#channel}\n${prefix}${this.commandName} prefix {set|reset} {prefix}` //TODO add usage
        this.reqPermission = PermissionLevel.admin;
    }
}