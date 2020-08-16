import {
  Client, Message, MessageEmbed, TextChannel,
} from 'discord.js';
import { AbstractCommand } from './AbstractCommand';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';
import { PermissionLevel } from '../Entities/Transient/PermissionLevel';
import { PartitionService } from '../Service/PartitionService';
import { Partition } from '../Entities/Persistent/Partition';

export class LeavemessageCommand extends AbstractCommand {
    public commandOptions: LeavemessageCommandOptions = new LeavemessageCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>) {
      const partition: Partition = await this.partitionService.getPartition(message.guild);

      if (messageArray[0] == 'toggle') {
        partition.leaveMessageActive = !partition.leaveMessageActive;
        message.channel.send(super.getSuccessEmbed().setDescription(`Leave messages have been turned ${partition.leaveMessageActive ? 'on' : 'off'}`));
      } else if (messageArray[0] == 'channel') {
        if (messageArray[1] == 'remove') {
          if (!partition.leaveChannel) return message.channel.send(super.getFailedEmbed().setDescription('Leave channel has not been set'));

          partition.leaveChannel = null;
          message.channel.send(super.getSuccessEmbed().setDescription('Leave channel has been removed'));
        } else {
          const channel: TextChannel = message.mentions.channels.first();
          if (!channel) return message.channel.send(super.getFailedEmbed().setDescription('Please provide a valid channel'));

          partition.leaveChannel = channel.id;
          message.channel.send(super.getSuccessEmbed().setDescription(`Leave channel has been set to ${channel}`));
        }
      } else if (messageArray[0] == 'reset') {
        if (!partition.leaveMessage) return message.channel.send(super.getFailedEmbed().setDescription('Leave message has not been set'));

        partition.leaveMessage = null;
        message.channel.send(super.getSuccessEmbed().setDescription('Leave message has been reset'));
      } else if (messageArray[0] == 'set') {
        const leaveMessage: string = messageArray.slice(1).join(' ');
        if (!leaveMessage.length) return message.channel.send(super.getFailedEmbed().setDescription('You can\'t choose a empty message'));

        partition.leaveMessage = leaveMessage;
        message.channel.send(super.getSuccessEmbed().setDescription(`Leave message has been set to: "**${leaveMessage}**"`));
      }

      partition.save();
    }
}

class LeavemessageCommandOptions extends AbstractCommandOptions {
  constructor() {
    super();
    this.commandName = 'leavemessage';
    this.description = 'configures the settings for the message when a user leaves the server';
    this.reqPermission = PermissionLevel.admin;
    this.usage = `${AbstractCommandOptions.prefix}leavemessage channel {#channel}`
            + `\n${AbstractCommandOptions.prefix}leavemessage channel remove`
            + `\n${AbstractCommandOptions.prefix}leavemessage {set|reset} {message}`
            + `\n${AbstractCommandOptions.prefix}leavemessage toggle`;
  }
}
