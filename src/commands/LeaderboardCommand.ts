import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { Client, Message, GuildMember, MessageEmbed } from "discord.js";
import { User } from "../entities/persistent/User";
import { UserService } from "../service/UserService";
export class LeaderboardCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new LeaderboardCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let userService: UserService = UserService.getInstance();
        let rank = 0;
        let leaderboardEmbed: MessageEmbed;
        if(messageArray[0] == "headpat")
        {
            leaderboardEmbed = super.getSuccessEmbed(`Headpat Leaderboard of ${message.guild.name}`)
                                    .setDescription("Here are the most headpatted members of this server");
            let topHeadpatUsers: Array<User> = await userService.getHeadpatLeaderboard(message.guild);

            topHeadpatUsers.forEach(user => 
                {
                    let discordUser = bot.users.resolve(user.discordID);
                    let firstField = discordUser ? discordUser.tag : `<@${user.discordID}>`;
                    rank++
                    leaderboardEmbed.addField(`${rank == 1 ? "🥇" : rank == 2 ? "🥈" : rank == 3 ? "🥉" : `#${rank}`}  ${firstField}`, `Headpats: ${user.headPats}${rank == topHeadpatUsers.length ? " " : "\n឵"}`)
                });
        }
        else
        {   
            leaderboardEmbed = super.getSuccessEmbed(`Leaderboard of ${message.guild.name}`)
                                    .setDescription("Here are the most honorable members of this server");
            let topUsers: Array<User> = await userService.getLeaderbaord(message.guild);
    
            topUsers.forEach(user => 
                {
                    let discordUser = bot.users.resolve(user.discordID);
                    let firstField = discordUser ? discordUser.tag : `<@${user.discordID}>`;
                    rank++
                    leaderboardEmbed.addField(`${rank == 1 ? "🥇" : rank == 2 ? "🥈" : rank == 3 ? "🥉" : `#${rank}`}  ${firstField}`, `Level: ${user.getLevel()} \nXP: ${user.xp}${rank == topUsers.length ? " " : "\n឵"}`)
                });
        }

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

