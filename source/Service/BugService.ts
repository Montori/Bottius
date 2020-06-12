import { Bug } from "../Material/Bug";
import { GuildMember, Guild } from "discord.js";
import { User } from "../Material/User";
import { UserService } from "./UserService";
import { Partition } from "../Material/Partition";
import { PartitionService } from "./PartitionService";

export class bugService
{
    private static instance: bugService;
    private userService: UserService = UserService.getInstance();
    private partitionService: PartitionService = PartitionService.getInstance();
    
    public static getInstance(): bugService
    {
        if(!bugService.instance)
        {
            this.instance = new bugService();
        }

        return this.instance;
    }

    public async getBug(bugID: number)
    {
        return await Bug.findOne({relations: ["assignor"], where: {id: bugID}});
    }

    public async getAllBugs(guild: Guild)
    {
        return await Bug.find({relations: ["assignor"]});
    }

    public async addBug(discordAssignor: GuildMember, description: string): Promise<Bug>
    {
        let assignor: User = await this.userService.getUser(discordAssignor, discordAssignor.guild);

        let newBug: Bug = new Bug(assignor, description);

        (await newBug.save()).reload();

        return newBug;
    }
}