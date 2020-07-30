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
import { BirthdayCommand } from "../Commands/BirthdayCommand";
import { SpinnerCommand } from "../Commands/SpinnerCommand";
import { UwUifyCommand } from "../Commands/UwUifyCommand";
import { PartitionService } from "./PartitionService";
import { SignCommand } from "../Commands/SignCommand";
import { LickCommand } from "../Commands/LickCommand";
import { InfoCommand } from "../Commands/InfoCommand";
import { AvatarCommand } from "../Commands/AvatarCommand";
import { TumbleweedCommand } from "../Commands/TumbleweedCommand";
import { LeavemessageCommand } from "../Commands/LeaveMessageCommand";
import { NomicCommand } from "../Commands/NomicCommand";
import { XPIgnoreCommand } from "../Commands/XpignoreCommand";
import { PrefixCommand } from "../Commands/PrefixCommand";
import { EnableCommand } from "../Commands/EnableCommand";
import { DisableCommand } from "../Commands/DisableCommand";

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
        this.commandMap.set("setactivity", new ActivityCommand());
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
        this.commandMap.set("nomic", new NomicCommand());
        this.commandMap.set("xpignore", new XPIgnoreCommand());
        this.commandMap.set("prefix", new PrefixCommand());
        this.commandMap.set("enable", new EnableCommand());
        this.commandMap.set("disable", new DisableCommand());
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
