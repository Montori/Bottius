import {AbstractCommand} from "./AbstractCommand";
import {Client, Message, MessageEmbed} from 'discord.js';
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";

export class UwUifyCommand extends AbstractCommand
{
    public commandOptions: UwUifyCommandOptions = new UwUifyCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        if (!messageArray.length) 
        {
            message.channel.send(super.sendHelp(message));
        }
        else 
        {
            if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional")) return message.channel.send(new MessageEmbed().setColor("#ff0000").setDescription('You can only use this command every 30 seconds'));
            let rawMessage: String = messageArray.join(" ").replace(/\s/g, '');
            if(rawMessage.length > 150) return message.channel.send(super.getFailedEmbed().setDescription("Your message is too long! Shorten it down."));
            let botmessage = messageArray.join(' ');

            var faces = ["(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^"];
            //UwUify Letters
            botmessage = botmessage.replace(/(?:r|l)/g, "w");
            botmessage = botmessage.replace(/(?:R|L)/g, "W");
            botmessage = botmessage.replace(/n([aeiou])/g, 'ny$1');
            botmessage = botmessage.replace(/N([aeiou])/g, 'Ny$1');
            botmessage = botmessage.replace(/N([AEIOU])/g, 'Ny$1');

            //Add random faces
            botmessage = botmessage.replace(/\!+/g, " " + faces[Math.floor(Math.random() * faces.length)] + " ");

            //UwUify Specific
            botmessage = botmessage.replace(/ove/g, 'uv');
            botmessage = botmessage.replace(/mastew/g, 'mawster');
            botmessage = botmessage.replace(/can/g, 'cwan');

            message.channel.send(`${botmessage}`);
            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 30);
            message.delete();
        }
    }
}

class UwUifyCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "UwUify";
        this.description = "translates your messages to uwu langauge";
        this.usage = `${AbstractCommandOptions.prefix}UwUify {message...}`;
    }
}
