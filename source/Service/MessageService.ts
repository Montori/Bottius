import { Client, Message, Role, MessageEmbed } from "discord.js";
import { CommandService } from "./CommandService";
import randomInt from "random-int";
import botConfig from "../botconfig.json";
import { UserService } from "./UserService";
import { User } from "../Material/User";
import { CooldownService } from "./CooldownService";
import { PerkService } from "./PerkService";
import { Perk } from "../Material/Perk";

export class MessageService
{
    private static instance: MessageService;
    private commandService: CommandService;
    private userService: UserService;
    private cooldownService: CooldownService;
    private perkService: PerkService;
    private bot: Client;
    private prefix: string = botConfig.prefix;
    private readonly uwuRegex = "^(?<a>(?![wWMmNn])[A-z])[wWMmNn]\\k<a>$";

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
        this.perkService = PerkService.getInstance();
    }

    public async handleMessage(message: Message)
    {
        if(message.channel.type == "dm" || message.webhookID) return;
        if(message.author.bot) return;

        this.reactToUWU(message);
        
        let user: User = await this.userService.getUser(message.member);

        user.totalMessages ++;
        
        if(message.content.substring(0, this.prefix.length) != this.prefix)
        {
            this.gainExperience(user, message);
        }
        else
        {
            let messageArgs: Array<string> = message.content.split(" ");
            messageArgs = messageArgs.filter(message => /\S/.test(message));
            let command: string = messageArgs[0].slice(this.prefix.length);
            let commandArgs: Array<string> = messageArgs.slice(1);
            
            this.commandService.runCommand(command, this.bot, message, commandArgs);
        }

        await user.save();
    }

    private async gainExperience(user: User, message: Message)
    {
        if(!this.cooldownService.isCooldown(message.member, "XP"))
        {
                user.xp += 10;

                let perks: Array<Perk> = await this.perkService.getAllPerks();

                perks = perks.filter(perk => perk.reqLevel <= user.getLevel())

                for(const perk of perks)
                {
                    let role: Role = await message.guild.roles.fetch(perk.role);
                    if(!role) continue;
                    if(message.member.roles.cache.has(role.id)) continue;
                    message.member.roles.add(role);
                    message.channel.send(new MessageEmbed().setAuthor(`${message.member.user.tag} leveled up!`).setDescription(`${message.member} reached level ${perk.reqLevel} and obtained the role ${role}`).setColor(role.color));
                }

                this.cooldownService.addCooldown(message.member, "XP", 60);
        }
    }

    private reactToUWU(message: Message)
    {
        if(!this.cooldownService.isCooldown(message.member, "uwu"))
        {
            let owoArray: Array<string> = ["owo", "uwu", "pwp", "qwq", "OwO", "UwU", "QwQ", "PwP", "TwT"];
    
            if(new RegExp(this.uwuRegex).test(message.content))
            {
                message.channel.send(owoArray[randomInt(0, owoArray.length-1)]);
                this.cooldownService.addCooldown(message.member, "uwu", 10);
            } 
            
        }
    }
}