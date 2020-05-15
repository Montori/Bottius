import {AbstractCommand} from "./AbstractCommand";
import {Client, Message, MessageEmbed} from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";

export class SuggestCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new SuggestCommandOptions();
    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {  
        const args = message.content.slice(AbstractCommandOptions.prefix.length).split(/ +/);
        const botmessage: string = args.join(' ');
        let suggestEmbed: MessageEmbed = new MessageEmbed()
        .setTitle(`${message.author.tag}`)
        .setAuthor('User Suggestion: ')
        .setDescription(`${botmessage}`)
        .setTimestamp(new Date)
        .setFooter('Suggest with Bottius');
        message.channel.send({ embed: suggestEmbed }).then(embedMessage => {
            embedMessage.react('✅');
            embedMessage.react('❌');
            embedMessage.react('🤷‍♀️');
        });
    }
}

class SuggestCommandOptions extends AbstractCommandOptions{
    public commandName: string;
    public description: string;
    public usage: string;

    constructor()
    {
        super();
        this.commandName = "suggest";
        this.description = "its a suggest cmd...";
        this.usage = `${AbstractCommandOptions.prefix}suggest`;
    }
}