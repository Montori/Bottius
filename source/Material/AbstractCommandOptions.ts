import botConfig from '../botconfig.json';
import { PermissionLevel } from './PermissionLevel';

export abstract class AbstractCommandOptions
{
    public color: string = "#ff8000";
    public abstract commandName: string;
    public abstract description: string;
    public abstract usage: string;
    public cooldown: number = 5;
    public reqPermission: PermissionLevel = PermissionLevel.member;
    public static prefix: string = botConfig.prefix;
}