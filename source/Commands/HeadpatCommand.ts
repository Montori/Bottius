import { AbstractCommand } from "./AbstractCommand";
import {Client, Message, GuildMember} from 'discord.js';
import * as Discord from 'discord.js';
import { UserService } from "../Service/UserService";
import {User} from "../Material/User";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";

export class HeadpatCommand extends AbstractCommand
{
    public commandOptions: HeadpatCommandOptions = new HeadpatCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let targetUser: GuildMember = message.mentions.members.first();
        
        if(targetUser)
        {
            if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional")) return message.channel.send("Slow down mate, your headpat energy needs to charge up again");
            if(targetUser == message.member) return message.channel.send("You can't headpat yourself, you lonely bag of potatoes...");
            let userToHeadpat: User = await this.userService.getUser(message.mentions.members.first());
    
            userToHeadpat.headPats += 1;
            userToHeadpat.save();
    
            message.channel.send(`${message.member} gave a headpat to ${message.mentions.members.first()}`);
            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 1800);
        }
        else
        {
            message.channel.send("Specify a user to headpat")
        }

    }

}

class HeadpatCommandOptions extends AbstractCommandOptions
{
    public commandName: string;
    public description: string;
    public usage: string;
    public cooldown: number;

    constructor()
    {
        super();
        this.commandName = "headpat";
        this.description = "Headpats a user";
        this.usage = `${AbstractCommandOptions.prefix}headpat {@User}`;
    }

}