import {Client, MessageEmbed, TextChannel} from 'discord.js';
import { CommandService } from './Service/CommandService';
import botConfig from "./botconfig.json";
import { MessageService } from './Service/MessageService';
import { UserService } from './Service/UserService';
import { createConnection } from "typeorm";
import { PerkService } from './Service/PerkService';
import { PartitionService } from './Service/PartitionService';
import { DelayedTaskService } from './Service/DelayedTaskService';
import { VoiceChatExperienceService } from './Service/VoiceChatExperienceService';
import { TumbleWeedService } from './Service/TumbleWeedService';

const bot: Client = new Client({disableMentions: "everyone"});

//init all Services needing the bot here
MessageService.init(bot);
DelayedTaskService.init(bot);
VoiceChatExperienceService.init(bot);

const messageService: MessageService = MessageService.getInstance();
const userService: UserService = UserService.getInstance();
const perkService: PerkService = PerkService.getInstance();
const partitionService: PartitionService = PartitionService.getInstance();
const delayedTaskService: DelayedTaskService = DelayedTaskService.getInstance();
const tumbleWeedService: TumbleWeedService = TumbleWeedService.getInstance();

const connection = createConnection();

connection.then(async connection => 
   {
      await connection.query('PRAGMA foreign_keys=OFF');
      await connection.runMigrations();
      await connection.query('PRAGMA foreign_keys=ON');
   });

bot.on("ready", async () =>
{
   await delayedTaskService.handleDueDelayedTasks()
   setInterval(() => delayedTaskService.handleDueDelayedTasks(), 600000);
   setInterval(() => tumbleWeedService.handleTumbleWeed(bot), 600000);
   console.log("INFO: All services loaded. Bot is ready.")
   
   //Reimplement activity set. It isnt working rn anyways so I just kicked it out.
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

bot.on("guildMemberRemove", async member => 
{
   let partition = await partitionService.getPartition(member.guild);
   if(partition.leaveMessageActive && partition.leaveChannel) 
   {
      let channel: TextChannel = member.guild.channels.resolve(partition.leaveChannel) as TextChannel;
      if(channel) channel.send(new MessageEmbed().setColor("ff0000").setDescription(`**${member.displayName}** ${partition.leaveMessage ? partition.leaveMessage : " has left the server."}`))
   }
});


bot.login(botConfig.token);
