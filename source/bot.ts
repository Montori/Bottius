import * as Discord from 'discord.js';
import { CommandService } from './Service/CommandService';
import botConfig from "./botconfig.json";
import { MessageService } from './Service/MessageService';
import { UserService } from './Service/UserService';
import { createConnection } from "typeorm";
import { PerkService } from './Service/PerkService';
import { BirthdayService } from './Service/BirthdayService';

const bot: Discord.Client = new Discord.Client({disableMentions: "everyone"});

//init all Services needing the bot here
CommandService.init(bot);
MessageService.init(bot);

const messageService: MessageService = MessageService.getInstance();
const dbService: UserService = UserService.getInstance();
const perkService: PerkService = PerkService.getInstance();
const birthdayService: BirthdayService = BirthdayService.getInstance();

const connection = createConnection();

let d = new Date();
d.setDate(d.getDate() + 1);
d.setUTCHours(0);
d.setUTCMinutes(0);
d.setUTCSeconds(0);
d.setUTCMilliseconds(0);

bot.setTimeout(() => {

},d.getUTCMilliseconds() - new Date().getUTCMilliseconds());

connection.then(connection => connection.runMigrations());

bot.on("ready", async () =>
{
   await bot.user.setActivity("Running in testing mode");

   console.log("INFO: All services loaded. Bot is ready.")
});

bot.on("message", async message =>
{
   messageService.handleMessage(message);
});

bot.on("roleDelete", async role => 
{
   perkService.removePerk(role.id);
});

bot.login(botConfig.token);