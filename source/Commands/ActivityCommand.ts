import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, MessageEmbed } from "discord.js";
import { PermissionLevel } from "../Material/PermissionLevel";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Material/Partition";

export class ActivityCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new ActivityCommandOptions();
    private partitionService: PartitionService = PartitionService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        let embed: MessageEmbed = new MessageEmbed().setColor("00ff00").setAuthor("Activity changed").setDescription(`${messageArray.join(" ")}`).setTimestamp(new Date());
        let tooManyChars: MessageEmbed = new MessageEmbed().setAuthor("Too many characters").setColor("ff0000");
        let setActivity = messageArray.slice(1).join(" ");
        
        if(messageArray[0] == "streaming")
        {
            if(messageArray.join(" ").length > 100) return message.channel.send(tooManyChars);
            message.channel.send(embed)

            partition.botActivityStatus = "streaming"
            partition.botActivityMessage = setActivity;
        }
        else if(messageArray[0] == "playing")
        {
            if(messageArray.join(" ").length > 100) return message.channel.send(tooManyChars);
            message.channel.send(embed)

            partition.botActivityStatus = "playing"
            partition.botActivityMessage = setActivity;
        }
        else if(messageArray[0] == "watching")
        {
            if(messageArray.join(" ").length > 100) return message.channel.send(tooManyChars);
            message.channel.send(embed);

            partition.botActivityStatus = "watching"
            partition.botActivityMessage = setActivity;
        }
        else if(messageArray[0] == "listening to")
        {
            if(messageArray.join(" ").length > 100) return message.channel.send(tooManyChars);
            message.channel.send(embed);

            partition.botActivityStatus = "listening"
            partition.botActivityMessage = setActivity;
        }
        else
        {
            if(!messageArray[0]) return super.sendHelp(message);
            if(messageArray.join(" ").length > 100) return message.channel.send(tooManyChars);
            let activity = messageArray.join(" ")
            message.channel.send(super.getSuccessEmbed("Activity changed").setDescription(`${messageArray.join(" ")}`));

            partition.botActivityStatus = "none"
            partition.botActivityMessage = activity;
        }

        partition.save();
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