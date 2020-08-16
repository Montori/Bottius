import { Partition } from "./Partition";
import { BaseEntity, ManyToOne } from "typeorm";

export abstract class AbstractPartionable extends BaseEntity
{
    @ManyToOne(type => Partition, {onDelete: "CASCADE"})
    public readonly partition!: Partition;

    constructor(partition: Partition)
    {
        super();
        this.partition = partition;
    }
}