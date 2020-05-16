import { GuildMember } from "discord.js";

export class CooldownService 
{
    private static instance: CooldownService;

    private cooldownList: Set<String> = new Set<String>();

    public static getInstance() : CooldownService
    {
        if(!CooldownService.instance)
        {
            this.instance = new CooldownService();
        }

        return this.instance;
    }
    public addCooldown(member: GuildMember, command: String, seconds: number)
    {
        this.cooldownList.add(`${member.guild.id}:${member.id}#${command}`);

        setTimeout(() => this.cooldownList.delete(`${member.guild.id}:${member.id}#${command}`), seconds*1000);
    }

    public isCooldown(member: GuildMember, command: String) : boolean
    {
        return this.cooldownList.has(`${member.guild.id}:${member.id}#${command}`);
    }
}
