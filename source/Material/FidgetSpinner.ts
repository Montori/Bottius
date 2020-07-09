import { PrimaryGeneratedColumn, Column, Entity, BaseEntity } from "typeorm";

@Entity()
export class FidgetSpinner extends BaseEntity 
{
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    @Column({default: ""})
    public readonly discordID!: string;

    @Column({default: ""})
    public readonly guildID!: string;

    @Column()
    public color!: string;

    @Column()
    public material!: string;

    @Column()
    public highscore!: number;

    @Column()
    public spins!: number;

    public time: number = 0;

    public interval: NodeJS.Timeout;

    // TODO add all the different materials, colors, think about tiers, upgrades etc basically just do the thing

    // https://www.freecodecamp.org/news/how-to-code-your-own-event-emitter-in-node-js-a-step-by-step-guide-e13b7e7908e1/ <3
    private static listeners = {} // dont kill me montori

    addListener(event: string | symbol, listener: (...args: any[]) => void): this {
        FidgetSpinner.listeners[event] = this.listeners[event] || [];
        FidgetSpinner.listeners[event].push(listener);
        return this;
    }
    on(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    once(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    off(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    removeAllListeners(event?: string | symbol): this {
        throw new Error("Method not implemented.");
    }
    setMaxListeners(n: number): this {
        throw new Error("Method not implemented.");
    }
    getMaxListeners(): number {
        throw new Error("Method not implemented.");
    }
    listeners(event: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    rawListeners(event: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    emit(event: string | symbol, ...args: any[]): boolean {
        let fns = FidgetSpinner.listeners[event];
        if (!fns) return false;
        fns[0]();
        FidgetSpinner.listeners[event] = undefined; // clear the listener
        return true;
    }
    listenerCount(type: string | symbol): number {
        throw new Error("Method not implemented.");
    }
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    eventNames(): (string | symbol)[] {
        throw new Error("Method not implemented.");
    }

    constructor(discordId: string, guildId: string)
    {
        super();
        this.discordID = discordId;
        this.guildID = guildId;
        this.color = "grey";
        this.material = "cheap plastic";
        this.highscore = 0;
        this.spins = 0;
    }

}