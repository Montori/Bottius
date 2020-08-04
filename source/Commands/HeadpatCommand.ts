import { AbstractCommand } from "./AbstractCommand";
import {Client, Message, GuildMember, MessageEmbed} from 'discord.js';
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { User } from "../Entities/Persistent/User";

export class HeadpatCommand extends AbstractCommand
{
    public commandOptions: HeadpatCommandOptions = new HeadpatCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let targetUser: GuildMember = message.mentions.members.first();
        
        if(targetUser)
        {
            if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional")) return message.channel.send(super.getFailedEmbed().setDescription("Slow down mate, your headpat energy needs to charge up again"));
            if(targetUser == message.member) return message.channel.send(new MessageEmbed().setColor("#ff0000").setDescription("You can't headpat yourself, you lonely bag of potatoes..."));
            let userToHeadpat: User = await this.userService.getUser(message.mentions.members.first(), message.guild);
    
            userToHeadpat.headPats += 1;
            userToHeadpat.save();
    
            message.channel.send(new MessageEmbed().setColor("#00FF00").setDescription(`${message.member} gave a headpat to ${message.mentions.members.first()}`));
            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 1800);
        }
        else
        {
            message.channel.send(super.getFailedEmbed().setDescription("Specify a user to headpat"))
        }

    }

}

class HeadpatCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "headpat";
        this.description = "headpats a user";
        this.usage = `${AbstractCommandOptions.prefix}headpat {@User}`;
    }

}
