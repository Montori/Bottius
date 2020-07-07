
import * as Discord from 'discord.js';
import {Client, Message, MessageEmbed, TextChannel, GuildChannel} from 'discord.js';
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
});

bot.on("message", async message =>
{
   messageService.handleMessage(message);

   let partition = await partitionService.getPartition(message.guild);

   if(partition.botActivityStatus == "streaming")  { bot.user.setActivity(partition.botActivityMessage, { type: "STREAMING", url: "https://www.twitch.tv/smexy-briccs" }) }
   else if(partition.botActivityStatus == "playing")  { bot.user.setActivity(partition.botActivityMessage, { type: "PLAYING" }) }
   else if(partition.botActivityStatus == "watching")  { bot.user.setActivity(partition.botActivityMessage, { type: "WATCHING" }) }
   else if(partition.botActivityStatus == "listening")  { bot.user.setActivity(partition.botActivityMessage, { type: "LISTENING" }) }
   else if(partition.botActivityStatus == "none")  { bot.user.setActivity(partition.botActivityMessage) }
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

bot.on("guildMemberRemove", async member => 
{
   let partition = await partitionService.getPartition(member.guild);
   if(partition.leaveMessageActive === true) 
   {
      if(partition.leaveChannel) 
      {
         let channel: TextChannel = member.guild.channels.resolve(partition.leaveChannel) as TextChannel;
         channel.send(new MessageEmbed().setColor("ff0000").setDescription(`**${member.displayName}** ${partition.leaveMessage}`))
      }   
   }
});


bot.login(botConfig.token);