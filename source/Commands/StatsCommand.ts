import {
  Client, Message, MessageEmbed, GuildMember,
} from 'discord.js';
import { MoreThan, MoreThanOrEqual, Equal } from 'typeorm';
import { AbstractCommand } from './AbstractCommand';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';
import { UserService } from '../Service/UserService';
import { User } from '../Entities/Persistent/User';
import { PermissionLevel } from '../Entities/Transient/PermissionLevel';
import { PartitionService } from '../Service/PartitionService';
import { Partition } from '../Entities/Persistent/Partition';
import { Months, getDateSuffix } from '../Entities/Transient/DateFormatting';

export class StatsCommand extends AbstractCommand {
    public commandOptions: StatsCommandHelp = new StatsCommandHelp();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) {
      if (message.mentions.members.first()) {
        message.channel.send(await this.buildStatsEmbed(message.mentions.members.first()));
      } else {
        message.channel.send(await this.buildStatsEmbed(message.member));
      }
    }

    private async buildStatsEmbed(member: GuildMember): Promise<MessageEmbed> {
      const user: User = await this.userService.getUser(member, member.guild);
      const partition: Partition = await this.partitionService.getPartition(member.guild);

      const rank: number = (await User.count({ where: { xp: MoreThanOrEqual(user.xp), partition } }) - await User.count({ where: { xp: Equal(user.xp), id: MoreThan(user.id), partition } }));

      const embed: MessageEmbed = new MessageEmbed()
        .setAuthor(`Stats of ${member.user.tag} ${rank == 1 ? '🥇' : rank == 2 ? '🥈' : rank == 3 ? '🥉' : ''}`, member.user.displayAvatarURL())
        .addField('Level', `${user.getLevel()}`, true)
        .addField('XP', `${user.xp} / ${user.xp + user.getXPToNextLevel()}`, true)
        .addField('Leaderboard rank', `${rank}`)
        .addField('Headpats', `${user.headPats}`)
        .addField('Total messages', `${user.totalMessages}`)
        .setTimestamp(new Date())
        .setFooter(`Permissions: ${PermissionLevel[user.permissionLevel]}`)
        .setColor(member.roles.hoist == null ? '000000' : member.roles.hoist.color);

      if (user.birthdate) embed.addField('Birthdate', `${Months[user.birthdate.getMonth()]} ${user.birthdate.getDate()}${getDateSuffix(user.birthdate.getDate())}`);

      return embed;
    }
}

class StatsCommandHelp extends AbstractCommandOptions {
  constructor() {
    super();
    this.commandName = 'stats';
    this.description = 'shows the stats of a user';
    this.usage = `${AbstractCommandOptions.prefix}stats\n${AbstractCommandOptions.prefix}stats {@User}`;
  }
}
