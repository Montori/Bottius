import {
  Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, ManyToOne, JoinTable,
} from 'typeorm';
import { User } from './User';
import { AbstractPartionable } from './AbstractPartionable';
import { Partition } from './Partition';

@Entity()
export class Quest extends AbstractPartionable {
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column()
    public readonly createdAt!: Date;

    @ManyToOne((type) => User)
    public readonly assignor!: User;

    @ManyToMany((type) => User, { cascade: ['insert', 'update'] })
    @JoinTable()
    public assignees!: Array<User>;

    @Column()
    public description!: string;

    constructor(assignor: User, assignees: Array<User>, description: string, partition: Partition) {
      super(partition);

      this.createdAt = new Date();
      this.assignor = assignor;
      this.assignees = assignees;
      this.description = description;
    }

    public addAssignee(user: User) {
      this.assignees.push(user);
    }
}
