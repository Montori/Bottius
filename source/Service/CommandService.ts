import {PingCommand} from "../Commands/PingCommand";
import {AbstractCommand} from "../Commands/AbstractCommand";
import {Client, Message} from "discord.js";
import { HeadpatCommand } from "../Commands/HeadpatCommand";
import { QuestCommand } from "../Commands/QuestCommand";

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
    }

    runCommand(name: string, bot: Client, message: Message, args: Array<string>)
    {
        name = name.toLowerCase();

        if(this.commandMap.get(name))
        {
            this.commandMap.get(name).run(bot, message, args);
        }
    }
}