import {AbstractCommand} from "./AbstractCommand";
import { Client, Message, MessageEmbed } from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { PermissionLevel } from "../Material/PermissionLevel";
import { UserService } from "../Service/UserService";

export class PingCommand extends AbstractCommand
{
    public commandOptions: PingCommandOptions = new PingCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        const m = await message.channel.send(new MessageEmbed().setColor("#ff0000").setDescription("Ping?"));
        m.edit(new MessageEmbed().setColor("#00FF00").setAuthor("Pong!").setDescription(`Latency: \`${m.createdTimestamp - message.createdTimestamp}\`ms \nAPI Latency: \`${Math.round(bot.ws.ping)}\`ms`));
    }
}

class PingCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "ping";
        this.description = "returns Pong, lovely!";
        this.usage = `${AbstractCommandOptions.prefix}ping`;
    }
}
