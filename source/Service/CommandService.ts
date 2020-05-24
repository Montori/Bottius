import {PingCommand} from "../Commands/PingCommand";
import {AbstractCommand} from "../Commands/AbstractCommand";
import {Client, Message} from "discord.js";
import { HeadpatCommand } from "../Commands/HeadpatCommand";
import { QuestCommand } from "../Commands/QuestCommand";
import { StatsCommand } from "../Commands/StatsCommand";
import { PerkCommand } from "../Commands/PerkCommand";
import { LeaderboardCommand } from "../Commands/LeaderboardCommand";
import { ActivityCommand } from "../Commands/ActivityCommand";
import { HelpCommand } from "../Commands/HelpCommand";
import { PermissionCommand } from "../Commands/PermissionCommand";
import { SuggestCommand } from "../Commands/SuggestCommand";
import { HugCommand } from "../Commands/HugCommand";

export class CommandService
{
    private static instance: CommandService;
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

    private constructor(bot: Client)
    {
        this.bot = bot;
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
        this.commandMap.set("hug", new HugCommand());
    }

    runCommand(name: string, bot: Client, message: Message, args: Array<string>)
    {
        name = name.toLowerCase();

        if(this.commandMap.get(name))
        {
            this.commandMap.get(name).run(bot, message, args);
        }
    }

    public getCommandMap(): Map<string, AbstractCommand>
    {
        return this.commandMap;
    }
}