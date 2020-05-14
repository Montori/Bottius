import { Column, BaseEntity, Entity, ManyToOne } from "typeorm";
import { Partition } from "./Partition";

export abstract class AbstractPartionable extends BaseEntity
{
    @ManyToOne(type => Partition)
    public readonly partition!: Partition;

    constructor(partition: Partition)
    {
        super();
        this.partition = partition;
    }
}