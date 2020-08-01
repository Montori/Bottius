import { DelayedTask } from "../Entities/Persistent/DelayedTask";
import { LessThanOrEqual } from "typeorm";
import { DelayedTaskType } from "../Entities/Transient/DelayedTaskType";
import { UserService } from "./UserService";
import { PartitionService } from "./PartitionService";
import { Partition } from "../Entities/Persistent/Partition";
import { User } from "../Entities/Persistent/User";
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
            if(task.type == DelayedTaskType.birthday)
            {
                this.handleBirthdayTask();

                let nextDueDate = new Date();
                nextDueDate.setUTCHours(0,0,0,0);
                
                new DelayedTask(nextDueDate, DelayedTaskType.birthday).save();
                task.remove();
            }
        })
    }

    private async handleBirthdayTask() 
    {
        let birthdayPartitions: Array<Partition> = await this.partitionService.getPartitionsWithBirthday();

        for(const partition of birthdayPartitions)
        {
            let birthdate = new Date(2000, new Date().getMonth(), new Date().getDate(), 0,0,0,0);
            let birthdayUsers: Array<User> = await this.userService.getUserForBirthdate(birthdate, partition);

            birthdate.setDate(birthdate.getDate() -1);
            let pastBirthdayUsers: Array<User> = await this.userService.getUserForBirthdate(birthdate, partition);

            let guild: Guild = this.bot.guilds.resolve(partition.guildID);
            
            birthdayUsers.forEach(user => 
            {
                let member: GuildMember = guild.members.resolve(user.discordID);
                let birthdayRole: Role;
                let birthdayChannel: TextChannel;

                if(partition.birthdayRole) birthdayRole = guild.roles.resolve(partition.birthdayRole);
                if(partition.birthdayChannel) birthdayChannel = guild.channels.resolve(partition.birthdayChannel) as TextChannel;

                if(birthdayRole) member.roles.add(birthdayRole);
                if(birthdayChannel)
                {
                    let birthdayEmbed: MessageEmbed = new MessageEmbed()
                            .setAuthor(`Today is the birthday of ${member.user.tag}`)
                            .setDescription(`Happy birthday 🎉\nAs a reward you get 1000XP`)
                            .setColor("ffc0cb");
                    
                    birthdayChannel.send(birthdayEmbed);
                }
                user.xp += 1000;
                user.save();
            });

            pastBirthdayUsers.forEach(user =>
            {
                let member: GuildMember = guild.members.resolve(user.discordID);
                let birthdayRole: Role = guild.roles.resolve(partition.birthdayRole);

                if(birthdayRole) member.roles.remove(birthdayRole);
            });
        }
    }
}