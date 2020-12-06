import { User } from '../entities/persistent/User';
import { GuildMember, Guild } from 'discord.js';
import { PartitionService } from './PartitionService';
import { Partition } from '../entities/persistent/Partition';
import botConfig from "../botconfig.json";
import { PermissionLevel } from '../entities/transient/PermissionLevel';
import { Between } from 'typeorm';

export class UserService
{
   private static instance: UserService;
   private partitionService: PartitionService = PartitionService.getInstance();
   private readonly birthdateRegex = "/\d{2}\:\d{2}\:\d{2}\.\d{3}/gm"

    public static getInstance(): UserService
    {
        if(!UserService.instance)
        {
            this.instance = new UserService();
        }

        return this.instance;
    }

    public async getUser(guildMember : GuildMember, guild: Guild): Promise<User>
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        let foundUser: User = await User.findOne({where: {discordID: guildMember.id, partition: partition}});

        if(!foundUser) foundUser = new User(guildMember.id, partition);

        await this.givePermission(foundUser, guildMember);
        await (await foundUser.save()).reload();

        return foundUser;
    }

    public async getUserForBirthdate(birthdate: Date, partition: Partition): Promise<Array<User>>
    {
        let birthdateString: string = birthdate.toISOString().replace("T", " ").replace("Z","");
        let birthdayMax = birthdateString.replace(this.birthdateRegex, "24:00:00.000");
        let birthdayMin = birthdateString.replace(this.birthdateRegex, "00:00:00.000");

        let birthdayUsers: Array<User> = await User.find({where: {birthdate: Between(birthdayMin, birthdayMax),partition: partition}});

        return birthdayUsers;
    }

    public async getLeaderbaord(guild: Guild): Promise<Array<User>>
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        return await User.find({where: {partition: partition}, order : {xp: "DESC"}, take: 10});
    }

    private async givePermission(user: User, member: GuildMember)
    {
        if(botConfig.masters.some(master => user.discordID == master)) user.permissionLevel = PermissionLevel.master;
        else if(member.guild.ownerID == user.discordID) user.permissionLevel = PermissionLevel.owner;
    }
}