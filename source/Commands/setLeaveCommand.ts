import {AbstractCommand} from "./AbstractCommand";
import {Client, Message} from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { PermissionLevel } from "../Material/PermissionLevel";
import { UserService } from "../Service/UserService";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Material/Partition";

export class setleaveCommand extends AbstractCommand
{
    public commandOptions: setleaveCommandOptions = new setleaveCommandOptions();

    private partitionService: PartitionService = PartitionService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let partition: Partition = await this.partitionService.getPartition(message.guild);

        if(message.member.hasPermission('ADMINISTRATOR'))
        {
            // Activate and deactivate command
            if(messageArray[0] == "activate") 
            {
                if(partition.leaveMessageActive === true) return message.channel.send(super.getFailedEmbed().setDescription(`Member leave message is already on`));
                else
                {
                    partition.leaveMessageActive = true;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Member leave message has been turned on.`));
                }
            }
            else if(messageArray[0] == "deactivate") 
            {
                if(partition.leaveMessageActive === false) return message.channel.send(super.getFailedEmbed().setDescription(`Member leave message is already off`));
                else
                {
                    partition.leaveMessageActive = false;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Member leave message has been turned off.`));
                }
            } //End of Activate and deactivate command


            //Add channel to send leave message
            if(messageArray[0] == "channel")
            {
                if(messageArray[1] == "remove")
                {
                    if(!partition.leaveChannel) return message.channel.send(super.getFailedEmbed().setDescription(`Leave channel has not been set`));
                    else
                    {
                        partition.leaveChannel = null;
                        message.channel.send(super.getSuccessEmbed().setDescription(`Leave channel has been removed`));
                    }
                }
                else(messageArray[1] == "set")
                {
                    partition.leaveChannel = message.mentions.channels.first().id;
                    message.channel.send(super.getSuccessEmbed().setDescription(`leave channel has been set to ${message.mentions.channels.first()}`));
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
                    partition.leaveMessage = descMessage;
                    message.channel.send(super.getSuccessEmbed().setDescription(`leave message has been set to: "**${descMessage}**"`));
                }
            } //End of "description"

            return partition.save();
            
        } //End of "has permission ADMINISTRATOR"   
    }
}

class setleaveCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "setLeave";
        this.description = "Configures  the leave message settings.";
        this.usage = `${AbstractCommandOptions.prefix}setleave, \n ${AbstractCommandOptions.prefix}setleave channel set {channel], \n ${AbstractCommandOptions.prefix}setleave channel remove, \n ${AbstractCommandOptions.prefix}setleave description set {description...}, \n ${AbstractCommandOptions.prefix}setleave description reset`;
        this.reqPermission = PermissionLevel.admin;
    }

}