import {Client, Message, MessageEmbed} from 'discord.js';
import { AbstractCommandHelpContent } from '../Material/AbstractCommandHelpContent';

export abstract class AbstractCommand 
{
    public abstract async run(bot: Client, message: Message, messageArray: Array<string>);

    public sendHelp(message: Message)
    {
        let helpEmbed: MessageEmbed = new MessageEmbed()
            .setColor("#ff8000")
            .setAuthor(`Usage of Command: ${this.helpEmbedContent.commandName}`)
            .setDescription(this.helpEmbedContent.description)
            .addField("Usage", this.helpEmbedContent.usage);

            message.channel.send(helpEmbed);
    }

    public sendPermissionDenied(message: Message)
    {
        message.channel.send(new MessageEmbed().setAuthor("Permission Denied").setDescription(`You lack the permissions to use the \`${this.helpEmbedContent.commandName}\` command`).setColor("ff0000"));
    }

    public abstract helpEmbedContent: AbstractCommandHelpContent;
}
