import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role, Guild } from 'discord.js';
import { AbstractPartionable } from './AbstractPartionable';
import { Partition } from './Partition';

@Entity()
export class AutoRole extends AbstractPartionable {
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column()
    public roleID!: string;

    constructor(roleID: string, partition: Partition) {
      super(partition);
      this.roleID = roleID;
    }
}
