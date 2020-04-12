import { Client, Message } from "discord.js";
import { CommandService } from "./CommandService";
import randomInt from "random-int";
import botConfig from "../botconfig.json";
import { UserService } from "./UserService";
import { User } from "../Material/User";
import { CooldownService } from "./CooldownService";

export class MessageService
{
    private static instance: MessageService;
    private commandService: CommandService;
    private userService: UserService;
    private cooldownService: CooldownService;
    private bot: Client;
    private prefix: string = botConfig.prefix;
    private readonly uwuRegex = "^(?<a>[A-z])[wWMmNn]\\k<a>$";

    public static getInstance() : MessageService
    {
        return this.instance;
    }

    public static init(bot: Client)
    {
        if(!MessageService.instance)
        {
            this.instance = new MessageService(bot);
        }
    }

    private constructor(bot: Client)
    {
        this.bot = bot;
        this.commandService = CommandService.getInstance();
        this.userService = UserService.getInstance();
        this.cooldownService = CooldownService.getInstance();
    }

    public async handleMessage(message: Message)
    {
        if(message.channel.type == "dm" || message.webhookID) return;
        if(message.author.bot) return;

        this.reactToUWU(message);
        
        let user: User = await this.userService.getUser(message.member);

        user.totalMessages += 1;
        await user.save();

        if(message.content.substring(0, this.prefix.length) != this.prefix) return;
   
        let messageArgs: Array<string> = message.content.split(" ");
        messageArgs = messageArgs.filter(message => /\S/.test(message));
        let command: string = messageArgs[0].slice(this.prefix.length);
        let commandArgs: Array<string> = messageArgs.slice(1);

        this.commandService.runCommand(command, this.bot, message, commandArgs);
    }

    private reactToUWU(message: Message)
    {
        if(!this.cooldownService.isCooldown(message.member, "uwu"))
        {
            let owoArray: Array<string> = ["owo", "uwu", "pwp", "qwq", "OwO", "UwU", "QwQ", "PwP", "TwT"];
    
            if(new RegExp(this.uwuRegex).test(message.content)) message.channel.send(owoArray[randomInt(0, owoArray.length-1)]);
            this.cooldownService.addCooldown(message.member, "uwu", 10);
        }
    }
}