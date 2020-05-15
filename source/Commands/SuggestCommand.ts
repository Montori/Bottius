import {AbstractCommand} from "./AbstractCommand";
import {Client, Message, MessageEmbed} from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";

export class SuggestCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new SuggestCommandOptions();
    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {  
        const botmessage: string = messageArray.join(' ');
        let suggestEmbed: MessageEmbed = new MessageEmbed()
        .setTitle(`${message.author.tag}`)
        .setAuthor('User Suggestion: ')
        .setDescription(`${botmessage}`)
        .setTimestamp(new Date())
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
    public cooldown: number;

    constructor()
    {
        super();
        this.commandName = "suggest";
        this.description = "Creates an embed with your suggestion";
        this.usage = `${AbstractCommandOptions.prefix}suggest {suggestion ...}`;
        this.cooldown = 1800;
    }
}