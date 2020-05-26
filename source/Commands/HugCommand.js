Object.defineProperty(exports, "__esModule", { value: true });
const AbstractCommand_1 = require("./AbstractCommand");
const AbstractCommandOptions_1 = require("../Material/AbstractCommandOptions");
class HugCommand extends AbstractCommand_1.AbstractCommand {
    constructor() {
        super(...arguments);
        this.commandOptions = new HugCommandOptions();
    }
    async runInternal(bot, message, messageArray) {
        let taggedUser = message.mentions.users.first();
        if (taggedUser) {
            if (this.cooldownService.isCooldown(message.member, this.commandOptions.commandName + "<functional"))
                return message.channel.send("Woah there, you can't just give out hugs like that, as if you're some sort of charity. Wait a bit until you have enough energy to hug someone");
            if (message.author == taggedUser) {
                message.channel.send('You hugged yourself, it doesn\'t feel the same as someone else hugging you ;-;');
            }
            else {
                message.channel.send(`<@${message.author.id}> gave a hug to <@${taggedUser.id}>`);
            }
            this.cooldownService.addCooldown(message.member, this.commandOptions.commandName + "<functional", 1200);
        }
        else {
            message.channel.send("Specify a user to hug");
        }
    }
}
exports.HugCommand = HugCommand;
class HugCommandOptions extends AbstractCommandOptions_1.AbstractCommandOptions {
    constructor() {
        super();
        this.commandName = "hug";
        this.description = "Hugs a user UwU";
        this.usage = `${AbstractCommandOptions_1.AbstractCommandOptions.prefix}hug {user}`;
    }
}
