import { Client, Message, Role, MessageEmbed } from "discord.js";
import { CommandService } from "./CommandService";
import randomInt from "random-int";
import botConfig from "../botconfig.json";
import { UserService } from "./UserService";
import { User } from "../Material/User";
import { CooldownService } from "./CooldownService";
import { PerkService } from "./PerkService";
import { Perk } from "../Material/Perk";
import { PartitionService } from "./PartitionService";
import { Partition } from "../Material/Partition";
import { isRegExp } from "util";

export class MessageService
{
    private static instance: MessageService;
    private commandService: CommandService;
    private userService: UserService;
    private cooldownService: CooldownService;
    private perkService: PerkService;
    private partitionService: PartitionService;
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
        this.partitionService = PartitionService.getInstance();
    }

    public async handleMessage(message: Message)
    {
        if(message.channel.type == "dm" || message.webhookID) return;
        if(message.author.bot) return;

        this.reactToUWU(message);
        
        let user: User = await this.userService.getUser(message.member, message.guild);

        user.totalMessages ++;

        let customPrefix: string = (await (await this.partitionService).getPartition(message.guild)).customPrefix; // get custom prefix from db
        let prefixInvalid: boolean = customPrefix == null; // check if prefix exists | true = invalid

        if(message.content.substring(0, prefixInvalid ? this.prefix.length : customPrefix.length) != (prefixInvalid ? this.prefix : customPrefix)) // use custom prefix or set prefix checks
        {
            this.gainExperience(user, message);
            this.gainVCExperience(user, message);
        }
        else
        {
            let messageArgs: Array<string> = message.content.split(" ");
            messageArgs = messageArgs.filter(message => /\S/.test(message));
            let command: string = messageArgs[0].slice(prefixInvalid ? this.prefix.length : customPrefix.length); // use custom prefix or set prefix check
            let commandArgs: Array<string> = messageArgs.slice(1);
            
            this.commandService.runCommand(command, this.bot, message, commandArgs);
        }

        await user.save();
    }

    private async gainExperience(user: User, message: Message)
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);

        if(!this.cooldownService.isCooldown(message.member, "XP") && !partition.getXPIgnoreList().some(channel => channel == message.channel.id))
        {
                user.xp += 10;

                let perks: Array<Perk> = await this.perkService.getAllPerks(message.guild);

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

    private async gainVCExperience(user: User, message: Message)
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);

        if(!this.cooldownService.isCooldown(message.member, "VCXP") && partition.getNoMicList().some(channel => channel == message.channel.id))
        {
                user.vcxp += 10;

                this.cooldownService.addCooldown(message.member, "VCXP", 60);
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