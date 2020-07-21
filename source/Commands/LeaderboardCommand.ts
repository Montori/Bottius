import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { Client, Message, GuildMember, MessageEmbed } from "discord.js";
import { User } from "../Entities/Persistent/User";
import { UserService } from "../Service/UserService";
export class LeaderboardCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new LeaderboardCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let userService: UserService = UserService.getInstance();
        let topUsers: Array<User> = await userService.getLeaderbaord(message.guild);
        let rank = 0;

        let leaderboardEmbed: MessageEmbed = super.getSuccessEmbed(`Leaderboard of ${message.guild.name}`)
                                                    .setDescription("Here are the most honorable members of this server");

        topUsers.forEach(user => 
            {
                let discordUser = bot.users.resolve(user.discordID);
                let firstField = discordUser ? discordUser.tag : `<@${user.discordID}>`;
                rank++
                leaderboardEmbed.addField(`${rank == 1 ? "🥇" : rank == 2 ? "🥈" : rank == 3 ? "🥉" : `#${rank}`}  ${firstField}`, `Level: ${user.getLevel()} \nXP: ${user.xp}`)
            });

        message.channel.send(leaderboardEmbed);
    }
}

class LeaderboardCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "leaderboard";
        this.description = "shows the leaderboard of this server";
        this.usage=`${AbstractCommandOptions.prefix}leaderboard`
    }
}

