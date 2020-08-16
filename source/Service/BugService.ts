import { GuildMember, Guild } from 'discord.js';
import { Bug } from '../Entities/Persistent/Bug';
import { User } from '../Entities/Persistent/User';
import { UserService } from './UserService';
import { PartitionService } from './PartitionService';

export class BugService {
    private static instance: BugService;

    private userService: UserService = UserService.getInstance();

    private partitionService: PartitionService = PartitionService.getInstance();

    public static getInstance(): BugService {
      if (!BugService.instance) {
        this.instance = new BugService();
      }

      return this.instance;
    }

    public async getBug(bugID: number) {
      return await Bug.findOne({ relations: ['assignor'], where: { id: bugID } });
    }

    public async getAllBugs(guild: Guild) {
      return await Bug.find({ relations: ['assignor'] });
    }

    public async addBug(discordAssignor: GuildMember, description: string): Promise<Bug> {
      const assignor: User = await this.userService.getUser(discordAssignor, discordAssignor.guild);

      const newBug: Bug = new Bug(assignor, description);

      (await newBug.save()).reload();

      return newBug;
    }
}
