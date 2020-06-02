import { AbstractCommand } from "./AbstractCommand";
import {Client, Message, GuildMember} from 'discord.js';
import * as Discord from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";

export class HugCommand extends AbstractCommand
{
    public commandOptions: HugCommandOptions = new HugCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let taggedUser = message.mentions.users.first();
        
        if(taggedUser) {
            if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional")) return message.channel.send("Woah there, you can't just give out hugs like that, as if you're some sort of charity. Wait a bit until you have enough energy to hug someone");
            if(message.author == taggedUser) {
                    message.channel.send('You hugged yourself, it doesn\'t feel the same as someone else hugging you ;-;');
                }
                else {
                    message.channel.send(`<@${message.author.id}> gave a hug to <@${taggedUser.id}>`);
                }
            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 1200);
        }
        else {
            message.channel.send("Specify a user to hug");
        }
    }
}

class HugCommandOptions extends AbstractCommandOptions{
    public commandName: string;
    public description: string;
    public usage: string;
    public cooldown: number;

    constructor()
    {
        super();
        this.commandName = "hug";
        this.description = "Hugs a user UwU";
        this.usage = `${AbstractCommandOptions.prefix}hug {user}`;
    }

}