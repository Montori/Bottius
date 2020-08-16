import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed } from "discord.js";
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { LyricService } from "../service/LyricService";
import { Lyrics } from "../entities/persistent/Lyrics";
import { PermissionLevel } from "../entities/transient/PermissionLevel";

export class LyricCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new LyricCommandOptions();
    private lyricService: LyricService = LyricService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        if(messageArray[0] == "add")
        {
            if((await this.userService.getUser(message.member, message.guild)).permissionLevel < PermissionLevel.master) return super.sendPermissionDenied(message, PermissionLevel.master);
            if(!messageArray[1] || !messageArray[2]) return super.sendHelp(message);
            let artist = messageArray[1];
            messageArray = messageArray.slice(2);
            let songtext = messageArray.join(" ");
            
            let lyrics: Lyrics = await this.lyricService.addLyrics(artist, songtext, message.guild);

            message.channel.send(super.getSuccessEmbed().setDescription(`Your lyrics from ${lyrics.artist} have been added.`).setFooter(`ID: ${lyrics.id}`));
        }
        else if(messageArray[0] == "remove")
        {
            if((await this.userService.getUser(message.member, message.guild)).permissionLevel < PermissionLevel.master) return super.sendPermissionDenied(message, PermissionLevel.master);
            if(isNaN(Number(messageArray[1]))) return message.channel.send(super.getFailedEmbed().setDescription("Please specify a valid id"));
            let removedLyrics: Lyrics = await this.lyricService.removeLyrics(Number(messageArray[1]));
            if(!removedLyrics) return message.channel.send(super.getFailedEmbed().setDescription(`We couldn't find lyrics with the ID ${messageArray[1]}`));
            message.channel.send(super.getSuccessEmbed().setDescription("Lyrics have been deleted"));
        }
        else if(!messageArray[0])
        {
            let lyric: Lyrics = await this.lyricService.getRandomLyrics();
            if(!lyric) return message.channel.send(super.getFailedEmbed().setDescription(`There are no lyrics for this server yet.\nYou can add lyrics with \`${AbstractCommandOptions.prefix}lyrics add\``)) 
            let lyricEmbed: MessageEmbed = new MessageEmbed()
                .setDescription(`${lyric.songtext}`)
                .setFooter(`by ${lyric.artist} (${lyric.id})`);

            message.channel.send(lyricEmbed);
        }
    }
}

class LyricCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "lyrics";
        this.description = "sends lyrics that have been added to the database."
        this.usage = `${AbstractCommandOptions.prefix}lyrics\n${AbstractCommandOptions.prefix}lyrics add {artist} {lyrics}\n${AbstractCommandOptions.prefix}lyrics remove {id}`
    }
}