import { Bug } from "../entities/persistent/Bug";
import { GuildMember, Guild } from "discord.js";
import { User } from "../entities/persistent/User";
import { UserService } from "./UserService";

export class BugService
{
    private static instance: BugService;
    private userService: UserService = UserService.getInstance();
    
    public static getInstance(): BugService
    {
        if(!BugService.instance)
        {
            this.instance = new BugService();
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