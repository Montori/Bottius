import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, MessageEmbed, GuildMember } from "discord.js";
import { UserService } from "../Service/UserService";
import { User } from "../Material/User";

export class StatsCommand extends AbstractCommand
{
    public commandOptions: StatsCommandHelp = new StatsCommandHelp();
    public userService: UserService = UserService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        if(message.mentions.members.first())
        {
            message.channel.send(await this.buildStatsEmbed(message.mentions.members.first()));
        }
        else
        {
            message.channel.send(await this.buildStatsEmbed(message.member));
        }
    }

    private async buildStatsEmbed(member: GuildMember): Promise<MessageEmbed>
    {
        let user: User = await this.userService.getUser(member);

        let embed: MessageEmbed = new MessageEmbed()
                                    .setAuthor(`Stats of ${member.user.tag}`)
                                    .addField("Level", `${user.getLevel()}`)
                                    .addField("XP", `${user.xp}`, true)
                                    .addField("XP to next level", `${user.getXPUntilNextLevel()}`, true)
                                    .addField("Headpats", `${user.headPats}`)
                                    .addField("Total messages", `${user.totalMessages}`)
                                    .setTimestamp(new Date())
                                    .setFooter(`You were pinged ${user.totalPings} times uwu`)
                                    .setColor(member.roles.hoist.color);
        return embed;
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