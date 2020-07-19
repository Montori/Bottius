import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, GuildMember } from "discord.js";
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";

export class AvatarCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new AvatarCommandOptions();

    public runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let member: GuildMember = message.mentions.members.first();

        if(!member) return message.channel.send(super.getFailedEmbed().setDescription("Please specify a member"));
        message.channel.send(super.getSuccessEmbed(`Avatar of ${member.user.tag}`).setImage(member.user.displayAvatarURL()));
    }
}

class AvatarCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "avatar";
        this.description = "sends the avatar of the specified member";
        this.usage = `${AbstractCommandOptions.prefix}avatar @member`;
    }
}