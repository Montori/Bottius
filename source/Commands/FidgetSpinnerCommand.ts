import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed, Speaking, Guild } from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { FidgetSpinner } from "../Material/FidgetSpinner";
import { FidgetSpinnerService } from "../Service/FidgetSpinnerService";
import { BaseEntity } from "typeorm";

export class FidgetSpinnerCommand extends AbstractCommand {
    public commandOptions: FidgetSpinnerCommandOptions = new FidgetSpinnerCommandOptions();

    private fidgetSpinnerService: FidgetSpinnerService = FidgetSpinnerService.getInstance();

    // TODO: iron is temp as color and exclusive to 555778541732495385 (IronBeagle)
    // private colors: Array<string> = ["iron", "grey", "red", "blue", "green", "yellow", "purple", "pink", "orange", "white", "black"]; // spinner colors
    /* TODO: Reimplement
    private typeMap: Map<string, number> = new Map([["wood", 1], 
                                                    ["plastic", 2],
                                                    ["calcium", 5],
                                                    ["titan", 7],
                                                    ["yttrium", 8],
                                                    ["aluminium", 10]]);
                                                    */
    //private users: Map<String, SpinnerObject> = new Map();

    private activeSpinners: Map<string, FidgetSpinner> = new Map;

    private curFidgetSpinner: FidgetSpinner;

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>) 
    {
        // TODO rework the checks
        if (messageArray.length == 0) {
            message.channel.send(new MessageEmbed().setColor("ff0000").setDescription(`Oi mate, the syntax is \`${AbstractCommandOptions.prefix}spiner [command]\``)); // TODO rework this
            return;
        } 
        // TODO add leaderboard
        
        // Get fidget spinner and like do the stuff it needs to spinnnnnnnnnnn
        this.curFidgetSpinner = await FidgetSpinner.findOne({where: {discordID: message.member.id}});
        if (!this.curFidgetSpinner) { // create fidget spinner if not already existing for user
            this.curFidgetSpinner = new FidgetSpinner(message.member.id, message.guild.id);
            (await this.curFidgetSpinner.save()).reload();
        }
        
        switch (messageArray[0]) {
            case "spin":
                this.doSpin(message);
                break;
            case "info":
                this.doInfo(message);
                break;
            case "leaderboard":
                this.doLeaderboard(bot, message);
                break;
            default:
                break;
        }
        
        /*
        // REMOVE BEFORE DEPLOY
        if (messageArray[0] == "todo") {
            message.channel.send("TODO: REMOVE THIS\n" +
                                 "TODO: enums not string (<enum: string> map in command to print)\n" +
                                 "TODO: iron is temp as color and exclusive to 555778541732495385 (IronBeagle)\n" + 
                                 "TODO: reimplement materials\n" +
                                 "TODO: reimplement colors\n" +
                                 "TODO: rework checks\n" +
                                 "TODO: implement money earning\n" +
                                 "TODO: implement shop\n" +
                                 "TODO: rework discription(help command)\n" +
                                 "TODO: think about milestones\n" +
                                 "TODO: implement about milestones\n" +
                                 "TODO: think about upgrades material\n" +
                                 "TODO: implement about upgrades material\n" +
                                 "TODO: think about upgrades part\n" +
                                 "TODO: implement about upgrades part\n" +
                                 "TODO: prestige?\n" +
                                 "TODO: create new spin mechanics\n" +
                                 "TODO: outsource everything into methods ✅\n" +
                                 "TODO: leaderboard ✅\n" +
                                 "TODO: implement rainbow option for any color(switch default returns the hexcode)");
        }
        */
    }
    

    private async doLeaderboard(bot: Client, message: Message) {
        let topSpinners: Array<FidgetSpinner> = await this.fidgetSpinnerService.getLeaderboard(message.guild.id);
            let leaderboardEmbed: MessageEmbed = super.getSuccessEmbed(`Leaderboard of ${message.guild.name}`)
                                                    .setDescription("Here are the best spinner this server");

            topSpinners.forEach(spinner => 
                {
                    let discordUser = bot.users.resolve(spinner.discordID);
                    let firstField = discordUser ? discordUser.tag : `<@${spinner.discordID}>`;
                    leaderboardEmbed.addField(firstField, `Highscore: ${spinner.highscore} \nSpins: ${spinner.spins}`)
                });

            message.channel.send(leaderboardEmbed);
    }

    private async doInfo(message: Message) {
        if(message.mentions.members.first()) { // change fidgetspinner to mentioned user
            this.curFidgetSpinner = await FidgetSpinner.findOne({where: {discordID: message.mentions.members.first().id}});
            if (!this.curFidgetSpinner) { // create fidget spinner if not already existing for user
                this.curFidgetSpinner = new FidgetSpinner(message.mentions.members.first().id, message.mentions.members.first().guild.id);
                (await this.curFidgetSpinner.save()).reload();
            }
        }
        message.channel.send(new MessageEmbed().setColor(FidgetSpinnerService.getColorCodes(this.curFidgetSpinner.color))
                                                .setDescription(`- - - ${message.mentions.members.first() || message.member}'s spinner - - -\n`+ // mentioned person or self
                                                                `**Color**:\n${this.curFidgetSpinner.color}\n\n` +
                                                                `**Material**:\n${this.curFidgetSpinner.material}\n\n` +
                                                                `**Highscore**:\n${this.curFidgetSpinner.highscore}\n\n` +
                                                                `**Spins**:\n${this.curFidgetSpinner.spins}`));
    }

    private async doSpin(message: Message) {
        if (this.activeSpinners.has(message.member.id)) { // prevent multiple spins
            message.channel.send(new MessageEmbed().setColor(FidgetSpinnerService.getColorCodes(this.curFidgetSpinner.color)).setDescription(`Oi ${message.member}, your spinner is still spinning`)); // TODO add more spinner info
            return;
        } 
        // spin spinner and do the fun yay and checking and everything
        this.curFidgetSpinner.spins++;
        (await this.curFidgetSpinner.save()).reload();
        this.fidgetSpinnerService.spinDaThing(message, this.curFidgetSpinner);
        this.fidgetSpinnerService.addListener("spinnerFinished", eventInfo => this.activeSpinners.delete(message.member.id)); // on spinnerFinished event remove user from map
        this.activeSpinners.set(message.member.id, this.curFidgetSpinner);
    }

}

class FidgetSpinnerCommandOptions extends AbstractCommandOptions 
{
    constructor() 
    {
        super();
        this.commandName = "spinner";
        this.description = "spins a fidget spinner";
        this.usage = `${AbstractCommandOptions.prefix}spinner spin\n` + 
                     `${AbstractCommandOptions.prefix}spinner highscore [member]\n` + 
                     `${AbstractCommandOptions.prefix}spinner info\n` +
                     `${AbstractCommandOptions.prefix}spinner leaderboard`; // TODO rework this
        this.cooldown = 0;
    }
} 