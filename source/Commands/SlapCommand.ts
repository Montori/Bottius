import { AbstractCommand } from "./AbstractCommand";
import {Client, Message, GuildMember} from 'discord.js';
import * as Discord from 'discord.js';
import { UserService } from "../Service/UserService";
import {User} from "../Material/User";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { PermissionLevel } from "../Material/PermissionLevel";

export class SlapCommand extends AbstractCommand
{
    public commandOptions: SlapCommandOptions = new SlapCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        const randomCooldownMessage: Array<String> = ["You seem to be really mad today. Calm down a bit", "That's it, I'm calling the police."];

        let targetMember: GuildMember = message.mentions.members.first();
        if(targetMember)
        {
            if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional")) 
                return message.channel.send(randomCooldownMessage[Math.floor(Math.random() * 2)]);
            else 
            {
                if(targetMember == message.member) return message.channel.send("Stop hating yourself. You don't deserve that.");
                let userToSlap: User = await this.userService.getUser(targetMember, message.guild);
            
                if(userToSlap.headPats === 0) 
                {
                    message.channel.send("Looks like they have no headpats left.")
                } 
                else 
                {
                    userToSlap.headPats --;
                    userToSlap.save();  
                    message.channel.send(`${message.member} slapped ${targetMember}`);
                    this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 7200);  
                }
            }
        }
        else
        {
            message.channel.send("Specify a user to slap")
        }

    }

}

class SlapCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "slap";
        this.description = "slaps a user and takes away 1 headpat";
        this.reqPermission = PermissionLevel.trusted;
        this.usage = `${AbstractCommandOptions.prefix}slap {@User}`;
    }

}
