import * as Discord from 'discord.js';
import { CommandService } from './Service/CommandService';
import botConfig from "./botconfig.json";
import { MessageService } from './Service/MessageService';
import { UserService } from './Service/UserService';
import { createConnection } from "typeorm";
import { PerkService } from './Service/PerkService';
import { PartitionService } from './Service/PartitionService';
import { DelayedTaskService } from './Service/DelayedTaskService';
import { DelayedTask } from './Material/DelayedTask';
import { DelayedTaskType } from './Material/DelayedTaskType';

const bot: Discord.Client = new Discord.Client({disableMentions: "everyone"});

//init all Services needing the bot here
CommandService.init(bot);
MessageService.init(bot);
DelayedTaskService.init(bot);

const messageService: MessageService = MessageService.getInstance();
const userService: UserService = UserService.getInstance();
const perkService: PerkService = PerkService.getInstance();
const partitionService: PartitionService = PartitionService.getInstance();
const delayedTaskService: DelayedTaskService = DelayedTaskService.getInstance();

const connection = createConnection();

connection.then(async connection => 
   {
      await connection.query('PRAGMA foreign_keys=OFF');
      await connection.runMigrations();
      await connection.query('PRAGMA foreign_keys=ON');
   });

bot.on("ready", async () =>
{
   await bot.user.setActivity("Running in testing mode");

   await delayedTaskService.handleDueDelayedTasks()
   setInterval(() => delayedTaskService.handleDueDelayedTasks(), 600000);
   console.log("INFO: All services loaded. Bot is ready.")
});

bot.on("message", async message =>
{
   messageService.handleMessage(message);
});

bot.on("roleDelete", async role => 
{
   perkService.removePerk(role.id, role.guild);
});

bot.on("guildCreate", async guild => 
{
   userService.getUser(guild.owner, guild);
});

bot.on("guildDelete", async guild => 
{
   partitionService.deletePartition(guild);
});

bot.login(botConfig.token);