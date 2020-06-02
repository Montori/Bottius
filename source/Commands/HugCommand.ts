import { AbstractCommand } from "./AbstractCommand";
import { Client, Message } from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";

export class HugCommand extends AbstractCommand
{
    public commandOptions: HugCommandOptions = new HugCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let taggedMember = message.mentions.members.first();
        
        if(taggedMember) 
        {
            if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional")) return message.channel.send("Woah there, you can't give out hugs like that, as if you're some sort of charity.");
            
            if(message.member == taggedMember) 
            {
                message.channel.send('You hugged yourself, it doesn\'t feel the same as someone else hugging you ;-;');
            }
            else 
            {
                message.channel.send(`${message.member} gave a hug to ${taggedMember}`);
            }

            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 1200);
        }
        else 
        {
            message.channel.send("Specify a user to hug");
        }
    }
}

class HugCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "hug";
        this.description = "Hugs a user";
        this.usage = `${AbstractCommandOptions.prefix}hug {user}`;
    }

}