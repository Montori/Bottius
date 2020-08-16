import { Client, Message, MessageEmbed } from 'discord.js';
import { AbstractCommand } from './AbstractCommand';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';

export class PingCommand extends AbstractCommand {
    public commandOptions: PingCommandOptions = new PingCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>) {
      const pingMessage = await message.channel.send(new MessageEmbed().setColor('#ff0000').setDescription('Ping?'));
      pingMessage.edit(new MessageEmbed().setColor('#00FF00').setAuthor('Pong!').setDescription(`Latency: \`${pingMessage.createdTimestamp - message.createdTimestamp}\`ms \nAPI Latency: \`${Math.round(bot.ws.ping)}\`ms`));
    }
}

class PingCommandOptions extends AbstractCommandOptions {
  constructor() {
    super();
    this.commandName = 'ping';
    this.description = 'returns the bots ping';
    this.usage = `${AbstractCommandOptions.prefix}ping`;
  }
}
