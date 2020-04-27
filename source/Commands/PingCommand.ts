import {AbstractCommand} from "./AbstractCommand";
import {Client, Message} from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";

export class PingCommand extends AbstractCommand
{
    public commandOptions: PingCommandOptions = new PingCommandOptions();

    public runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        if(message.member.hasPermission("ADMINISTRATOR")){
            message.channel.send("Pong");
        }else
        {
            super.sendPermissionDenied(message);
        }
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
    }

}