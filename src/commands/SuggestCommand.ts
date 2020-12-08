import {AbstractCommand} from "./AbstractCommand";
import {Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { PermissionLevel } from "../entities/transient/PermissionLevel";
import { Partition } from "../entities/persistent/Partition";

export class SuggestCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new SuggestCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {  
        let partition: Partition = await this.partitionService.getPartition(message.guild);

        if((await this.userService.getUser(message.member, message.guild)).permissionLevel > PermissionLevel.admin)
        {
            if(messageArray[0] == "channel")
            {
                if(messageArray[1] == "set")
                {
                    let channel: TextChannel = message.mentions.channels.first();
                    if(!channel) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a valid channel"));

                    partition.suggestChannel = channel.id;
                    partition.save();
                    return message.channel.send(super.getSuccessEmbed().setDescription(`Suggest channel has been set to ${channel}`));
                }
                else if(messageArray[1] == "reset")
                {
                    if(!partition.suggestChannel) return message.channel.send(super.getFailedEmbed().setDescription("Suggest channel has not been set"));
                
                    partition.suggestChannel = null;
                    partition.save();
                    return message.channel.send(super.getSuccessEmbed().setDescription("Suggest channel has been removed"));
                }
            }   
        }

        if(!messageArray[0])
        {
            message.channel.send(super.getFailedEmbed().setDescription("You cannot make a suggestion without any content")).then(message => setTimeout(() => message.delete(), 5000));
            return message.delete();
        } 
        else
        {
            if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional")) return message.channel.send(super.getFailedEmbed().setDescription("You can only use this command once every 1800 seconds"));  
            
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
            else this.sendEmbed(message.channel as TextChannel, suggestEmbed);
            message.react('✅');
            setTimeout(() => message.delete(), 5000);
            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 1800);
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
        this.description = "creates an embed with your suggestion or manages the channel where the suggestions should be sent into";
        this.cooldown = 0;
        this.usage = `${AbstractCommandOptions.prefix}suggest {suggestion...}` + 
                     `\n${AbstractCommandOptions.prefix}suggest channel set {#channel}` + 
                     `\n${AbstractCommandOptions.prefix}suggest channel remove`;
    }
}
