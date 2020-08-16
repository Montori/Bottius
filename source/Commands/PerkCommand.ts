import {
  Client, Message, Role, MessageEmbed,
} from 'discord.js';
import { AbstractCommand } from './AbstractCommand';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';
import { Perk } from '../Entities/Persistent/Perk';
import { PerkService } from '../Service/PerkService';
import { PermissionLevel } from '../Entities/Transient/PermissionLevel';
import { User } from '../Entities/Persistent/User';

export class PerkCommand extends AbstractCommand {
    public commandOptions: AbstractCommandOptions = new PerkCommandOptions();

    private perkService: PerkService = PerkService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) {
      const exeUser: User = await this.userService.getUser(message.member, message.guild);

      if (messageArray[0] == 'add') {
        if (exeUser.permissionLevel < PermissionLevel.admin) return super.sendPermissionDenied(message, PermissionLevel.admin);

        messageArray = messageArray.slice(1);
        if (!messageArray[0]) return super.sendHelp(message);

        const level: number = Number.parseInt(messageArray[0]);
        const role: Role = message.mentions.roles.first();

        if (isNaN(level) || !role) return super.sendHelp(message);
        if (await this.perkService.doesPerkExist(role.id)) return message.channel.send(new MessageEmbed().setAuthor('Perk duplicate').setColor('ff0000').setDescription('There is already a perk with the given role'));

        this.perkService.addPerk(level, role.id, message.guild);

        const embed: MessageEmbed = new MessageEmbed()
          .setAuthor('Perk added')
          .setTimestamp(new Date())
          .setDescription('A perk has been added')
          .addField('Level', `${level}`, true)
          .addField('Role', `${role}`, true)
          .setColor(role.color);
        return message.channel.send(embed);
      } if (messageArray[0] == 'remove') {
        if (exeUser.permissionLevel < PermissionLevel.admin) return super.sendPermissionDenied(message, PermissionLevel.admin);

        const role: Role = message.mentions.roles.first();
        if (!role) return super.sendHelp(message);
        if (!await this.perkService.doesPerkExist(role.id)) return message.channel.send(new MessageEmbed().setAuthor('Perk not existent').setColor('ff0000').setDescription('There is no perk with this role'));

        this.perkService.removePerk(role.id, message.guild);

        const embed: MessageEmbed = super.getSuccessEmbed('Perk removed')
          .setDescription('A perk has been removed')
          .addField('Role', `${role}`, true);

        return message.channel.send(embed);
      }
      if (messageArray[0] == 'list') {
        const perks: Array<Perk> = await this.perkService.getAllPerks(message.guild);
        const embed: MessageEmbed = super.getSuccessEmbed(`Perks of ${message.guild.name}`);

        if (!perks.length) embed.setDescription('There are currently no perks configured for this server');

        for (const perk of perks) {
          const role: Role = await message.guild.roles.fetch(perk.role);
          embed.addField(`Level: ${perk.reqLevel}`, `${role}`);
        }

        return message.channel.send(embed);
      }

      super.sendHelp(message);
    }
}

class PerkCommandOptions extends AbstractCommandOptions {
  constructor() {
    super();
    this.commandName = 'perk';
    this.description = 'adds, removes or lists leveling rewards';
    this.usage = `${AbstractCommandOptions.prefix}perk add {lvl} {@role}\n${AbstractCommandOptions.prefix}perk remove {role}\n${AbstractCommandOptions.prefix}perk list`;
  }
}
