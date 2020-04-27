import { AbstractCommand } from "./AbstractCommand";
import {Client, Message, GuildMember} from 'discord.js';
import * as Discord from 'discord.js';
import { UserService } from "../Service/UserService";
import {User} from "../Material/User";
import { AbstractCommandHelpContent } from "../Material/AbstractCommandHelpContent";
import { CooldownService } from "../Service/CooldownService";

export class HeadpatCommand extends AbstractCommand
{
    public helpEmbedContent: HeadpatCommandHelp = new HeadpatCommandHelp();
    private userService :UserService = UserService.getInstance();
    private cooldownService: CooldownService = CooldownService.getInstance();

    public async run(bot: Client, message: Message, messageArray: string[]) 
    {
        if(this.cooldownService.isCooldown(message.member, this.helpEmbedContent.commandName)) return message.channel.send("Slow down mate, your headpat energy needs to charge up again");
        let targetUser: GuildMember = message.mentions.members.first();

        if(targetUser)
        {
            if(targetUser == message.member) return message.channel.send("You can't headpat yourself, you lonely bag of potatoes...");
            let userToHeadpat: User = await this.userService.getUser(message.mentions.members.first());
    
            userToHeadpat.headPats += 1;
            userToHeadpat.save();
    
            message.channel.send(`${message.member} gave a headpat to ${message.mentions.members.first()}`);
            this.cooldownService.addCooldown(message.member, this.helpEmbedContent.commandName, 1800);
        }
        if(!messageArray[0])
        {
            message.channel.send(`${message.member} was headpatted ${(await this.userService.getUser(message.member)).headPats} times!`)
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