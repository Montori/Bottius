import {AbstractCommand} from "./AbstractCommand";
import {Client, Message} from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { PermissionLevel } from "../Material/PermissionLevel";
import { UserService } from "../Service/UserService";

export class PingCommand extends AbstractCommand
{
    public commandOptions: PingCommandOptions = new PingCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        message.channel.send("Pong!");
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
        this.reqPermission = PermissionLevel.trusted;
    }

}