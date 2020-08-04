import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { PermissionLevel } from "../Entities/Transient/PermissionLevel";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Entities/Persistent/Partition";

export class XPIgnoreCommand extends AbstractCommand
{
    public commandOptions: XPIgnoreCommandOptions = new XPIgnoreCommandOptions();
    private partitionService: PartitionService = PartitionService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        let channel: TextChannel = message.mentions.channels.first();

        if(messageArray[0] == "remove")
        {
            if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
            if(!partition.getXPIgnoreList().some(string => string == channel.id)) return message.channel.send(super.getFailedEmbed().setDescription("XP gain is not disabled in this channel"));
            partition.removeFromXPIgnoreList(channel.id);
            partition.save();
            message.channel.send(super.getSuccessEmbed().setDescription(`XP gain is now enabled in ${channel}`));
        }
        else if(messageArray[0] == "list")
        {
            let xpignoreChannelIDList: Array<string> = partition.getXPIgnoreList();
            let xpignoreChannels: Array<TextChannel> = xpignoreChannelIDList.map(channelID => message.guild.channels.resolve(channelID) as TextChannel);
            if(!xpignoreChannels.length) return message.channel.send(super.getSuccessEmbed("There are currently no channels that don't gain xp"));
            let embed: MessageEmbed = super.getSuccessEmbed("Channels that don't gain xp").setDescription(xpignoreChannels.join("\n"));
            message.channel.send(embed);
        }
        else
        {
            if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
            if(partition.getXPIgnoreList().some(string => string == channel.id)) return message.channel.send(super.getFailedEmbed().setDescription("XP gain has already been disabled in this channel"));
            partition.addToXPIgnoreList(channel.id);
            partition.save();
            message.channel.send(super.getSuccessEmbed().setDescription(`XP gain is now disabled in ${channel}`));
        }
    }
}

class XPIgnoreCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "xpignore";
        this.description = "configures the channels where users wont gain xp";
        this.reqPermission = PermissionLevel.admin;
        this.cooldown = 0;
        this.usage = `${AbstractCommandOptions.prefix}xpignore {#channel}` +
                     `\n${AbstractCommandOptions.prefix}xpignore remove {#channel}` +
                     `\n${AbstractCommandOptions.prefix}xpignore list`;
    }
}