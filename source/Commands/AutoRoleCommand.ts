import {
  Client, Message, Role, MessageEmbed,
} from 'discord.js';
import { AbstractCommand } from './AbstractCommand';
import { AbstractCommandOptions } from '../Entities/Transient/AbstractCommandOptions';
import { PermissionLevel } from '../Entities/Transient/PermissionLevel';
import { AutoRole } from '../Entities/Persistent/AutoRole';
import { Partition } from '../Entities/Persistent/Partition';

export class AutoRoleCommand extends AbstractCommand {
    public commandOptions: AbstractCommandOptions = new AutoRoleCommandOptions();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) {
      const partition: Partition = await this.partitionService.getPartition(message.guild);
      if (messageArray[0] == 'add') {
        const role: Role = message.mentions.roles.first();
        if (!role) return message.channel.send(super.getFailedEmbed().setDescription('Please provide a valid role'));

        new AutoRole(role.id, partition).save();
        return message.channel.send(super.getSuccessEmbed().setDescription(`${role} will now be assigned to new users`));
      }
      if (messageArray[0] == 'remove') {
        const role: Role = message.mentions.roles.first();
        if (!role) return message.channel.send(super.getFailedEmbed().setDescription('Please provide a valid role'));

        await AutoRole.findOne({ where: { partition, roleID: role.id } }).then((autoRole) => autoRole.remove());
        return message.channel.send(super.getSuccessEmbed().setDescription(`${role} will no longer be assigned to new users`));
      }
      if (messageArray[0] == 'list') {
        const autoRoleList: Array<Role> = (await (AutoRole.find({ where: { partition } }))).map((autoRole) => message.guild.roles.resolve(autoRole.roleID));
        if (!autoRoleList.join().length) return message.channel.send(super.getSuccessEmbed(`There are no autoroles configured for ${message.guild.name}`));

        const autoRoleEmbed: MessageEmbed = super.getSuccessEmbed(`Autoroles of ${message.guild.name}`).setDescription(autoRoleList.join('\n'));
        return message.channel.send(autoRoleEmbed);
      }
    }
}

class AutoRoleCommandOptions extends AbstractCommandOptions {
  constructor() {
    super();
    this.commandName = 'autorole';
    this.description = 'adds/removes/lists autoroles for this server';
    this.usage = `${AbstractCommandOptions.prefix}autorole add {role}\n${AbstractCommandOptions.prefix}autorole remove {role}\n${AbstractCommandOptions.prefix}autorole list`;
    this.reqPermission = PermissionLevel.admin;
  }
}
