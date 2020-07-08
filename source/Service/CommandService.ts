import {PingCommand} from "../Commands/PingCommand";
import {AbstractCommand} from "../Commands/AbstractCommand";
import {Client, Message, MessageEmbed} from "discord.js";
import { HeadpatCommand } from "../Commands/HeadpatCommand";
import { QuestCommand } from "../Commands/QuestCommand";
import { StatsCommand } from "../Commands/StatsCommand";
import { PerkCommand } from "../Commands/PerkCommand";
import { LeaderboardCommand } from "../Commands/LeaderboardCommand";
import { ActivityCommand } from "../Commands/ActivityCommand";
import { HelpCommand } from "../Commands/HelpCommand";
import { PermissionCommand } from "../Commands/PermissionCommand";
import { SuggestCommand } from "../Commands/SuggestCommand";
import { LyricCommand } from "../Commands/LyricCommand";
import { HugCommand } from "../Commands/HugCommand";
import { SlapCommand } from "../Commands/SlapCommand";
import { BugCommand } from "../Commands/BugCommand";
import { ServerCommand } from "../Commands/ServerCommand";
import { BirthdayCommand } from "../Commands/BirthdayCommand";
import { SpinnerCommand } from "../Commands/SpinnerCommand";
import { UwUifyCommand } from "../Commands/UwUifyCommand";
import { MessageService } from "./MessageService";
import { PartitionService } from "./PartitionService";
import { SignCommand } from "../Commands/SignCommand";

export class CommandService
{
    private static instance: CommandService;
    private partitionService: PartitionService;
    private bot: Client;
    private commandMap: Map<string, AbstractCommand> = new Map();

    public static getInstance() : CommandService
    {
        return this.instance;
    }

    public static init(bot: Client)
    {
        if(!CommandService.instance)
        {
            this.instance = new CommandService(bot);
        }
    }

    public disabledCommandError(message: Message, command: string) { // returns error for disabled commands
        message.channel.send(new MessageEmbed().setColor("ff0000").setAuthor("Command disabled").setDescription(`${command} has been disabled!`));
    }

    private constructor(bot: Client)
    {
        this.bot = bot;
        this.partitionService = PartitionService.getInstance();

        this.commandMap.set("ping", new PingCommand());
        this.commandMap.set("headpat", new HeadpatCommand());
        this.commandMap.set("quest", new QuestCommand());
        this.commandMap.set("stats", new StatsCommand());
        this.commandMap.set("perk", new PerkCommand());
        this.commandMap.set("leaderboard", new LeaderboardCommand());
        this.commandMap.set("setactivity", new ActivityCommand());
        this.commandMap.set("help", new HelpCommand());
        this.commandMap.set("permission", new PermissionCommand());
        this.commandMap.set("suggest", new SuggestCommand());
        this.commandMap.set("lyrics", new LyricCommand());
        this.commandMap.set("hug", new HugCommand());
        this.commandMap.set("slap", new SlapCommand());
        this.commandMap.set("bug", new BugCommand());
        this.commandMap.set("server", new ServerCommand());
        this.commandMap.set("birthday", new BirthdayCommand());
        this.commandMap.set("spin", new SpinnerCommand());
        this.commandMap.set("uwuify", new UwUifyCommand());
        this.commandMap.set("sign", new SignCommand());
    }

    runCommand(name: string, bot: Client, message: Message, args: Array<string>)
    {
        name = name.toLowerCase();

        // Get the message service in order to get the partition service in order to get the partition of the server
        // the command was issued on, then check if command is disabled ? error : exec command
        this.partitionService.getPartition(message.guild)
            .then(partition => { 
                if (partition.getDisabledCommandsList().indexOf(name) != -1) this.disabledCommandError(message, name);
                else if(this.commandMap.get(name)) this.commandMap.get(name).run(bot, message, args);
            });
    }

    public getCommandMap(): Map<string, AbstractCommand>
    {
        return this.commandMap;
    }
}