import {Client, Message, MessageEmbed} from 'discord.js';
import { AbstractCommandOptions } from '../Material/AbstractCommandOptions';
import { CooldownService } from '../Service/CooldownService';

export abstract class AbstractCommand 
{
    public cooldownService: CooldownService = CooldownService.getInstance();

    public async run(bot: Client, message: Message, messageArray: Array<string>)
    {
        if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName))
        {
            this.sendCooldownEmbed(message);
        }
        else
        {
            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName, this.commandOptions.cooldown);
            this.runInternal(bot, message, messageArray);
        }
    }

    public abstract async runInternal(bot: Client, message: Message, messageArray: Array<string>);

    public sendHelp(message: Message)
    {
        let helpEmbed: MessageEmbed = new MessageEmbed()
            .setColor("#ff8000")
            .setAuthor(`Usage of Command: ${this.commandOptions.commandName}`)
            .setDescription(this.commandOptions.description)
            .addField("Usage", this.commandOptions.usage);

            message.channel.send(helpEmbed);
    }

    public sendPermissionDenied(message: Message)
    {
        message.channel.send(new MessageEmbed().setAuthor("Permission Denied").setDescription(`You lack the permissions to use the \`${this.commandOptions.commandName}\` command`).setColor("ff0000"));
    }

    public sendCooldownEmbed(message: Message)
    {
        let cooldownEmbed: MessageEmbed = new MessageEmbed()
            .setColor("#ff0000")
            .setAuthor(`${this.commandOptions.commandName} Cooldown`)
            .setDescription(`You can only use this command once every ${this.commandOptions.cooldown} seconds`);
        
        message.channel.send(cooldownEmbed);
    }

    public abstract commandOptions: AbstractCommandOptions;
}
