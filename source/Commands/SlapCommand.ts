import { AbstractCommand } from "./AbstractCommand";
import {Client, Message, GuildMember, MessageEmbed} from 'discord.js';
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
                return message.channel.send(new MessageEmbed().setColor("#ff0000").setDescription(randomCooldownMessage[Math.floor(Math.random() * 2)]));
            else 
            {
                if(targetMember == message.member) return message.channel.send(new MessageEmbed().setColor("#ff0000").setDescription("Stop hating yourself. You don't deserve that."));
                let userToSlap: User = await this.userService.getUser(targetMember, message.guild);
            
                if(userToSlap.headPats === 0) 
                {
                    message.channel.send(new MessageEmbed().setColor("#ff0000").setDescription("Looks like they have no headpats left."))
                } 
                else 
                {
                    let randomInt = Math.floor(Math.random() * 3); 
                    if(randomInt === 1)
                    {
                        if((await this.userService.getUser(targetMember, message.guild)).permissionLevel >= PermissionLevel.master)
                        {
                            let userToSlap: User = await this.userService.getUser(message.member, message.guild);
                            message.channel.send(new MessageEmbed().setColor("#ff0000").setDescription(`How dare you slap the ones creating me? \n Get a taste of your own medicine.`))
                            message.channel.send(new MessageEmbed().setColor("#00FF00").setDescription(`*Bottius slapped ${message.member}*`))
                            if(userToSlap.headPats != 0)
                            {
                                userToSlap.headPats --;
                                userToSlap.save();    
                            }
                            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 7200); 
                        }                        
                    }
                    else
                    {
                        userToSlap.headPats --;
                        userToSlap.save();  
                        message.channel.send(new MessageEmbed().setColor("#00FF00").setDescription(`${message.member} slapped ${targetMember}`));
                        this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 7200);  
                    }

                }
            }
        }
        else
        {
            message.channel.send(new MessageEmbed().setColor("#ff0000").setDescription("Specify a user to slap"))
        }

    }

}

class SlapCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "slap";
        this.description = "Slaps a user and takes away 1 headpat";
        this.reqPermission = PermissionLevel.trusted;
        this.usage = `${AbstractCommandOptions.prefix}slap {@User}`;
    }

}