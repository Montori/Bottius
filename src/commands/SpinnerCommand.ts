import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed } from 'discord.js';
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { EventEmitter } from "events";


class SpinnerObject extends EventEmitter {
    private time: number = 1;

    public color: string; 

    private interval: NodeJS.Timeout;

    private eventInfo: any/*json*/;

    // get color codes
    private getColorCodes(color: string) {
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
                return "#f5f5f5";
            case "black":
                return "#000000";
        }
    }

    constructor(pMessage: Message, pColor: string) 
    { 
        super();
        this.color = pColor;
        this.eventInfo = {"detail": pMessage.member.id}; // safe member.id for event emitter
        this.interval = setInterval(() => { this.spinThaThing(pMessage) }, 1000); // start the spin breaker
        pMessage.channel.send(new MessageEmbed().setColor(this.getColorCodes(this.color)).setDescription(`${pMessage.member} You spun your ${this.color} spinner`));
    }

    private spinThaThing(message: Message) 
    {
        if (Math.random() > Math.pow(Math.E, -(this.time++ / 500))) { 
            message.channel.send(new MessageEmbed().setColor(this.getColorCodes(this.color)).setDescription(`${message.member} Your ${this.color} spinner spun for **${this.time}** seconds!`));
            clearInterval(this.interval); // delete this interval
            this.emit("spinnerFinished", this.eventInfo); // send spinnerFinished event
            return;
        }
    }
}

export class SpinnerCommand extends AbstractCommand {
    public commandOptions: SpinnerCommandOptions = new SpinnerCommandOptions();

    // TODO: iron is temp as color and exclusive to 555778541732495385 (IronBeagle)
    private colors: Array<string> = ["iron", "grey", "red", "blue", "green", "yellow", "purple", "pink", "orange", "white", "black"]; // spinner colors
    /* TODO: Reimplement
    private typeMap: Map<string, number> = new Map([["wood", 1], 
                                                    ["plastic", 2],
                                                    ["calcium", 5],
                                                    ["titan", 7],
                                                    ["yttrium", 8],
                                                    ["aluminium", 10]]);
                                                    */
    private users: Map<String, SpinnerObject> = new Map();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>) 
    {
        if (messageArray.length != 1) {
            message.channel.send(new MessageEmbed().setColor("ff0000").setDescription(`Oi mate, the syntax is \`${AbstractCommandOptions.prefix}spin [color]\` you troglodyte`));
            return;
        } else if (!this.colors.includes(messageArray[0])) { // only valid colors
            message.channel.send(new MessageEmbed().setColor("ff0000").setDescription(`The syntax is \`${AbstractCommandOptions.prefix}spin [color]\`, available colors are \`${this.colors.join("\`, \`")}\``));
            return;
        } else if (this.users.has(message.member.id)) { // prevent multiple spins
            message.channel.send(new MessageEmbed().setColor("ff0000").setDescription(`Oi ${message.member}, calm down, your ${this.users.get(message.member.id).color} spinner is still spinning`));
            return;
        } else if (messageArray[0] == "iron" && message.member.id != "555778541732495385") { // IronBealge case
            message.channel.send(new MessageEmbed().setColor("ff0000").setDescription(`This spinner is exclusive to <@555778541732495385>`));
            return;
        }

        this.users.set(message.member.id, new SpinnerObject(message, messageArray[0])); // add spining user to map and start the spin

        this.users.get(message.member.id).addListener("spinnerFinished", eventInfo => this.users.delete(eventInfo.detail)); // on spinnerFinished event remove user from map
    }
}

class SpinnerCommandOptions extends AbstractCommandOptions 
{
    constructor() 
    {
        super();
        this.commandName = "spin";
        this.description = "spins a fidget spinner";
        this.usage = `${AbstractCommandOptions.prefix}spin {color}`;
        this.cooldown = 0;
    }
} 