import {AbstractCommand} from "./AbstractCommand";
import { Client, Message, MessageEmbed } from 'discord.js';
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";

export class SelfSuccCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new SelfSuccCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        message.channel.send("https://cdn.voidtech.de/selfsucc.png");
    }
}

class SelfSuccCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "ping";
        this.description = "returns the bots ping";
        this.usage = `${AbstractCommandOptions.prefix}ping`;
    }
}