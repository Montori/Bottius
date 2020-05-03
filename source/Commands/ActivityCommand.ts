import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, MessageEmbed } from "discord.js";
import { PermissionLevel } from "../Material/PermissionLevel";

export class ActivityCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new ActivityCommandOptions();

    public runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        if(!messageArray[0]) return super.sendHelp(message);
        if(messageArray.join(" ").length > 100) return message.channel.send(new MessageEmbed().setAuthor("Too many characters").setColor("ff0000"));
        bot.user.setActivity(messageArray.join(" "));
        message.channel.send(super.getSuccessEmbed("Activity changed").setDescription(`${messageArray.join(" ")}`).setColor("00ff00"));
    }

}

class ActivityCommandOptions extends AbstractCommandOptions
{
    public commandName: string;
    public description: string;
    public usage: string;
    
    constructor()
    {
        super();
        this.commandName = "setActivity";
        this.description = "sets the activity of the bot";
        this.usage = `${AbstractCommandOptions.prefix}setActivity {text}`;
        this.reqPermission = PermissionLevel.master;
    }
}
