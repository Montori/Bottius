import * as Discord from 'discord.js';
import { CommandService } from './Service/CommandService';
import botConfig from "./botconfig.json";
import { MessageService } from './Service/MessageService';
import { UserService } from './Service/UserService';
import { ConnectionOptions, Connection, createConnection } from "typeorm";
import { User } from './Material/User';
import { Quest } from './Material/Quest';
import { Perk } from './Material/Perk';
import { PerkService } from './Service/PerkService';

const bot: Discord.Client = new Discord.Client({disableMentions: "everyone"});

//init all Services needing the bot here
CommandService.init(bot);
MessageService.init(bot);

const messageService: MessageService = MessageService.getInstance();
const dbService: UserService = UserService.getInstance();
const perkService: PerkService = PerkService.getInstance();

const connection = createConnection({
   type: "sqlite",
   database:"./db.db",
   entities: [User, Quest, Perk],
   synchronize: true
});

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