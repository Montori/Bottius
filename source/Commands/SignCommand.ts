import { Client, Message, MessageEmbed } from 'discord.js';
import { AbstractCommand } from './AbstractCommand';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';

export class SignCommand extends AbstractCommand {
    public commandOptions: AbstractCommandOptions = new SignCommandOptions();

    private BUNNY: string = '(\\__/) ││\n(•ㅅ•) ││\n/ 　 づ'; // <-- this bunny looks folded lol

    public runInternal(bot: Client, message: Message, messageArray: string[]) {
      if (this.cooldownService.isCooldown(message.member, `${this.commandOptions.commandName}<functional`)) return message.channel.send(new MessageEmbed().setColor('#ff0000').setDescription('You can only use this command every 60 seconds'));
      if (!messageArray[0]) return message.channel.send(super.getFailedEmbed().setDescription("Protest bunny can't protest without text on its sign"));
      const rawMessage: String = messageArray.join(' ').replace(/\s/g, '');
      const signMessage: Array<string> = this.groupWords(messageArray);
      const signLength: number = signMessage.reduce((a, b) => (a.length > b.length ? a : b)).length;

      if (rawMessage.length > 60) return message.channel.send(super.getFailedEmbed().setDescription('Your message is too long for a protest sign, keep it short.'));
      if (signLength > 14) return message.channel.send(super.getFailedEmbed().setDescription('One of the words is too long for a protest sign, keep it short.'));

      let signBunny = this.generateSign(signMessage, signLength);

      signBunny += this.BUNNY;

      message.channel.send(`\`\`\`${signBunny}\`\`\``);

      this.cooldownService.addCooldown(message.member, `${this.commandOptions.commandName}<functional`, 60);
      setTimeout(() => message.delete(), 3000);
    }

    private generateSign(signMessage: Array<string>, maxLength: number): string {
      const padding: string = ' '.repeat(Math.floor((14 - maxLength) / 2));

      let sign = `${padding}┌${'─'.repeat(maxLength)}┐\n`;

      signMessage.forEach((message) => sign += `${padding}│${message}${' '.repeat(maxLength - message.length)}│\n`);

      sign += `${padding}└${'─'.repeat(maxLength)}┘\n`;

      return sign;
    }

    private groupWords(words: Array<string>): Array<string> {
      const result: Array<string> = new Array();

      while (words.length > 0) {
        let line: string = words[0];

        words.shift();

        while ((line + words[0]).length < 10) {
          line += ` ${words[0]}`;
          words.shift();
        }

        result.push(line);
      }

      return result;
    }
}

class SignCommandOptions extends AbstractCommandOptions {
  constructor() {
    super();
    this.commandName = 'sign';
    this.description = 'will send a very vocal bunny with a protest sign into the chat';
    this.usage = `${AbstractCommandOptions.prefix}sign {message...}`;
  }
}
