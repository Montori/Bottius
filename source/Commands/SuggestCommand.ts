import {AbstractCommand} from "./AbstractCommand";
import {Client, Message, MessageEmbed, TextChannel, GuildChannel} from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { PermissionLevel } from "../Material/PermissionLevel";
import { PartitionService } from "../Service/PartitionService";
import { Partition } from "../Material/Partition";

export class SuggestCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new SuggestCommandOptions();

    private partitionService: PartitionService = PartitionService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {  
        let partition: Partition = await this.partitionService.getPartition(message.guild);

        if(!messageArray[0])
        {
            message.channel.send(super.getFailedEmbed().setDescription("You cannot make a suggestion without any content")).then(message => setTimeout(() => message.delete(), 5000));
            return message.delete();
        } 
        
        if((await this.userService.getUser(message.member, message.guild)).permissionLevel >= PermissionLevel.admin && messageArray[0] == "channel")
        {
            if(messageArray[1] == "remove")
            {
                if(!partition.suggestChannel) return message.channel.send(super.getFailedEmbed().setDescription(`Suggest channel has not been set`));

                partition.suggestChannel = null;
                message.channel.send(super.getSuccessEmbed().setDescription(`Suggest channel has been removed`));
            } 
            else
            {
                if(!message.mentions.channels.first()) return super.sendHelp(message);
        
                partition.suggestChannel = message.mentions.channels.first().id;
        
                message.channel.send(super.getSuccessEmbed().setDescription(`Suggest channel has been set to ${message.mentions.channels.first()}`));
            }
    
            return partition.save();
        }
        else
        {
            let suggestMessage: string = messageArray.join(' ');
    
            let suggestEmbed: MessageEmbed = new MessageEmbed()
                .setTitle(`${message.author.tag}`)
                .setAuthor('User Suggestion: ')
                .setDescription(`${suggestMessage}`)
                .setTimestamp(new Date())
                .setFooter('Suggest with Bottius');
    
            if(partition.suggestChannel)
            {
                let channel: TextChannel = message.guild.channels.resolve(partition.suggestChannel) as TextChannel;
                if(!channel) return this.sendEmbed(message.channel as TextChannel, suggestEmbed);
                this.sendEmbed(channel, suggestEmbed);
            }
            else
            {
                this.sendEmbed(message.channel as TextChannel, suggestEmbed);
            }
        }
    }

    private sendEmbed(channel: TextChannel, embed: MessageEmbed)
    {
        channel.send({ embed: embed }).then(embedMessage => {
            embedMessage.react('✅');
            embedMessage.react('❌');
            embedMessage.react('🤷‍♀️');
        });
    }
}

class SuggestCommandOptions extends AbstractCommandOptions{
    constructor()
    {
        super();
        this.commandName = "suggest";
        this.description = "Creates an embed with your suggestion or manages the channel where the suggestions should be sent into";
        this.usage = `${AbstractCommandOptions.prefix}suggest {suggestion ...}\n${AbstractCommandOptions.prefix}suggest channel {channel}\n${AbstractCommandOptions.prefix}suggest channel remove`;
        this.cooldown = 1800;
    }
}