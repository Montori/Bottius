import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed } from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";

export class LickCommand extends AbstractCommand
{
    public commandOptions: LickCommandOptions = new LickCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let taggedMember = message.mentions.members.first();
        
        if(taggedMember) 
        {
            if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional")) return message.channel.send(super.getFailedEmbed().setDescription("Woah there, you can't give out licks like that, as if you're some sort of charity."));
            
            if(message.member == taggedMember) 
            {
                message.channel.send(new MessageEmbed().setColor("#00FF00").setDescription('You licked yourself, it doesn\'t feel the same as someone else licking you ;-;'));
            }
            else 
            {
                message.channel.send(new MessageEmbed().setColor("#00FF00").setDescription(`${message.member} gave a lick to ${taggedMember}`));
            }

            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 600);
        }
        else 
        {
            message.channel.send(super.getFailedEmbed().setDescription("Specify a user to lick"));
        }
    }
}

class LickCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "lick";
        this.description = "licks a user";
        this.usage = `${AbstractCommandOptions.prefix}lick {user}`;
    }

}
