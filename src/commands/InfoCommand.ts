import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed } from "discord.js";
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";

export class InfoCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new InfoCommandOptions();

    public runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let infoEmbed: MessageEmbed = new MessageEmbed()
                .setAuthor("Information on Bottius (that's me)")
                .setThumbnail(bot.user.displayAvatarURL())
                .setDescription("Hey! I'm Bottius, a bot like everybot else.\nMy master Montori initially created me for the Bricc Cult Discord Server and I am now used on servers around the cluster."
                +"\n\nIf you want to be up to date about me, you can check out my [GitHub page](https://github.com/Montori/Bottius).")
                .addField("All contributors", "Montori#4707 (Creator)\nArgos#4406 (Creative input)\nrene#6605 (Developer)\nREAL_FD3 (Developer)\nBark Ranger#0985 (Linux installers)")
                .setColor("#ff8c00");

    
        message.channel.send(infoEmbed);
    }
    
}

class InfoCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "info";
        this.description = "gives you a description of Bottius";
        this.usage = `${AbstractCommandOptions.prefix}info`;
    }
}