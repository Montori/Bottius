import { ServerData } from "../Material/ServerData";
import { Guild } from "discord.js";

export class ServerDataService {
    private static instance: ServerDataService;

    public static getInstance(): ServerDataService {
        if (!ServerDataService.instance) {
            this.instance = new ServerDataService();
        }

        return this.instance;
    }

    public async getServerData(guild: Guild): Promise<ServerData> {
        let foundServer = await ServerData.findOne({ where: { discordID: guild.id } });
        if (!foundServer) {
            foundServer = new ServerData(guild.id);
            foundServer.save();
        }

        return foundServer;
    }

    public async getAllServerData() {
        return ServerData.find();
    }
}