import {Client, Message, MessageEmbed} from 'discord.js';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';
import { CooldownService } from '../Service/CooldownService';
import { UserService } from '../Service/UserService';
import { User } from '../Entities/Persistent/User';
import { PermissionLevel } from '../Entities/Transient/PermissionLevel';

export abstract class AbstractCommand 
{
    public cooldownService: CooldownService = CooldownService.getInstance();
    public userService: UserService = UserService.getInstance();

    public async run(bot: Client, message: Message, messageArray: Array<string>)
    {
        let user: User = await this.userService.getUser(message.member, message.guild);
        if(user.permissionLevel < this.commandOptions.reqPermission) return this.sendPermissionDenied(message);
        if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName) && user.permissionLevel < PermissionLevel.admin)
        {
            this.sendCooldownEmbed(message);
        }
        else
        {
            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName, this.commandOptions.cooldown);
            this.runInternal(bot, message, messageArray);
        }
    }

    public abstract async runInternal(bot: Client, message: Message, messageArray: Array<string>);

    public sendHelp(message: Message)
    {
        let helpEmbed: MessageEmbed = new MessageEmbed()
            .setColor("#ff8000")
            .setAuthor(`Usage of Command: ${this.commandOptions.commandName}`)
            .setDescription(this.commandOptions.description)
            .addField("Permission level", `${PermissionLevel[this.commandOptions.reqPermission]}`, true)
            .addField("Cooldown", `${this.commandOptions.cooldown}s`, true)
            .addField("Usage", this.commandOptions.usage);

            message.channel.send(helpEmbed);
    }

    public sendPermissionDenied(message: Message, reqPermission?: PermissionLevel)
    {
        message.channel.send(new MessageEmbed().setAuthor("Permission Denied").setDescription(`You lack the permissions to use this part of the \`${this.commandOptions.commandName}\` command.\nYou need to be \`${reqPermission ? PermissionLevel[reqPermission] : PermissionLevel[this.commandOptions.reqPermission]}\` or higher`).setColor("ff0000"));
    }

    public sendCooldownEmbed(message: Message)
    {
        let cooldownEmbed: MessageEmbed = new MessageEmbed()
            .setColor("#ff0000")
            .setAuthor(`${this.commandOptions.commandName} Cooldown`)
            .setDescription(`You can only use this command once every ${this.commandOptions.cooldown} seconds`);
        
        message.channel.send(cooldownEmbed);
    }

    public getFailedEmbed(title?: string): MessageEmbed
    {
        return new MessageEmbed().setColor("ff0000").setAuthor(title ? title : "Action failed").setTimestamp(new Date());
    }

    public getSuccessEmbed(title?: string): MessageEmbed
    {
        return new MessageEmbed().setColor("00ff00").setAuthor(title ? title : "Action successful").setTimestamp(new Date());
    }

    public abstract commandOptions: AbstractCommandOptions;
}
