import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, MessageEmbed } from "discord.js";
import { UserService } from "../Service/UserService";
import { User } from "../Material/User";
import { CooldownService } from "../Service/CooldownService";

export class StatsCommand extends AbstractCommand
{
    public commandOptions: StatsCommandHelp = new StatsCommandHelp();
    public userService: UserService = UserService.getInstance();
    public coolDownService: CooldownService = CooldownService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        if(this.coolDownService.isCooldown(message.member, this.commandOptions.commandName)) return
        let user: User = await this.userService.getUser(message.member);

        let embed: MessageEmbed = new MessageEmbed()
                                        .setAuthor(`Stats of ${message.member.user.tag}`)
                                        .addField("Level", `${user.getLevel()}`)
                                        .addField("XP", `${user.xp}`)
                                        .addField("Headpats", `${user.headPats}`)
                                        .addField("Total messages", `${user.totalMessages}`)
                                        .setTimestamp(new Date())
                                        .setFooter(`You were pinged ${user.totalPings} times uwu`)
                                        .setColor(message.member.roles.hoist.color);
        
        
        message.channel.send(embed);

        this.coolDownService.addCooldown(message.member, this.commandOptions.commandName, 30);
    }

}

class StatsCommandHelp extends AbstractCommandOptions
{
    public commandName: string;
    public description: string;
    public usage: string;
    public cooldown: number;
    
    constructor(){
        super();
        this.commandName = "stats";
        this.description = "shows the stats of a user";
        this.usage = `${AbstractCommandOptions.prefix}stats\n${AbstractCommandOptions.prefix}stats {@User}`;
    }
}