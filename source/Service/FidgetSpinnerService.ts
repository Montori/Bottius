import { Message, MessageEmbed, Guild } from "discord.js";
import { EventEmitter } from "typeorm/platform/PlatformTools";
import { FidgetSpinner } from "../Material/FidgetSpinner";
import { Partition } from "../Material/Partition";

export class FidgetSpinnerService extends EventEmitter
{
    private static instance: FidgetSpinnerService;
    
    public static getInstance(): FidgetSpinnerService
    {
        if(!FidgetSpinnerService.instance)
        {
            this.instance = new FidgetSpinnerService();
        }
        return this.instance;
    }

    public async getLeaderboard(guildId: string) : Promise<Array<FidgetSpinner>> {
        return await FidgetSpinner.find({where: {guildID: guildId}, order : {highscore: "DESC"}, take: 7});
    }

    // TODO add more spinner details
    // TODO embed colors
    public async spinDaThing(pMessage: Message, fidgetSpinner: FidgetSpinner) {
        fidgetSpinner.interval = setInterval(() => { this.spinning(pMessage, fidgetSpinner) }, 1000); // start the spin breaker
        pMessage.channel.send(new MessageEmbed().setColor(FidgetSpinnerService.getColorCodes(fidgetSpinner.color))
            .setDescription(`${pMessage.member} You spun your spinner`));
    }

    public static getColorCodes(color: string) {
        switch(color) {
            case "iron":
                return "#d4d4d4";
            case "grey":
                return "#808080";
            case "red":
                return "#ff0000";
            case "blue":
                return "#0000ff";
            case "green":
                return "#00ff00";
            case "yellow":
                return "#dee600";
            case "purple":
                return "#aa00ff";
            case "pink":
                return "#ff00bf";
            case "orange":
                return "#ff8c00";
            case "white":
                return "#fAfAfA";
            case "black":
                return "#000000";
        }
    }

    public async spinning(message: Message, fidgetSpinner: FidgetSpinner) 
    {
        if (Math.random() > Math.pow(Math.E, -(fidgetSpinner.time++ / 500))) { // TODO rework all of this
            message.channel.send(new MessageEmbed().setColor(FidgetSpinnerService.getColorCodes(fidgetSpinner.color))
                .setDescription(`${message.member} Your spinner spun for **${fidgetSpinner.time}** seconds!`));
            clearInterval(fidgetSpinner.interval); // delete this interval
            this.emit("spinnerFinished", null); // send spinnerFinished event
            if (fidgetSpinner.time > fidgetSpinner.highscore) 
                fidgetSpinner.highscore = fidgetSpinner.time;
            fidgetSpinner.time = 0;
            fidgetSpinner.save();
            return;
        }
    }
}