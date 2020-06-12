import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, MessageEmbed } from "discord.js";
import { PermissionLevel } from "../Material/PermissionLevel";

export class ActivityCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new ActivityCommandOptions();

    public runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let embed: MessageEmbed = new MessageEmbed().setColor("00ff00").setAuthor("Activity changed").setDescription(`${messageArray.join(" ")}`).setTimestamp(new Date());
        let setActivity = messageArray.slice(1).join(" ");
        
        if(messageArray[0] == "streaming")
        {
            if(messageArray.join(" ").length > 100) return message.channel.send(new MessageEmbed().setAuthor("Too many characters").setColor("ff0000"));
            message.channel.send(embed)
            bot.user.setActivity(setActivity, { type: "STREAMING", url: "https://www.twitch.tv/example-url" });
        }
        else if(messageArray[0] == "playing")
        {
            if(messageArray.join(" ").length > 100) return message.channel.send(new MessageEmbed().setAuthor("Too many characters").setColor("ff0000"));
            message.channel.send(embed)
            bot.user.setActivity(setActivity, { type: "PLAYING" });
        }
        else if(messageArray[0] == "watching")
        {
            if(messageArray.join(" ").length > 100) return message.channel.send(new MessageEmbed().setAuthor("Too many characters").setColor("ff0000"));
            message.channel.send(embed);
            bot.user.setActivity(setActivity, { type: "WATCHING" });
        }
        else if(messageArray[0] == "listening")
        {
            if(messageArray.join(" ").length > 100) return message.channel.send(new MessageEmbed().setAuthor("Too many characters").setColor("ff0000"));
            message.channel.send(embed);
            bot.user.setActivity(setActivity, { type: "LISTENING" });
        }
        else
        {
            if(!messageArray[0]) return super.sendHelp(message);
            if(messageArray.join(" ").length > 100) return message.channel.send(new MessageEmbed().setAuthor("Too many characters").setColor("ff0000"));
            bot.user.setActivity(messageArray.join(" "));
            message.channel.send(super.getSuccessEmbed("Activity changed").setDescription(`${messageArray.join(" ")}`).setColor("00ff00"));
        }
    }

}

class ActivityCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "setActivity";
        this.description = "sets the activity of the bot";
        this.usage = `${AbstractCommandOptions.prefix}setActivity {text}`;
        this.reqPermission = PermissionLevel.master;
    }
}
