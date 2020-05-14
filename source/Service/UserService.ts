import { User } from '../Material/User';
import { GuildMember, Guild } from 'discord.js';
import { PartitionService } from './PartitionService';
import { Partition } from '../Material/Partition';

export class UserService
{
   private static instance: UserService;
   private partitionService: PartitionService = PartitionService.getInstance();

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

        if(!foundUser)
        {
            foundUser = new User(guildMember.id, partition);
            (await foundUser.save()).reload();
        }

        return foundUser;
    }

    public async getLeaderbaord(guild: Guild)
    {
        let partition: Partition = await this.partitionService.getPartition(guild);
        return await User.find({where: {partition: partition}, order : {xp: "DESC"}, take: 10});
    }
}