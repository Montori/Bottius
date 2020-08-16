import { Client, Message, GuildMember } from 'discord.js';
import { AbstractCommand } from './AbstractCommand';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';

export class AvatarCommand extends AbstractCommand {
    public commandOptions: AbstractCommandOptions = new AvatarCommandOptions();

    public runInternal(bot: Client, message: Message, messageArray: string[]) {
      const member: GuildMember = message.mentions.members.first();

      if (!member) return message.channel.send(super.getSuccessEmbed(`Avatar of ${message.member.user.tag}`).setImage(message.member.user.displayAvatarURL()));
      message.channel.send(super.getSuccessEmbed(`Avatar of ${member.user.tag}`).setImage(member.user.displayAvatarURL()));
    }
}

class AvatarCommandOptions extends AbstractCommandOptions {
  constructor() {
    super();
    this.commandName = 'avatar';
    this.description = 'sends the avatar of the specified member';
    this.usage = `${AbstractCommandOptions.prefix}avatar @member`;
  }
}
