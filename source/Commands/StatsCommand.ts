import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, MessageEmbed, GuildMember } from "discord.js";
import { UserService } from "../Service/UserService";
import { User } from "../Material/User";
import { PermissionLevel } from "../Material/PermissionLevel";
import { MoreThan, MoreThanOrEqual, LessThan, Equal } from "typeorm";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Material/Partition";
import { Months, getDateSuffix } from "../Material/DateFormatting";

export class StatsCommand extends AbstractCommand
{
    public commandOptions: StatsCommandHelp = new StatsCommandHelp();
    public userService: UserService = UserService.getInstance();
    private partitionService: PartitionService = PartitionService.getInstance();

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
        let user: User = await this.userService.getUser(member, member.guild);
        let partition: Partition = await this.partitionService.getPartition(member.guild);

        let rank: number = (await User.count({where: {xp: MoreThanOrEqual(user.xp), partition: partition}}) - await User.count({where: {xp:Equal(user.xp), id:MoreThan(user.id), partition: partition}}));

        let embed: MessageEmbed = new MessageEmbed()
                                    .setAuthor(`Stats of ${member.user.tag} ${rank == 1 ? "🥇" : rank == 2 ? "🥈" : rank == 3 ? "🥉" : ""}`, member.user.displayAvatarURL())
                                    .addField("Level", `${user.getLevel()}`, true)
                                    .addField("XP", `${user.xp}`, true)
                                    .addField("Leaderboard rank", `${rank}`)
                                    .addField("Voice level", `${user.getVCLevel()}`, true)
                                    .addField("Voice XP", `${user.vcxp}`, true)
                                    .addField("Headpats", `${user.headPats}`)
                                    .addField("Total messages", `${user.totalMessages}`)
                                    .setTimestamp(new Date())
                                    .setFooter(`Permissions: ${PermissionLevel[user.permissionLevel]}`)
                                    .setColor(member.roles.hoist == null ? "000000" : member.roles.hoist.color);
        
        if(user.birthdate) embed.addField("Birthdate", `${Months[user.birthdate.getMonth()]} ${user.birthdate.getDate()}${getDateSuffix(user.birthdate.getDate())}`);
        
        return embed;
    }

}

class StatsCommandHelp extends AbstractCommandOptions
{
    constructor(){
        super();
        this.commandName = "stats";
        this.description = "shows the stats of a user";
        this.usage = `${AbstractCommandOptions.prefix}stats\n${AbstractCommandOptions.prefix}stats {@User}`;
    }
}