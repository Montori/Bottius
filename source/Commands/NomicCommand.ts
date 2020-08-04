import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { PermissionLevel } from "../Entities/Transient/PermissionLevel";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Entities/Persistent/Partition";

export class NomicCommand extends AbstractCommand
{
    public commandOptions: NomicCommandOptions = new NomicCommandOptions();
    private partitionService: PartitionService = PartitionService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        message.channel.send(super.getFailedEmbed().setDescription("This command is disabled for now until vc xp is implemented again"));

       let partition: Partition = await this.partitionService.getPartition(message.guild);
       let channel: TextChannel = message.mentions.channels.first();

       if(messageArray[0] == "remove")
       {
           if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
           if(!partition.getNoMicList().some(string => string == channel.id)) return message.channel.send(super.getFailedEmbed().setDescription("VC XP gain is not enabled in this channel"));
           partition.removeFromNoMicList(channel.id);
           partition.save();
           message.channel.send(super.getSuccessEmbed().setDescription(`Regular XP gain is now enabled in ${channel}`));
       }
       else if(messageArray[0] == "list")
       {
           let nomicChannelIDList: Array<string> = partition.getNoMicList();
           let nomicChannels: Array<TextChannel> = nomicChannelIDList.map(channelID => message.guild.channels.resolve(channelID) as TextChannel);
           if(!nomicChannels.length) return message.channel.send(super.getSuccessEmbed("There are currently no nomic channels"));
           let embed: MessageEmbed = super.getSuccessEmbed("List of nomic channels").setDescription(nomicChannels.join("\n"));
           message.channel.send(embed);
       }
       else
       {
           if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
           if(partition.getNoMicList().some(string => string == channel.id)) return message.channel.send(super.getFailedEmbed().setDescription("VC XP gain has already been enabled in this channel"));
           partition.addToNoMicList(channel.id);
           partition.save();
           message.channel.send(super.getSuccessEmbed().setDescription(`VC XP will now be gained in ${channel}`));
       }
    }
}

class NomicCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "nomic";
        this.description = "manages the text channels that gain vc xp for users that don't have mics";
        this.reqPermission = PermissionLevel.admin;
        this.cooldown = 0;
        this.usage = `${AbstractCommandOptions.prefix}nomic {#channel}` +
                     `\n${AbstractCommandOptions.prefix}nomic remove {#channel}` +
                     `\n${AbstractCommandOptions.prefix}nomic list`;
    }
}