import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, MessageEmbed } from "discord.js";
import { PermissionLevel } from "../Material/PermissionLevel";
import botConfig from '../botconfig.json';

export class ActivityCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new ActivityCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let embed: MessageEmbed = new MessageEmbed().setColor("00ff00").setAuthor("Activity changed").setDescription(`${messageArray.join(" ")}`).setTimestamp(new Date());
        let setActivity = messageArray.slice(1).join(" ");

        if(messageArray.join(" ").length > 100) return message.channel.send(new MessageEmbed().setAuthor("Too many characters").setColor("ff0000"))
        else
        {
            switch(messageArray[0])
            {
                case "streaming":
                    
                    message.channel.send(embed)
                    botConfig.activityStatus = "streaming"
                    botConfig.activity = setActivity;
                    bot.user.setActivity(botConfig.activity, { type: "STREAMING", url: "https://www.twitch.tv/smexy-briccs" })
                    break;
                case "playing":
                    
                    message.channel.send(embed)
                    botConfig.activityStatus = "playing"
                    botConfig.activity = setActivity;
                    bot.user.setActivity(botConfig.activity, { type: "PLAYING" })
                    break;
                case "watching":
                    message.channel.send(embed)
                    
                    botConfig.activityStatus = "watching"
                    botConfig.activity = setActivity;
                    bot.user.setActivity(botConfig.activity, { type: "WATCHING" })
                    break;
                case "listening to":
                    
                    message.channel.send(embed)
                    botConfig.activityStatus = "listening"
                    botConfig.activity = setActivity;
                    bot.user.setActivity(botConfig.activity, { type: "LISTENING" })
                    break;
                default:
                    
                    message.channel.send(super.getSuccessEmbed("Activity changed").setDescription(`${messageArray.join(" ")}`));
                    botConfig.activityStatus = "none"
                    botConfig.activity = messageArray.join(" ");
                    bot.user.setActivity(botConfig.activity)
            }
        }


        bot.on("ready", async () =>
        {
            switch(botConfig.activityStatus)
            {
            case "streaming":
                bot.user.setActivity(botConfig.activity, { type: "STREAMING", url: "https://www.twitch.tv/smexy-briccs" })
                break;
            case "playing":
                bot.user.setActivity(botConfig.activity, { type: "PLAYING" })
                break;
            case "watching":
                bot.user.setActivity(botConfig.activity, { type: "WATCHING" })
                break;
            case "listening":
                bot.user.setActivity(botConfig.activity, { type: "LISTENING" })
                break;
            case "none":
                bot.user.setActivity(botConfig.activity)
            }        
        });
    }
}

class ActivityCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "setActivity";
        this.description = "sets the activity of the bot";
        this.usage = `${AbstractCommandOptions.prefix}setActivity {playing|streaming|watching|listening to} {text}`;
        this.reqPermission = PermissionLevel.master;
    }
}
