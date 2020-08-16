import {
  BaseEntity, Entity, Column, PrimaryGeneratedColumn,
} from 'typeorm';
import { DelayedTaskType } from '../Transient/DelayedTaskType';

@Entity()
export class DelayedTask extends BaseEntity {
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column({ type: 'integer', enum: DelayedTaskType })
    public readonly type!: DelayedTaskType;

    @Column()
    public readonly dueDate!: Date;

    @Column({ nullable: true })
    public readonly description: string;

    constructor(due: Date, type: DelayedTaskType, description?: string) {
      super();
      this.dueDate = due;
      this.type = type;
      this.description = description;
    }
}
