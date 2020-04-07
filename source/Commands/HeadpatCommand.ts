import { AbstractCommand } from "./AbstractCommand";
import {Client, Message, GuildMember} from 'discord.js';
import * as Discord from 'discord.js';
import { UserService } from "../Service/UserService";
import {User} from "../Material/User";
import { AbstractCommandHelpContent } from "../Material/AbstractCommandHelpContent";

export class HeadpatCommand extends AbstractCommand
{
    public helpEmbedContent: HeadpatCommandHelp = new HeadpatCommandHelp();

    public async run(bot: Client, message: Message, messageArray: string[]) 
    {
        let userService :UserService = UserService.getInstance();

        let targetUser: GuildMember = message.mentions.members.first();

        if(targetUser)
        {
            let userToHeadpat: User = await userService.getUser(message.mentions.members.first());
    
            userToHeadpat.headPats += 1;
            userToHeadpat.save();
    
            message.channel.send(`${message.member} gave a headpat to ${message.mentions.members.first()}`);
        }
        if(!messageArray[0])
        {
            message.channel.send(`${message.member} was headpatted ${(await userService.getUser(message.member)).headPats} times!`)
        }

    }

}

class HeadpatCommandHelp extends AbstractCommandHelpContent
{
    public commandName: string = "headpat";
    public description: string = "Headpats a user or tells you how many time you have been headpatted";
    public usage: string = `${AbstractCommandHelpContent.prefix}headpat\n${AbstractCommandHelpContent.prefix}headpat {@User}`;

    constructor()
    {
        super();
    }

}