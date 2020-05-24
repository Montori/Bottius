import {AbstractCommand} from "./AbstractCommand";
import {Client, Message} from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { UserService } from "../Service/UserService";

export class HugCommand extends AbstractCommand
{
    public commandOptions: HugCommandOptions = new HugCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        const taggedUser = message.mentions.users.first();
        if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional")) return message.channel.send("Woah there, you can't just give out hugs like thst like your some sort of charity. You need your arms to gather its strength back.");
        if(!taggedUser) {
            message.channel.send('Please specify a user to hug');
        }
        else if(message.author == taggedUser) {
                message.channel.send('You hugged yourself, it doesn\'t feel the same as someone else hugging you ;-;');
            }
            else {
                message.channel.send(`<@${message.author.id}> gave a hug to <@${taggedUser.id}>`);
            }
        this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 1200);
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