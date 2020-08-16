import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { Client, Message, GuildMember } from "discord.js";
import { PermissionLevel } from "../entities/transient/PermissionLevel";
import { User } from "../entities/persistent/User";

export class PermissionCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new PermissionCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        if(messageArray[0] != "change") return super.sendHelp(message);
        let recMember: GuildMember = message.mentions.members.first();
        if(!recMember) return message.channel.send(super.getFailedEmbed().setDescription("Please specify a user to apply the permission to"));
        let permissionLevel: PermissionLevel = PermissionLevel[messageArray[2].toLowerCase()];
        if(isNaN(permissionLevel)) return message.channel.send(super.getFailedEmbed().setDescription("Please specify a valid permission:\n\nmember\ntrusted\nmoderator\nadmin\nowner"));
        if(permissionLevel == PermissionLevel["master"]) return message.channel.send(super.getFailedEmbed("Insufficient Permissions").setDescription(`You are on this council ${message.member} but we do not grant ${recMember} the rank of a master`));

        let executingUser: User = await this.userService.getUser(message.member, message.guild);
        let receivingUser: User = await this.userService.getUser(recMember, message.guild);

        if(permissionLevel >= executingUser.permissionLevel) return message.channel.send(super.getFailedEmbed("Insufficient Permissions").setDescription(`You need to be at least ${PermissionLevel[permissionLevel+1]} to assign ${PermissionLevel[permissionLevel]}`));
        if(receivingUser.permissionLevel == PermissionLevel.master) return message.channel.send(super.getFailedEmbed("Insufficient Permissions").setDescription("You cannot change the permissions of the highest beings."));
        let reqLevel: number = receivingUser.permissionLevel;
        reqLevel++;
        if(receivingUser.permissionLevel >= executingUser.permissionLevel) return message.channel.send(super.getFailedEmbed("Insufficient Permissions").setDescription(`You need to be at least ${PermissionLevel[reqLevel]} to change the permissions of ${recMember}`));
        if(receivingUser.permissionLevel == permissionLevel) return message.channel.send(super.getFailedEmbed().setDescription(`${recMember} is already ${PermissionLevel[permissionLevel]}`));
        receivingUser.permissionLevel = permissionLevel;
        receivingUser.save();
        message.channel.send(super.getSuccessEmbed().setDescription(`${recMember} is now \`${PermissionLevel[receivingUser.permissionLevel]}\``))
    }
    
}

class PermissionCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "permission";
        this.description = "changes the permission level of a user";
        this.usage = `${AbstractCommandOptions.prefix}permission change {@user} {permissionLevel}\n\n**Permissions:**\nmember\ntrusted\nmoderator\nadmin\nowner\nmaster`;
        this.reqPermission = PermissionLevel.admin;
    }
}
