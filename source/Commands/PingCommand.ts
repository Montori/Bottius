import {AbstractCommand} from "./AbstractCommand";
import {Client, Message} from 'discord.js';
import { AbstractCommandHelpContent } from "../Material/AbstractCommandHelpContent";

export class PingCommand extends AbstractCommand
{
    public helpEmbedContent: PingCommandHelp = new PingCommandHelp();

    public run(bot: Client, message: Message, messageArray: Array<string>)
    {
        if(message.member.hasPermission("ADMINISTRATOR")){
            message.channel.send("Pong");
        }else
        {
            super.sendPermissionDenied(message);
        }
    }
}

class PingCommandHelp extends AbstractCommandHelpContent{
    public commandName: string = "ping";
    public description: string = "returns Pong, lovely!";
    public usage: string = `${AbstractCommandHelpContent.prefix}ping`;

    constructor()
    {
        super();
    }

}