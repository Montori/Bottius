import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, TextChannel, MessageEmbed, Role } from "discord.js";
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { PermissionLevel } from "../entities/transient/PermissionLevel";
import { Months, getDateSuffix } from "../entities/transient/DateFormatting";
import { User } from "../entities/persistent/User";

export class BirthdayCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new BirthdayCommandOptions();
    private readonly memberRegex = `<(@!?\\d+)>`;
    
    public runInternal(bot: Client, message: Message, messageArray: string[])
    {
        switch(messageArray[0])
        {
            case "set": this.handleSetBirthday(bot, message, messageArray); break;
            case "reset": this.handleResetBirthday(bot, message, messageArray); break;
            case "channel": this.handleBirthdayChannel(bot, message, messageArray); break;
            case "role": this.handleBirthdayRole(bot, message, messageArray); break;
            default: super.sendHelp(message);
        }
    }

    private async handleSetBirthday(bot: Client, message: Message, messageArray: string[])
    {
        let birthdayMember = message.mentions.members.first() && messageArray[1].match(this.memberRegex) ? message.mentions.members.first() : message.member;
        let exeUser = await this.userService.getUser(message.member, message.guild);
        let otherUserMentioned: boolean = birthdayMember != message.member;
        let birthdayUser: User = await this.userService.getUser(birthdayMember, message.guild);
        
        if((exeUser.permissionLevel < PermissionLevel.moderator && birthdayUser.birthdate) || 
            (otherUserMentioned && exeUser.permissionLevel < PermissionLevel.moderator)) return super.sendPermissionDenied(message, PermissionLevel.moderator);
        
        let birthDay: number = Number(messageArray[otherUserMentioned ? 2 : 1]);
        let birthMonth: number = Number(messageArray[otherUserMentioned ? 3 : 2]);

        if(isNaN(birthDay) || isNaN(birthMonth)) return message.channel.send(super.getFailedEmbed("Please provide a valid date (DD MM)"));

        let birthdate: Date = new Date(2000, birthMonth-1, birthDay, 0,0,0,0);
        if(birthdate.getDate() != birthDay || birthdate.getMonth() != birthMonth-1) return message.channel.send(this.getFailedEmbed().setDescription("Please provide a valid date (DD MM)"));


        birthdayUser.birthdate = birthdate;
        birthdayUser.save();

        message.channel.send(super.getSuccessEmbed().setDescription(`${otherUserMentioned ? birthdayMember : "Your"} birthdate has been set to ${Months[birthdate.getMonth()]} ${birthdate.getDate()}${getDateSuffix(birthdate.getDate())}`));
    }
    
    private async handleResetBirthday(bot: Client, message: Message, messageArray: string[]) 
    {
        let birthdayMember = message.mentions.members.first() && messageArray[1].match(this.memberRegex) ? message.mentions.members.first() : message.member;
        let exeUser = await this.userService.getUser(message.member, message.guild);
        let otherUserMentioned: boolean = birthdayMember != message.member;
        let birthdayUser: User = await this.userService.getUser(birthdayMember, message.guild);
        
        if((exeUser.permissionLevel < PermissionLevel.moderator && birthdayUser.birthdate) || 
            (otherUserMentioned && exeUser.permissionLevel < PermissionLevel.moderator)) return super.sendPermissionDenied(message, PermissionLevel.moderator);

        else if(!birthdayUser.birthdate) return message.channel.send(super.getFailedEmbed().setDescription(`${otherUserMentioned ? birthdayMember : "Your"} birthdate hasnt been set yet.`));
        else
        {
            birthdayUser.birthdate = null;
            birthdayUser.save();
            message.channel.send(super.getSuccessEmbed().setDescription(`${otherUserMentioned ? birthdayMember : "Your"} birthdate has been reset.`));
        }
    }

    private async handleBirthdayChannel(bot: Client, message: Message, messageArray: string[]) 
    {
        let exeUser = await this.userService.getUser(message.member, message.guild);
        if(exeUser.permissionLevel < PermissionLevel.admin) return super.sendPermissionDenied(message, PermissionLevel.admin);

        let partition = await this.partitionService.getPartition(message.guild);

        switch(messageArray[1])
        {
            case "set":
                {
                    let birthdayChannel: TextChannel = message.mentions.channels.first();

                    if(!messageArray[2] || !birthdayChannel) return message.channel.send(super.getFailedEmbed().setDescription(`Please provide a valid channel.`))
                    else partition.birthdayChannel = birthdayChannel.id;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Birthday messages will be send to ${birthdayChannel}`));
                    
                    partition.save();
                    break;
                }
            case "remove":
                {
                    if(!partition.birthdayChannel) return message.channel.send(super.getFailedEmbed().setDescription("No channel has been set yet."))
                    else partition.birthdayChannel = null;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Birthday channel has been removed.`));
                    
                    partition.save();
                    break;
                }
            default:
                {
                    let birthdayChannel: TextChannel = message.guild.channels.resolve(partition.birthdayChannel) as TextChannel;
                    if(birthdayChannel) return message.channel.send(new MessageEmbed().setDescription(`Birthday messages will be send to ${birthdayChannel}`));
                    else message.channel.send(new MessageEmbed().setDescription(`A channel for birthday messages has not been set yet.`));
                    break;
                }
        }
    }

    private async handleBirthdayRole(bot: Client, message: Message, messageArray: string[]) 
    {
        let exeUser = await this.userService.getUser(message.member, message.guild);
        if(exeUser.permissionLevel < PermissionLevel.admin) return super.sendPermissionDenied(message, PermissionLevel.admin);

        let partition = await this.partitionService.getPartition(message.guild);

        switch(messageArray[1])
        {
            case "set":
                {
                    let birthdayRole: Role = message.mentions.roles.first();

                    if(!messageArray[2] || !birthdayRole) return message.channel.send(super.getFailedEmbed().setDescription(`Please provide a valid role.`))
                    else partition.birthdayRole = birthdayRole.id;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Birthday users will now receive the ${birthdayRole} role.`));
                    
                    partition.save();
                    break;
                }
            case "remove":
                {
                    if(!partition.birthdayRole) return message.channel.send(super.getFailedEmbed().setDescription("No birthday role has been set yet."))
                    else partition.birthdayRole = null;
                    message.channel.send(super.getSuccessEmbed().setDescription(`Birthday role has been removed.`));
                    
                    partition.save();
                    break;
                }
            default:
                {
                    let birthdayRole: Role = message.guild.roles.resolve(partition.birthdayRole);
                    if(birthdayRole) return message.channel.send(new MessageEmbed().setDescription(`Birthday users will receive the ${birthdayRole} role`));
                    else message.channel.send(new MessageEmbed().setDescription(`No birthday role has been set yet.`));
                    break;
                }
        }
    }
}

class BirthdayCommandOptions extends AbstractCommandOptions 
{

    constructor() 
    {
		super();
		this.commandName = "birthday";
		this.description = "command to configure the birthday feature";
		this.usage =
			`${AbstractCommandOptions.prefix}birthday reset\n` +
			`${AbstractCommandOptions.prefix}birthday reset {user}\n` +
			`${AbstractCommandOptions.prefix}birthday set {DD} {MM}\n` +
			`${AbstractCommandOptions.prefix}birthday set {user} {DD} {MM}\n` +
			`${AbstractCommandOptions.prefix}birthday role set {role}\n` +
			`${AbstractCommandOptions.prefix}birthday role remove\n` +
			`${AbstractCommandOptions.prefix}birthday channel set {channel}\n` +
			`${AbstractCommandOptions.prefix}birthday channel remove`;
	}
}