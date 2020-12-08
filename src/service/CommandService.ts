import {PingCommand} from "../commands/PingCommand";
import {AbstractCommand} from "../commands/AbstractCommand";
import {Client, Message, MessageEmbed} from "discord.js";
import { HeadpatCommand } from "../commands/HeadpatCommand";
import { QuestCommand } from "../commands/QuestCommand";
import { StatsCommand } from "../commands/StatsCommand";
import { PerkCommand } from "../commands/PerkCommand";
import { LeaderboardCommand } from "../commands/LeaderboardCommand";
import { ActivityCommand } from "../commands/ActivityCommand";
import { HelpCommand } from "../commands/HelpCommand";
import { PermissionCommand } from "../commands/PermissionCommand";
import { SuggestCommand } from "../commands/SuggestCommand";
import { LyricCommand } from "../commands/LyricCommand";
import { HugCommand } from "../commands/HugCommand";
import { SlapCommand } from "../commands/SlapCommand";
import { BugCommand } from "../commands/BugCommand";
import { BirthdayCommand } from "../commands/BirthdayCommand";
import { SpinnerCommand } from "../commands/SpinnerCommand";
import { UwUifyCommand } from "../commands/UwUifyCommand";
import { PartitionService } from "./PartitionService";
import { SignCommand } from "../commands/SignCommand";
import { LickCommand } from "../commands/LickCommand";
import { InfoCommand } from "../commands/InfoCommand";
import { AvatarCommand } from "../commands/AvatarCommand";
import { TumbleweedCommand } from "../commands/TumbleweedCommand";
import { LeavemessageCommand } from "../commands/LeaveMessageCommand";
import { PrefixCommand } from "../commands/PrefixCommand";
import { EnableCommand } from "../commands/EnableCommand";
import { DisableCommand } from "../commands/DisableCommand";
import { XPIgnoreCommand } from "../commands/XPIgnoreCommand";
import { AutoRoleCommand } from "../commands/AutoRoleCommand";
import { KissCommand } from "../commands/KissCommand";

export class CommandService
{
    private static instance: CommandService;
    private partitionService: PartitionService;
    private commandMap: Map<string, AbstractCommand> = new Map();

    public static getInstance() : CommandService
    {
        if(!CommandService.instance)
        {
            this.instance = new CommandService();
        }

        return this.instance;
    }

    public disabledCommandError(message: Message, command: string) { // returns error for disabled commands
        message.channel.send(new MessageEmbed().setColor("ff0000").setAuthor("Command disabled").setDescription(`${command} command has been disabled!`));
    }

    private constructor()
    {
        this.partitionService = PartitionService.getInstance();

        this.commandMap.set("ping", new PingCommand());
        this.commandMap.set("headpat", new HeadpatCommand());
        this.commandMap.set("quest", new QuestCommand());
        this.commandMap.set("stats", new StatsCommand());
        this.commandMap.set("perk", new PerkCommand());
        this.commandMap.set("leaderboard", new LeaderboardCommand());
        this.commandMap.set("activity", new ActivityCommand());
        this.commandMap.set("help", new HelpCommand());
        this.commandMap.set("permission", new PermissionCommand());
        this.commandMap.set("suggest", new SuggestCommand());
        this.commandMap.set("lyrics", new LyricCommand());
        this.commandMap.set("hug", new HugCommand());
        this.commandMap.set("slap", new SlapCommand());
        this.commandMap.set("bug", new BugCommand());
        this.commandMap.set("birthday", new BirthdayCommand());
        this.commandMap.set("spin", new SpinnerCommand());
        this.commandMap.set("uwuify", new UwUifyCommand());
        this.commandMap.set("sign", new SignCommand());
        this.commandMap.set("lick", new LickCommand());
        this.commandMap.set("info", new InfoCommand());
        this.commandMap.set("avatar", new AvatarCommand());
        this.commandMap.set("tumbleweed", new TumbleweedCommand());
        this.commandMap.set("leavemessage", new LeavemessageCommand());
        this.commandMap.set("xpignore", new XPIgnoreCommand());
        this.commandMap.set("prefix", new PrefixCommand());
        this.commandMap.set("enable", new EnableCommand());
        this.commandMap.set("disable", new DisableCommand());
        this.commandMap.set("autorole", new AutoRoleCommand());
		this.commandMap.set("kiss", new KissCommand());
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
