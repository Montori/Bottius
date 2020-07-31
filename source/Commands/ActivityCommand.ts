import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { Client, Message, MessageEmbed } from "discord.js";
import { PermissionLevel } from "../Entities/Transient/PermissionLevel";

export class ActivityCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new ActivityCommandOptions();
    private ACTIVITY_TYPE: Array<string> = ["PLAYING", "STREAMING", "LISTENING TO", "WATCHING"];

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let embed: MessageEmbed = new MessageEmbed().setColor("00ff00").setAuthor("Activity changed").setDescription(`${messageArray.join(" ")}`).setTimestamp(new Date());
        
        if(messageArray.join(" ").length > 100) return message.channel.send(new MessageEmbed().setAuthor("Too many characters").setColor("ff0000"))
        let activityStatus: number = this.ACTIVITY_TYPE.findIndex(activity => messageArray.slice(0,2).join(" ").toUpperCase().includes(activity));
        let activity: string = messageArray.join(" ").substring(activityStatus >= 0 ? this.ACTIVITY_TYPE[activityStatus].length : 0);
        activityStatus = activityStatus >= 0 ? activityStatus : 0;

        bot.user.setActivity(activity, {type : activityStatus, url : "https://twitch.tv/smexy-briccs"});
        message.channel.send(super.getSuccessEmbed("Activity changed").setDescription(`${messageArray.join(" ")}`));
    }
}

class ActivityCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "activity";
        this.description = "sets the activity of the bot";
        this.usage = `${AbstractCommandOptions.prefix}setActivity {playing|streaming|watching|listening to} {text}`;
        this.reqPermission = PermissionLevel.master;
    }
}
