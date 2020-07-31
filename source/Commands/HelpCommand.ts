import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { CommandService } from "../Service/CommandService"
import { Message, Client, MessageEmbed } from "discord.js";

export class HelpCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new HelpCommandOptions();

    public runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let commandMap: Map<string, AbstractCommand> = CommandService.getInstance().getCommandMap();
        
        if(!messageArray[0])
        {
            let helpEmbed: MessageEmbed = super.getSuccessEmbed("Bottius Command Help").setFooter("Don't worry this embed will get fancified soon.");
            commandMap.forEach(command => helpEmbed.addField(`${command.commandOptions.commandName}`, `${command.commandOptions.description}`));
            return message.channel.send(helpEmbed);
        }else
        {
            let command: AbstractCommand = commandMap.get(messageArray[0].toLowerCase());
            if(!command) return message.channel.send(super.getFailedEmbed().setDescription(`${messageArray[0]} is not a command`));
            else return command.sendHelp(message);
        }
        
    }
    
}

class HelpCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "help";
        this.description = "helps you with the usage of Bottius";
        this.usage = `${AbstractCommandOptions.prefix}help\n${AbstractCommandOptions.prefix}help {command}`
    }
}