import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, MessageEmbed, GuildMember } from "discord.js";
import { UserService } from "../Service/UserService";
import { User } from "../Material/User";
import { PermissionLevel } from "../Material/PermissionLevel";
import { MoreThan, MoreThanOrEqual, LessThan } from "typeorm";

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
        let rank: number = await User.count({where: {xp: MoreThanOrEqual(user.xp), id: LessThan(user.id)}})+1;

        let embed: MessageEmbed = new MessageEmbed()
                                    .setAuthor(`Stats of ${member.user.tag} ${rank == 1 ? "🥇" : rank == 2 ? "🥈" : rank == 3 ? "🥉" : ""}`)
                                    .addField("Level", `${user.getLevel()}`)
                                    .addField("XP", `${user.xp}`, true)
                                    .addField("XP to next level", `~${user.getXPToNextLevel()}`, true)
                                    .addField("Leaderboard rank", `${rank}`)
                                    .addField("Headpats", `${user.headPats}`)
                                    .addField("Total messages", `${user.totalMessages}`)
                                    .setTimestamp(new Date())
                                    .setFooter(`Permissions: ${PermissionLevel[user.permissionLevel]}`)
                                    .setColor(member.roles.hoist == null ? "000000" : member.roles.hoist.color);
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