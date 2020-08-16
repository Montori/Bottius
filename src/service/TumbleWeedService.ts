import { PartitionService } from "./PartitionService";
import { TextChannel, Client } from "discord.js";
import { Partition } from "../entities/persistent/Partition";

export class TumbleWeedService
{
    private static instance: TumbleWeedService;
    private partitionService: PartitionService = PartitionService.getInstance();
    private tumbleweedChannelMap: Map<string, Date> = new Map();
    
    private readonly TUMBLEWEED_MESSAGE = "A lot of nothing in here... <:tumbleweed:734388519572603002>";

    public static getInstance(): TumbleWeedService
    {
        if(!TumbleWeedService.instance)
        {
            this.instance = new TumbleWeedService();
        }

        return this.instance;
    }

    public handleTumbleWeed(bot: Client)
    {
        let now: Date = new Date();
        this.tumbleweedChannelMap.forEach((dueDate, channelID) => {
            if(now.valueOf() > dueDate.valueOf())
            {
                let channel: TextChannel = bot.channels.resolve(channelID) as TextChannel;
                this.tumbleweedChannelMap.delete(channelID);
                if(channel) channel.send(this.TUMBLEWEED_MESSAGE);
            }
        });
    }

    public async updateChannel(channel: TextChannel)
    {
        let partition: Partition = await this.partitionService.getPartition(channel.guild);
        if(partition.getTumbleWeedChannels().some(channelID => channelID == channel.id))
        {
            let untilTumbleweed: Date = new Date();
            untilTumbleweed.setHours(untilTumbleweed.getHours() + 4);

            this.tumbleweedChannelMap.set(channel.id, untilTumbleweed);
        }
    }
}