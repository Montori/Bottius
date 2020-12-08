import {Client, MessageEmbed, TextChannel, Role} from 'discord.js';
import botConfig from "./botconfig.json";
import { MessageService } from './service/MessageService';
import { UserService } from './service/UserService';
import { createConnection } from "typeorm";
import { PerkService } from './service/PerkService';
import { PartitionService } from './service/PartitionService';
import { DelayedTaskService } from './service/DelayedTaskService';
import { TumbleWeedService } from './service/TumbleWeedService';
import { AutoRole } from './entities/persistent/AutoRole';

const bot: Client = new Client({disableMentions: "everyone"});

//init all Services needing the bot here
MessageService.init(bot);
DelayedTaskService.init(bot);

const messageService: MessageService = MessageService.getInstance();
const userService: UserService = UserService.getInstance();
const perkService: PerkService = PerkService.getInstance();
const partitionService: PartitionService = PartitionService.getInstance();
const delayedTaskService: DelayedTaskService = DelayedTaskService.getInstance();
const tumbleWeedService: TumbleWeedService = TumbleWeedService.getInstance();

const connection = createConnection();

connection.then(async connection => 
   {
      await connection.runMigrations();
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

bot.on("guildMemberAdd", async member => {
   let partition = await partitionService.getPartition(member.guild);
   let autoRoleList: Array<Role> = (await (AutoRole.find({where: {partition: partition}}))).map(autoRole => member.guild.roles.resolve(autoRole.roleID));

   autoRoleList.forEach(role => {
      if(role) member.roles.add(role);
   });
});


bot.login(botConfig.token);
