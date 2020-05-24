import {AbstractCommand} from "./AbstractCommand";
import {Client, Message, MessageEmbed} from 'discord.js'
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";

export class GitHubCommand extends AbstractCommand
{
    public commandOptions: AbstractCommandOptions = new GitHubCommandOptions()
    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        let GitHubEmbed: MessageEmbed = new MessageEmbed()
        .setAuthor('GitHub')
        .setThumbnail('https://cdn.discordapp.com/avatars/705779783556137031/b8efe0df98e86f9ea1e1dc4f48d56698.png?size=256%27')
        .setDescription("Hey im a bot made by <@275355515003863040> for the Bricc Cult because he was bored.")
        .addFields(
            { name: ' ឵', value: ' ឵' },
            { name: "Here's my GitHub repo: ", value: 'https://github.com/montori/Bottius' },
            { name: "Want to help in the development of bottius?: ", value: 'https://github.com/Montori/Bottius/blob/master/README.md' },
        )
        .setTimestamp(new Date())
        .setFooter('Hey there! UwU')
        message.channel.send(GitHubEmbed);
    }
}

class GitHubCommandOptions extends AbstractCommandOptions{
    public commandName: string;
    public description: string;
    public usage: string;
    public cooldown: number;

    constructor()
    {
        super();
        this.commandName = "github";
        this.description = "Sends GitHub repo link";
        this.usage = `${AbstractCommandOptions.prefix}github`;
    }

}