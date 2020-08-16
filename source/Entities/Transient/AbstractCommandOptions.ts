import botConfig from '../../botconfig.json';
import { PermissionLevel } from './PermissionLevel';

export abstract class AbstractCommandOptions {
    public color: string = '#ff8000';

    public commandName: string = 'A command';

    public description: string = 'Haha Developer stupid, forgot to add a description';

    public usage: string = 'Dunno man ¯\_(ツ)_/¯';

    public cooldown: number = 5;

    public reqPermission: PermissionLevel = PermissionLevel.member;

    public static prefix: string = botConfig.prefix;
}
