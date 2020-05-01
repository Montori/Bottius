import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, GuildMember, MessageEmbed } from "discord.js";
import { User } from "../Material/User";
export class LeaderboardCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new LeaderboardCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let topUsers: Array<User> = await User.find({order : {xp: "DESC"}, take: 10});

        let leaderboardEmbed: MessageEmbed = new MessageEmbed()
                                                    .setAuthor(`Leaderboard of ${message.guild.name}`)
                                                    .setColor("00ff00")
                                                    .setDescription("Here are the most honorable members of this server")
                                                    .setTimestamp(new Date());

        topUsers.forEach(user => leaderboardEmbed.addField(`${bot.users.resolve(user.discordID).tag}`, `Level: ${user.getLevel()} \nXP: ${user.xp}`));

        message.channel.send(leaderboardEmbed);
    }
}

class LeaderboardCommandOptions extends AbstractCommandOptions
{
    public commandName: string;
    public description: string;
    public usage: string;
    
    constructor()
    {
        super();
        this.commandName = "leaderboard";
        this.description = "shows the leaderboard of this server";
        this.usage=`${AbstractCommandOptions.prefix}leaderboard`
    }
}
