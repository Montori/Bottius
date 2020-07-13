import * as Discord from 'discord.js';
import {Client, Message, MessageEmbed, TextChannel, GuildChannel, Role} from 'discord.js';
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
import { VoiceChatExperienceService } from './Service/VoiceChatExperienceService';
import { AutoRole } from './Material/AutoRole';
import { AutoRoleService } from './Service/AutoRoleService';

const bot: Discord.Client = new Discord.Client({disableMentions: "everyone"});

//init all Services needing the bot here
CommandService.init(bot);
MessageService.init(bot);
DelayedTaskService.init(bot);
VoiceChatExperienceService.init(bot);

const messageService: MessageService = MessageService.getInstance();
const userService: UserService = UserService.getInstance();
const perkService: PerkService = PerkService.getInstance();
const partitionService: PartitionService = PartitionService.getInstance();
const delayedTaskService: DelayedTaskService = DelayedTaskService.getInstance();
const voiceChatService: VoiceChatExperienceService = VoiceChatExperienceService.getInstance()
const autoRoleService: AutoRoleService = AutoRoleService.getInstance()

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
   setInterval(() => voiceChatService.distributeVoiceExperience(), 60000);
   console.log("INFO: All services loaded. Bot is ready.")
   
   switch(botConfig.activityStatus)
   {
      case "streaming":
         bot.user.setActivity(botConfig.activity, { type: "STREAMING", url: "https://www.twitch.tv/smexy-briccs" })
         break;
      case "playing":
         bot.user.setActivity(botConfig.activity, { type: "PLAYING" })
         break;
      case "watching":
         bot.user.setActivity(botConfig.activity, { type: "WATCHING" })
         break;
      case "listening":
         bot.user.setActivity(botConfig.activity, { type: "LISTENING" })
         break;
      case "none":
         bot.user.setActivity(botConfig.activity)
   }  
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

bot.on("voiceStateUpdate", (oldState, newState) => {
   voiceChatService.handleVoiceStateEvent(oldState, newState);
});

bot.on("guildMemberAdd", async member => 
{
   let autoRoleArray: Array<AutoRole> = await autoRoleService.getAllAutoRoles(member.guild);

   for(let something of autoRoleArray)
   {
      let role: Role = await member.guild.roles.fetch(something.role);
      if(role)
      if(!member.roles.cache.has(role.id)) 
      member.roles.add(role);
   }

});

bot.on("guildMemberRemove", async member => 
{
   let partition = await partitionService.getPartition(member.guild);
   if(partition.leaveMessageActive) 
   {
      if(partition.leaveChannel) 
      {
         let channel: TextChannel = member.guild.channels.resolve(partition.leaveChannel) as TextChannel;
         if(channel)
         {
            channel.send(new MessageEmbed().setColor("ff0000").setDescription(`**${member.displayName}** ${partition.leaveMessage ? partition.leaveMessage : " has left the server."}`))
         }
      }   
   }
});


bot.login(botConfig.token);
