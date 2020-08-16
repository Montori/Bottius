import {Client, Message, MessageEmbed} from 'discord.js';
import { AbstractCommandOptions } from '../entities/transient/AbstractCommandOptions';
import { CooldownService } from '../service/CooldownService';
import { UserService } from '../service/UserService';
import { User } from '../entities/persistent/User';
import { PermissionLevel } from '../entities/transient/PermissionLevel';
import { PartitionService } from '../service/PartitionService';

export abstract class AbstractCommand 
{
    public cooldownService: CooldownService = CooldownService.getInstance();
    public userService: UserService = UserService.getInstance();
    public partitionService: PartitionService = PartitionService.getInstance();

    public async run(bot: Client, message: Message, messageArray: Array<string>)
    {
        let user: User = await this.userService.getUser(message.member, message.guild);
        if(user.permissionLevel < this.commandOptions.reqPermission) return this.sendPermissionDenied(message);
        if(this.cooldownService.isCooldown(message.member, this.commandOptions.commandName) && user.permissionLevel < PermissionLevel.admin)
        {
            this.sendCooldownEmbed(message);
        }
        else
        {
            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName, this.commandOptions.cooldown);
            this.runInternal(bot, message, messageArray);
        }
    }

    public abstract async runInternal(bot: Client, message: Message, messageArray: Array<string>);

    // Method for sending embeds, with limits applied on the data sent.
    // Currently, this splits the contents of an embed
    // across multiple embeds if too mauch data is supplied.
    public static async trySendEmbed(message: Message, embed: MessageEmbed) {

        // Limits according https://discord.com/developers/docs/resources/channel#embed-limits
        let maxTitleLen = 256;
        let maxDescriptionLen = 2048;
        let maxFields = 25;
        let maxFieldNameLen = 256;
        let maxFieldValueLen = 1024;
        let maxFooterLen = 2048;
        let maxAuthorLen = 256;
        let maxEmbedCharacters = 6000;

        // Limiting field size
        if (embed.fields != null) embed.fields.forEach(field => {
            if (field.name.length > maxFieldNameLen) field.name = field.name.substring(0, maxFieldNameLen - 3) + "...";
            if (field.value.length > maxFieldValueLen) field.value = field.value.substring(0, maxFieldValueLen - 3) + "...";
        });

        // Author name is too long
        if (embed.author != null && embed.author.name != null && embed.author.name.length > maxAuthorLen) embed.author.name = embed.author.name.substring(0, maxAuthorLen - 3) + "...";

        // Title is too long
        if (embed.title != null && embed.title.length > maxTitleLen) embed.title = embed.title.substr(0, maxTitleLen - 3) + "...";

        // Description is too long
        if (embed.description != null && embed.description.length > maxDescriptionLen) {
            let text1 = embed.description.substring(0, maxDescriptionLen);
            let text2 = embed.description.substring(maxDescriptionLen, embed.description.length);

            let embed1: MessageEmbed = embed;
            embed1.description = text1;
            embed1.fields = null;
            embed1.footer = null
            embed1.timestamp = null;

            let embed2: MessageEmbed = new MessageEmbed();
            embed2.color = embed.color;
            embed2.description = text2;
            embed2.fields = embed.fields;
            embed2.footer = embed.footer;
            embed2.timestamp = embed.timestamp;

            this.trySendEmbed(message, embed1);
            this.trySendEmbed(message, embed2);
            return;
        }
        // Too many fields
        else if (embed.fields != null && embed.fields.length > maxFields) {
            let fields1 = embed.fields.slice(0, maxFields);
            let fields2 = embed.fields.slice(maxFields, embed.fields.length);

            let embed1: MessageEmbed = embed
            embed1.fields = fields1;
            embed1.footer = null
            embed1.timestamp = null;

            let embed2: MessageEmbed = new MessageEmbed();
            embed2.color = embed.color;
            embed2.fields = fields2;
            embed2.footer = embed.footer;
            embed2.timestamp = embed.timestamp;

            this.trySendEmbed(message, embed1);
            this.trySendEmbed(message, embed2);
            return;
        }
        // Footer is too long
        else if (embed.footer != null && embed.footer.text != null && embed.footer.text.length > maxFooterLen) {
            let footer1 = embed.footer;
            let footer2 = embed.footer;

            footer1.text = footer1.text.substring(0, maxFooterLen);
            footer2.text = footer2.text.substring(maxFooterLen, footer2.text.length);

            let embed1: MessageEmbed = embed;
            embed1.footer = footer1;
            embed1.timestamp = null;

            let embed2: MessageEmbed = new MessageEmbed();
            embed2.color = embed.color;
            embed2.footer = footer2;
            embed2.timestamp = embed.timestamp;

            this.trySendEmbed(message, embed1);
            this.trySendEmbed(message, embed2);
            return;
        }

        // The total number of characters in the title, description, field name,
        // field value, footer, and author must be <= maxEmbedCharacters
        let totalChars = 0;
        if (embed.title != null) totalChars += embed.title.length;
        if (embed.description != null) totalChars += embed.description.length;
        if (embed.author != null && embed.author.name != null) totalChars += embed.author.name.length; // At most 2560

        // Checking length of fields
        if (embed.fields != null) for (let i = 0; i < embed.fields.length; i++) {
            let fieldChars = embed.fields[i].name.length + embed.fields[i].value.length;
            totalChars += fieldChars;
            if (totalChars > maxEmbedCharacters) {
                let fields1 = embed.fields.slice(0, i);
                let fields2 = embed.fields.slice(i, embed.fields.length);

                let embed1: MessageEmbed = embed;
                embed1.fields = fields1;
                embed1.footer = null
                embed1.timestamp = null;

                let embed2: MessageEmbed = new MessageEmbed();
                embed2.color = embed.color;
                embed2.fields = fields2;
                embed2.footer = embed.footer;
                embed2.timestamp = embed.timestamp;

                this.trySendEmbed(message, embed1);
                this.trySendEmbed(message, embed2);
                return;
            }
        }

        if (embed.footer != null && embed.footer.text != null) totalChars += embed.footer.text.length;
        if (totalChars > maxEmbedCharacters) {
            let embed1: MessageEmbed = embed;
            embed1.footer = null;
            embed1.timestamp = null;

            let embed2: MessageEmbed = new MessageEmbed()
            embed2.color = embed.color;
            embed2.footer = embed.footer;
            embed2.timestamp = embed.timestamp;

            this.trySendEmbed(message, embed1);
            this.trySendEmbed(message, embed2);
            return;
        }

        message.channel.send(embed);
    }

    public sendHelp(message: Message)
    {
        let helpEmbed: MessageEmbed = new MessageEmbed()
            .setColor("#ff8000")
            .setAuthor(`Usage of Command: ${this.commandOptions.commandName}`)
            .setDescription(this.commandOptions.description)
            .addField("Permission level", `${PermissionLevel[this.commandOptions.reqPermission]}`, true)
            .addField("Cooldown", `${this.commandOptions.cooldown}s`, true)
            .addField("Usage", this.commandOptions.usage);

        AbstractCommand.trySendEmbed(message, helpEmbed);
    }

    public sendPermissionDenied(message: Message, reqPermission?: PermissionLevel)
    {
        let deniedEmbed = new MessageEmbed()
            .setColor("ff0000")
            .setAuthor("Permission Denied")
            .setDescription(`You lack the permissions to use this part of the \`${this.commandOptions.commandName}\` command.\nYou need to be \`${reqPermission ? PermissionLevel[reqPermission] : PermissionLevel[this.commandOptions.reqPermission]}\` or higher`);

        AbstractCommand.trySendEmbed(message, deniedEmbed);
    }

    public sendCooldownEmbed(message: Message)
    {
        let cooldownEmbed: MessageEmbed = new MessageEmbed()
            .setColor("#ff0000")
            .setAuthor(`${this.commandOptions.commandName} Cooldown`)
            .setDescription(`You can only use this command once every ${this.commandOptions.cooldown} seconds`);
        
        AbstractCommand.trySendEmbed(message,cooldownEmbed);
    }

    public getFailedEmbed(title?: string): MessageEmbed
    {
        return new MessageEmbed().setColor("ff0000").setAuthor(title ? title : "Action failed").setTimestamp(new Date());
    }

    public getSuccessEmbed(title?: string): MessageEmbed
    {
        return new MessageEmbed().setColor("00ff00").setAuthor(title ? title : "Action successful").setTimestamp(new Date());
    }

    public abstract commandOptions: AbstractCommandOptions;
}
