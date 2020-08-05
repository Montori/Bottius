import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, TextChannel, MessageEmbed } from "discord.js";
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { PermissionLevel } from "../Entities/Transient/PermissionLevel";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Entities/Persistent/Partition";
import { CommandService } from "../Service/CommandService";

export class ServerCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new ServerCommandOptions();
    private partitionService: PartitionService = PartitionService.getInstance();

    public runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        switch(messageArray[0])
        {
            case "suggestchannel": this.handleSuggestChannelCommand(bot, message, messageArray.slice(1)); break;
            case "ignorexp": this.handleXPIgnore(bot, message, messageArray.slice(1)); break;
            case "nomic": this.handleNoMic(bot, message, messageArray.slice(1)); break;
            case "prefix": this.customPrefix(bot, message, messageArray.slice(1)); break;
            case "enable": this.enableCommand(bot, message, messageArray.slice(1)); break;
            case "disable": this.disableCommand(bot, message, messageArray.slice(1)); break; 
            case "leavemessage": this.handleSetLeaveCommand(bot, message, messageArray.slice(1)); break; 
            case "tumbleweed": this.handleTumbleweedCommand(bot, message, messageArray.slice(1)); break; 
            default: super.sendHelp(message);
        }
    }

    private async handleTumbleweedCommand(bot: Client, message: Message, messageArray: string[])
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);

        if(messageArray.join(" ").startsWith("channel add"))
        {
            let tumbleweedChannel: TextChannel = message.mentions.channels.first() as TextChannel;
            if(!tumbleweedChannel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid description"));
            partition.addToTumbleWeedChannels(tumbleweedChannel.id);
            message.channel.send(super.getSuccessEmbed().setDescription(`${tumbleweedChannel} will now receive tumbleweeds.\nTake cover!`));
        }
        else if(messageArray.join(" ").startsWith("channel remove"))
        {
            let tumbleweedChannel: TextChannel = message.mentions.channels.first() as TextChannel;
            if(!tumbleweedChannel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid description"));
            partition.removeFromTumbleWeedChannels(tumbleweedChannel.id);
            message.channel.send(super.getSuccessEmbed().setDescription(`${tumbleweedChannel} will no longer receive tumbleweeds.`));
        }
        else if(messageArray.join(" ").startsWith("channel list"))
        {
            let tumbleweedChannelIDList: Array<string> = partition.getTumbleWeedChannels();
            let tumbleweedChannels: Array<TextChannel> = tumbleweedChannelIDList.map(channelID => message.guild.channels.resolve(channelID) as TextChannel);
            if(!tumbleweedChannels.length) return message.channel.send(super.getSuccessEmbed("There are currently no channels under attack from tumbleweed"));
            let embed: MessageEmbed = super.getSuccessEmbed("Channels under attack from tumbleweeds").setDescription(tumbleweedChannels.join("\n"));
            message.channel.send(embed);
        }

        partition.save();
    }

    private async enableCommand(bot: Client, message: Message, messageArray: string[])
    {   
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        if (partition.getDisabledCommandsList().indexOf(messageArray[0]) == -1) return message.channel.send(super.getFailedEmbed().setDescription("This command is not disabled!"));
        partition.removeFromDisabledCommandList(messageArray[0]);
        partition.save();
        message.channel.send(super.getSuccessEmbed().setDescription(`The command \`${messageArray[0]}\` has been enabled!`)); 
    }

    private async disableCommand(bot: Client, message: Message, messageArray: string[])
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        
        if (messageArray.length == 0 || !(CommandService.getInstance().getCommandMap().has(messageArray[0]))) 
            return message.channel.send(super.getFailedEmbed().setDescription("Please specify a valid command!"));
        if (messageArray[0] == "server") return message.channel.send(super.getFailedEmbed().setDescription("You cannot disable this command!"));
        if (partition.getDisabledCommandsList().indexOf(messageArray[0]) != -1) return message.channel.send(super.getFailedEmbed().setDescription("This command is already disabled!"));

        partition.addToDisabledCommandList(messageArray[0].toLowerCase());
        partition.save();
        message.channel.send(super.getSuccessEmbed().setDescription(`The command \`${messageArray[0]}\` has been disabled!`)); 
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
        else
        {
            super.sendHelp(message);
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
        else
        {
            super.sendHelp(message);
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
        else
        {
            super.sendHelp(message);
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

    private async handleSetLeaveCommand(bot: Client, message: Message, messageArray: string[])
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild)

        if(messageArray[0] == "toggle")
        {
            partition.leaveMessageActive = !partition.leaveMessageActive;
            
            message.channel.send(super.getSuccessEmbed().setDescription(`Leave messages have been turned ${partition.leaveMessageActive ? "on" : "off"}`));
        }

        else if(messageArray[0] == "channel")
        {
            if(messageArray[1] == "remove")
            {
                if(!partition.leaveChannel) 
                {
                    message.channel.send(super.getFailedEmbed().setDescription(`Leave channel has not been set`));
                }
                else
                {
                    partition.leaveChannel = null;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Leave channel has been removed`));
                }
            }
            else if(messageArray[1] == "set")
            {
                let channel: TextChannel = message.mentions.channels.first();
                if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
                else
                {
                    partition.leaveChannel = channel.id;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Leave channel has been set to ${channel}`));
                }
            }
        }

        else if(messageArray[0] == "reset")
        {
            if(!partition.leaveMessage) return message.channel.send(super.getFailedEmbed().setDescription(`Leave message has not been set`));
            else
            {
                    partition.leaveMessage = null;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Leave message has been reset`));
            }
        }
        else if(messageArray[0] == "set")
        {
            let leaveMessage: string = messageArray.slice(1).join(' ');
            if(!leaveMessage.length)
            {
                message.channel.send(super.getFailedEmbed().setDescription(`You can't choose a empty message`))
            }      
            else
            {
                partition.leaveMessage = leaveMessage;
                message.channel.send(super.getSuccessEmbed().setDescription(`Leave message has been set to: "**${leaveMessage}**"`));                
            }          
        }

        partition.save()
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
        this.usage = `${prefix}${this.commandName} suggestchannel {set|remove} {#channel}\n${prefix}${this.commandName} ignorexp {add|remove} {#channel}\n` + 
                     `${prefix}${this.commandName} prefix {set|reset} {prefix}\n${prefix}${this.commandName} {enable|disable} {command}\n`+
                     `${prefix}${this.commandName} nomic {add|remove} {#channel}\n`+
                     `${prefix}${this.commandName} leavemessage channel {set|remove} {#channel} \n${prefix}${this.commandName} leavemessage {set|reset} {message} \n${prefix}${this.commandName} leavemessage toggle`;
        this.reqPermission = PermissionLevel.admin;
    }
}
