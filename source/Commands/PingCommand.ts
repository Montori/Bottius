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
        let userService: UserService = UserService.getInstance();
        message.channel.send(`${(await userService.getUser(message.member)).permissionLevel} added: ${(await userService.getUser(message.member)).addedDate}`);
    }
}

class PingCommandOptions extends AbstractCommandOptions{
    public commandName: string;
    public description: string;
    public usage: string;
    public cooldown: number;

    constructor()
    {
        super();
        this.commandName = "ping";
        this.description = "returns Pong, lovely!";
        this.usage = `${AbstractCommandOptions.prefix}ping`;
        this.reqPermission = PermissionLevel.trusted;
    }

}