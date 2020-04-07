import botConfig from '../botconfig.json';

export abstract class AbstractCommandHelpContent
{
    public color: string = "#ff8000";
    public abstract commandName: string;
    public abstract description: string;
    public abstract usage: string;
    public static prefix: string = botConfig.prefix;
}