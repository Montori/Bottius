import {AbstractCommand} from "./AbstractCommand";
import {Client, Message} from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { PermissionLevel } from "../Material/PermissionLevel";
import { UserService } from "../Service/UserService";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Material/Partition";
import { User } from "../Material/User";

export class LeaveMessageCommand extends AbstractCommand
{
    public commandOptions: LeaveMessageCommandOptions = new LeaveMessageCommandOptions();

    private partitionService: PartitionService = PartitionService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);
        let user: User = await this.userService.getUser(message.member, message.guild)

            // Activate and deactivate command
            if(messageArray[0] == "toggle") 
            {
                if(partition.leaveMessageActive)
                {
                    partition.leaveMessageActive = false;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Member leave messages have been turned off.`));
                }
                else
                {
                    partition.leaveMessageActive = true;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Member leave messages have been turned on.`));
                }
            }
            //Add channel to send leave message
            if(messageArray[0] == "channel")
            {
                if(messageArray[1] == "reset")
                {
                    if(!partition.leaveChannel) return message.channel.send(super.getFailedEmbed().setDescription(`Leave channel has not been set`));
                    else
                    {
                        partition.leaveChannel = null;
                        message.channel.send(super.getSuccessEmbed().setDescription(`Leave channel has been removed`));
                    }
                }
                else if(messageArray[1] == "set")
                {
                    let channel = message.mentions.channels.first();
                    if(channel)
                    {
                        partition.leaveChannel = message.mentions.channels.first().id;
                        message.channel.send(super.getSuccessEmbed().setDescription(`leave channel has been set to ${message.mentions.channels.first()}`));
                    }
                    else message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));
                }
            }//End of "channel"


            //Add custom leave message
            if(messageArray[0] == "description")
            {
                if(messageArray[1] == "reset")
                {
                    if(!partition.leaveMessage) return message.channel.send(super.getFailedEmbed().setDescription(`Leave message has not been set`));
                    else
                    {
                        partition.leaveMessage = " has left the server.";
                        message.channel.send(super.getSuccessEmbed().setDescription(`Leave message has been reset to **"{user} has left the server"**`));
                    }
                }
                else if(messageArray[1] == "set")
                {
                    let descMessage: string = messageArray.slice(2).join(' ');
                    if(descMessage)
                    {
                        partition.leaveMessage = descMessage;
                        message.channel.send(super.getSuccessEmbed().setDescription(`leave message has been set to: "**${descMessage}**"`));
                    }
                    else message.channel.send(super.getFailedEmbed().setDescription("Please provide a description"));
                }
            } //End of "description"

            partition.save();
    }
}

class LeaveMessageCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "leavemessage";
        this.description = "Configures the leave message settings.";
        this.usage = `${AbstractCommandOptions.prefix}leavemessage\n${AbstractCommandOptions.prefix}leavemessage channel set {channel}, \n ${AbstractCommandOptions.prefix}leavemessage channel remove, \n ${AbstractCommandOptions.prefix}leavemessage description set {description...}, \n ${AbstractCommandOptions.prefix}leavemessage description reset`;
        this.reqPermission = PermissionLevel.admin;
    }

}