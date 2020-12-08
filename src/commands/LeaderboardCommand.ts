import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { Client, Message, MessageEmbed } from "discord.js";
import { User } from "../entities/persistent/User";
import { UserService } from "../service/UserService";
export class LeaderboardCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new LeaderboardCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let userService: UserService = UserService.getInstance();
        let leaderboardEmbed: MessageEmbed;
        
        if(messageArray[0] == "headpat")
        {
            let topHeadpatUsers: Array<User> = await userService.getHeadpatLeaderboard(message.guild);
            leaderboardEmbed = await this.createLeaderboardEmbed(bot, topHeadpatUsers, true)
            leaderboardEmbed.setAuthor(`Headpat Leaderboard of ${message.guild.name}`);
            leaderboardEmbed.setDescription("Here are the most headpatted members of this server");
        }
        else
        {   
            let topUsers: Array<User> = await userService.getLeaderbaord(message.guild);
            leaderboardEmbed = await this.createLeaderboardEmbed(bot, topUsers, false)
            leaderboardEmbed.setAuthor(`Leaderboard of ${message.guild.name}`);
            leaderboardEmbed.setDescription("Here are the most honorable members of this server");
        }

        message.channel.send(leaderboardEmbed);
    }

    private async createLeaderboardEmbed(bot: Client, topUserList: Array<User>, isHeadpatLeaderboard: boolean): Promise<MessageEmbed>
    {
        let leaderboardEmbed: MessageEmbed = new MessageEmbed().setColor("00ff00");
        let rank = 0;

        for(const user of topUserList)
        {
            let discordUser = await bot.users.fetch(user.discordID);
            let firstField = discordUser ? discordUser.tag : `<@${user.discordID}>`;
            rank++

            if(isHeadpatLeaderboard)
            {
                leaderboardEmbed.addField(`${rank == 1 ? "🥇" : rank == 2 ? "🥈" : rank == 3 ? "🥉" : `#${rank}`}  ${firstField}`, `Headpats: ${user.headPats}${rank == topUserList.length ? " " : "\n឵"}`)
            }
            else
            {
                leaderboardEmbed.addField(`${rank == 1 ? "🥇" : rank == 2 ? "🥈" : rank == 3 ? "🥉" : `#${rank}`}  ${firstField}`, `Level: ${user.getLevel()} \nXP: ${user.xp}${rank == topUserList.length ? " " : "\n឵"}`)
            }
        }

        return leaderboardEmbed;
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

