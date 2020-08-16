import {
  Client, Message, MessageEmbed, TextChannel,
} from 'discord.js';
import { AbstractCommand } from './AbstractCommand';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';
import { PermissionLevel } from '../Entities/Transient/PermissionLevel';
import { PartitionService } from '../Service/PartitionService';
import { Partition } from '../Entities/Persistent/Partition';

export class TumbleweedCommand extends AbstractCommand {
    public commandOptions: TumbleweedCommandOptions = new TumbleweedCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>) {
      const partition: Partition = await this.partitionService.getPartition(message.guild);

      if (messageArray[0] == 'remove') {
        const tumbleweedChannel: TextChannel = message.mentions.channels.first() as TextChannel;
        if (!tumbleweedChannel) return message.channel.send(super.getFailedEmbed().setDescription('Please provide a valid description'));
        if (!partition.getTumbleWeedChannels().some((string) => string == tumbleweedChannel.id)) return message.channel.send(super.getFailedEmbed().setDescription('This channel is not under attack from tumbleweeds'));
        partition.removeFromTumbleWeedChannels(tumbleweedChannel.id);
        message.channel.send(super.getSuccessEmbed().setDescription(`${tumbleweedChannel} will no longer receive tumbleweeds.`));
      } else if (messageArray[0] == 'list') {
        const tumbleweedChannelIDList: Array<string> = partition.getTumbleWeedChannels();
        const tumbleweedChannels: Array<TextChannel> = tumbleweedChannelIDList.map((channelID) => message.guild.channels.resolve(channelID) as TextChannel);
        if (!tumbleweedChannels.length) return message.channel.send(super.getSuccessEmbed('There are currently no channels under attack from tumbleweed'));
        const embed: MessageEmbed = super.getSuccessEmbed('Channels under attack from tumbleweeds').setDescription(tumbleweedChannels.join('\n'));
        message.channel.send(embed);
      } else if (messageArray[0] == 'add') {
        const tumbleweedChannel: TextChannel = message.mentions.channels.first() as TextChannel;
        if (!tumbleweedChannel) return message.channel.send(super.getFailedEmbed().setDescription('Please provide a valid channel'));
        if (partition.getTumbleWeedChannels().some((string) => string == tumbleweedChannel.id)) return message.channel.send(super.getFailedEmbed().setDescription('Tumbleweeds are already at war in this channel'));
        partition.addToTumbleWeedChannels(tumbleweedChannel.id);
        message.channel.send(super.getSuccessEmbed().setDescription(`${tumbleweedChannel} will now receive tumbleweeds.\nTake cover!`));
      } else return super.sendHelp(message);

      partition.save();
    }
}

class TumbleweedCommandOptions extends AbstractCommandOptions {
  constructor() {
    super();
    this.commandName = 'tumbleweed';
    this.description = 'sends a tumbleweed when the chat is inactive';
    this.reqPermission = PermissionLevel.admin;
    this.usage = `${AbstractCommandOptions.prefix}tumbleweed add {#channel}`
            + `\n${AbstractCommandOptions.prefix}tumbleweed remove {#channel}`
            + `\n${AbstractCommandOptions.prefix}tumbleweed list`;
  }
}
