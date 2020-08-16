import { TextChannel, Client } from 'discord.js';
import { PartitionService } from './PartitionService';
import { Partition } from '../Entities/Persistent/Partition';

export class TumbleWeedService {
    private static instance: TumbleWeedService;

    private partitionService: PartitionService = PartitionService.getInstance();

    private tumbleweedChannelMap: Map<string, Date> = new Map();

    private readonly TUMBLEWEED_MESSAGE = 'A lot of nothing in here... <:tumbleweed:734388519572603002>';

    public static getInstance(): TumbleWeedService {
      if (!TumbleWeedService.instance) {
        this.instance = new TumbleWeedService();
      }

      return this.instance;
    }

    public handleTumbleWeed(bot: Client) {
      const now: Date = new Date();
      this.tumbleweedChannelMap.forEach((dueDate, channelID) => {
        if (now.valueOf() > dueDate.valueOf()) {
          const channel: TextChannel = bot.channels.resolve(channelID) as TextChannel;
          this.tumbleweedChannelMap.delete(channelID);
          if (channel) channel.send(this.TUMBLEWEED_MESSAGE);
        }
      });
    }

    public async updateChannel(channel: TextChannel) {
      const partition: Partition = await this.partitionService.getPartition(channel.guild);
      if (partition.getTumbleWeedChannels().some((channelID) => channelID == channel.id)) {
        const untilTumbleweed: Date = new Date();
        untilTumbleweed.setHours(untilTumbleweed.getHours() + 4);

        this.tumbleweedChannelMap.set(channel.id, untilTumbleweed);
      }
    }
}
