import { Message, Client, MessageEmbed } from 'discord.js';
import { AbstractCommand } from './AbstractCommand';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';
import { CommandService } from '../Service/CommandService';

export class HelpCommand extends AbstractCommand {
    public commandOptions: AbstractCommandOptions = new HelpCommandOptions();

    public runInternal(bot: Client, message: Message, messageArray: string[]) {
      const commandMap: Map<string, AbstractCommand> = CommandService.getInstance().getCommandMap();

      if (!messageArray[0]) {
        const helpEmbed: MessageEmbed = super.getSuccessEmbed('Bottius Command Help').setFooter("Don't worry this embed will get fancified soon.");
        const commandList: Array<AbstractCommand> = Array.from(commandMap.values());
        commandList.sort((command1, command2) => command1.commandOptions.commandName.localeCompare(command2.commandOptions.commandName));
        commandList.forEach((command) => helpEmbed.addField(`${command.commandOptions.commandName}`, `${command.commandOptions.description}`, true));
        return message.channel.send(helpEmbed);
      }
      const command: AbstractCommand = commandMap.get(messageArray[0].toLowerCase());
      if (!command) return message.channel.send(super.getFailedEmbed().setDescription(`${messageArray[0]} is not a command`));
      return command.sendHelp(message);
    }
}

class HelpCommandOptions extends AbstractCommandOptions {
  constructor() {
    super();
    this.commandName = 'help';
    this.description = 'helps you with the usage of Bottius';
    this.usage = `${AbstractCommandOptions.prefix}help\n${AbstractCommandOptions.prefix}help {command}`;
  }
}
