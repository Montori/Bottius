import {AbstractCommand} from "./AbstractCommand";
import {Client, Message, MessageEmbed} from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { PermissionLevel } from "../Material/PermissionLevel";
import { UserService } from "../Service/UserService";

export class UwUifyCommand extends AbstractCommand
{
    public commandOptions: UwUifyCommandOptions = new UwUifyCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        if (!messageArray.length) {
            message.channel.send(super.getFailedEmbed().setDescription('Well, what do you want me to UwUify'));
        }
        else 
        {
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
        }
    }
}

class UwUifyCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "UwUify";
        this.description = "translates your messages to furry langauge";
        this.usage = `${AbstractCommandOptions.prefix}UwUify {message...}`;
    }
}