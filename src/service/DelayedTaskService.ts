import { DelayedTask } from "../entities/persistent/DelayedTask";
import { LessThanOrEqual } from "typeorm";
import { DelayedTaskType } from "../entities/transient/DelayedTaskType";
import { UserService } from "./UserService";
import { PartitionService } from "./PartitionService";
import { Partition } from "../entities/persistent/Partition";
import { User } from "../entities/persistent/User";
import { Client, Guild, GuildMember, TextChannel, Role, MessageEmbed } from "discord.js";

export class DelayedTaskService
{
    private static instance: DelayedTaskService;

    private userService: UserService = UserService.getInstance();
    private partitionService: PartitionService = PartitionService.getInstance();
    private bot: Client;

    public static init(bot: Client)
    {
        if(!DelayedTaskService.instance)
        {
            this.instance = new DelayedTaskService(bot);
        }
    }

    public static getInstance(): DelayedTaskService
    {
        return this.instance;
    }

    private constructor(bot: Client)
    {
        this.bot = bot;
    }

    public async handleDueDelayedTasks()
    {
        let now: string = new Date().toISOString().replace("T", " ").replace("Z","");
        let dueTasks: Array<DelayedTask> = await DelayedTask.find({where: {dueDate: LessThanOrEqual(now)}});

        if(dueTasks && dueTasks.length > 0) console.log(`INFO: ${dueTasks.length} delayed tasks will be processed`);

        dueTasks.forEach(task => 
        {
        });
    }
}