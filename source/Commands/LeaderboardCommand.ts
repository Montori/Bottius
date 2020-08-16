import {
  Client, Message, GuildMember, MessageEmbed,
} from 'discord.js';
import { AbstractCommand } from './AbstractCommand';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';
import { User } from '../Entities/Persistent/User';
import { UserService } from '../Service/UserService';

export class LeaderboardCommand extends AbstractCommand {
    public commandOptions: AbstractCommandOptions = new LeaderboardCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) {
      const userService: UserService = UserService.getInstance();
      const topUsers: Array<User> = await userService.getLeaderbaord(message.guild);
      let rank = 0;

      const leaderboardEmbed: MessageEmbed = super.getSuccessEmbed(`Leaderboard of ${message.guild.name}`)
        .setDescription('Here are the most honorable members of this server');

      topUsers.forEach((user) => {
        const discordUser = bot.users.resolve(user.discordID);
        const firstField = discordUser ? discordUser.tag : `<@${user.discordID}>`;
        rank++;
        leaderboardEmbed.addField(`${rank == 1 ? '🥇' : rank == 2 ? '🥈' : rank == 3 ? '🥉' : `#${rank}`}  ${firstField}`, `Level: ${user.getLevel()} \nXP: ${user.xp}${rank == topUsers.length ? ' ' : '\n឵'}`);
      });

      message.channel.send(leaderboardEmbed);
    }
}

class LeaderboardCommandOptions extends AbstractCommandOptions {
  constructor() {
    super();
    this.commandName = 'leaderboard';
    this.description = 'shows the leaderboard of this server';
    this.usage = `${AbstractCommandOptions.prefix}leaderboard`;
  }
}
