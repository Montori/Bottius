import { GuildMember, Guild } from 'discord.js';
import {
  Between, Equal, MoreThanOrEqual, LessThanOrEqual,
} from 'typeorm';
import { User } from '../Entities/Persistent/User';
import { PartitionService } from './PartitionService';
import { Partition } from '../Entities/Persistent/Partition';
import botConfig from '../botconfig.json';
import { PermissionLevel } from '../Entities/Transient/PermissionLevel';

export class UserService {
    private static instance: UserService;

    private partitionService: PartitionService = PartitionService.getInstance();

    private readonly birthdateRegex = '/\d{2}\:\d{2}\:\d{2}\.\d{3}/gm'

    public static getInstance(): UserService {
      if (!UserService.instance) {
        this.instance = new UserService();
      }

      return this.instance;
    }

    public async getUser(guildMember: GuildMember, guild: Guild): Promise<User> {
      const partition: Partition = await this.partitionService.getPartition(guild);
      let foundUser: User = await User.findOne({ where: { discordID: guildMember.id, partition } });

      if (!foundUser) foundUser = new User(guildMember.id, partition);

      await this.givePermission(foundUser, guildMember);
      await (await foundUser.save()).reload();

      return foundUser;
    }

    public async getUserForBirthdate(birthdate: Date, partition: Partition): Promise<Array<User>> {
      const birthdateString: string = birthdate.toISOString().replace('T', ' ').replace('Z', '');
      const birthdayMax = birthdateString.replace(this.birthdateRegex, '24:00:00.000');
      const birthdayMin = birthdateString.replace(this.birthdateRegex, '00:00:00.000');

      const birthdayUsers: Array<User> = await User.find({ where: { birthdate: Between(birthdayMin, birthdayMax), partition } });

      return birthdayUsers;
    }

    public async getLeaderbaord(guild: Guild): Promise<Array<User>> {
      const partition: Partition = await this.partitionService.getPartition(guild);
      return await User.find({ where: { partition }, order: { xp: 'DESC' }, take: 10 });
    }

    private async givePermission(user: User, member: GuildMember) {
      if (botConfig.masters.some((master) => user.discordID == master)) user.permissionLevel = PermissionLevel.master;
      else if (member.guild.owner.id == user.discordID) user.permissionLevel = PermissionLevel.owner;
    }
}
