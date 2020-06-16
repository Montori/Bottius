import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed } from 'discord.js';
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { EventEmitter } from "events";


class SpinnerObject extends EventEmitter {
    private time: number = 1;

    public color: String; 

    private interval: NodeJS.Timeout;

    private eventInfo: any/*json*/;

    constructor(pMessage: Message, pColor: String) { 
        super();
        this.color = pColor;
        this.eventInfo = {"detail": pMessage.member.id}; // safe member.id for event emitter
        this.interval = setInterval(() => { this.spinThaThing(pMessage) }, 1000); // start the spin breaker
        pMessage.channel.send(new MessageEmbed().setColor("00ff00").setDescription(`${pMessage.member} You spun your ${this.color} spinner`));
    }
    
    private spinThaThing(message: Message) {
        if (Math.random() > Math.pow(Math.E, -(this.time++ / 500))) { 
            message.channel.send(new MessageEmbed().setColor("fa5000").setDescription(`${message.member} Your ${this.color} spinner spun for **${this.time}** seconds!`));
            clearInterval(this.interval); // delete this interval
            this.emit("spinnerFinished", this.eventInfo); // send spinnerFinished event
            return;
        }
    }
}

export class SpinnerCommand extends AbstractCommand {
    public commandOptions: SpinnerCommandOptions = new SpinnerCommandOptions();

    private colors: Array<string> = ["red", "blue", "green", "yellow", "purple", "pink", "orange", "white", "black"]; // spinner colors
    private users: Map<String, SpinnerObject> = new Map();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>) {
        if (messageArray.length != 1) {
            message.channel.send(new MessageEmbed().setColor("ff0000").setDescription(`Oi mate, the syntax is \`${AbstractCommandOptions.prefix}spin [color]\` you troglodyte`));
            return;
        } else if (!this.colors.includes(messageArray[0])) { // only valid colors
            message.channel.send(new MessageEmbed().setColor("ff0000").setDescription(`The syntax is \`${AbstractCommandOptions.prefix}spin [color]\`, available colors are \`${this.colors.join("\`, \`")}\``));
            return;
        } else if (this.users.has(message.member.id)) { // prevent multiple spins
            message.channel.send(new MessageEmbed().setColor("ff0000").setDescription(`Oi ${message.member}, calm down, your ${this.users.get(message.member.id).color} spinner is still spinning`));
            return;
        }

        this.users.set(message.member.id, new SpinnerObject(message, messageArray[0])); // add spining user to map and start the spin
        this.users.get(message.member.id).addListener("spinnerFinished", eventInfo => { // on spinnerFinished event remove user from map
            this.users.delete(eventInfo.detail);
        });
    }
}

class SpinnerCommandOptions extends AbstractCommandOptions {
    constructor() {
        super();
        this.commandName = "spin";
        this.description = "spins a fidget spinner";
        this.usage = `${AbstractCommandOptions.prefix}spin [color]`;
        this.cooldown = 0;
    }
}