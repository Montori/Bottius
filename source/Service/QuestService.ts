import { GuildMember, Guild } from 'discord.js';
import { Quest } from '../Entities/Persistent/Quest';
import { User } from '../Entities/Persistent/User';
import { UserService } from './UserService';
import { Partition } from '../Entities/Persistent/Partition';
import { PartitionService } from './PartitionService';

export class QuestService {
    private static instance: QuestService;

    private userService: UserService = UserService.getInstance();

    private partitionService: PartitionService = PartitionService.getInstance();

    public static getInstance(): QuestService {
      if (!QuestService.instance) {
        this.instance = new QuestService();
      }

      return this.instance;
    }

    public async getQuest(questID: number, guild: Guild) {
      const partition: Partition = await this.partitionService.getPartition(guild);
      return await Quest.findOne({ relations: ['assignor', 'assignees'], where: { id: questID, partition } });
    }

    public async getAllQuest(guild: Guild) {
      const partition: Partition = await this.partitionService.getPartition(guild);
      return await Quest.find({ relations: ['assignor', 'assignees'], where: { partition } });
    }

    public async addQuest(discordAssignor: GuildMember, discordAssignees: Array<GuildMember>, description: string): Promise<Quest> {
      const partition: Partition = await this.partitionService.getPartition(discordAssignor.guild);
      const assignor: User = await this.userService.getUser(discordAssignor, discordAssignor.guild);
      const assignees: Array<User> = new Array();

      for (const member of discordAssignees) {
        assignees.push(await this.userService.getUser(member, member.guild));
      }

      const newQuest: Quest = new Quest(assignor, assignees, description, partition);

      (await newQuest.save()).reload();

      return newQuest;
    }
}
