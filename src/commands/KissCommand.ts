import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed } from 'discord.js';
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";

export class KissCommand extends AbstractCommand
{
    public commandOptions: KissCommandOptions = new KissCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let taggedMember = message.mentions.members.first();
        
        if(taggedMember) 
        {
            if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional")) return message.channel.send(super.getFailedEmbed().setDescription("Slow down pal, moisten your lips first"));
            
            if(message.member == taggedMember) 
            {
                message.channel.send(new MessageEmbed().setColor("#00FF00").setDescription('You kissed a mirror.'));
            }
            else 
            {
                message.channel.send(new MessageEmbed().setColor("#00FF00").setDescription(`${message.member} kissed ${taggedMember}`));
            }

            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 600);
        }
        else 
        {
            message.channel.send(super.getFailedEmbed().setDescription("Specify a user to kiss"));
        }
    }
}

class KissCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "kiss";
        this.description = "kiss a user";
        this.usage = `${AbstractCommandOptions.prefix}kiss {user}`;
    }

}
