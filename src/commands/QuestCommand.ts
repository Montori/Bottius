import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed, GuildMember } from "discord.js";
import { Quest } from "../entities/persistent/Quest";
import { AbstractCommandOptions } from "../entities/transient/AbstractCommandOptions";
import { QuestService } from "../service/QuestService";
import { PermissionLevel } from "../entities/transient/PermissionLevel";
import { PartitionService } from "../service/PartitionService";
import { User } from "../entities/persistent/User";


export class QuestCommand extends AbstractCommand
{
    public commandOptions: QuestCommandOptions = new QuestCommandOptions();

    private questService: QuestService = QuestService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: string[]) 
    {
        if(messageArray[0] == "add")
        {
            messageArray = messageArray.slice(2);
            let discordAssignees = message.mentions.members.array();

            if(!discordAssignees[0]) return message.channel.send(super.getFailedEmbed().setDescription("Please provide at least one assignee for this quest"));

            messageArray = messageArray.slice(discordAssignees.length-1);

            if(!messageArray[0]) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a description for this quest."));

            let partition = await this.partitionService.getPartition(message.guild);
            let newQuest: Quest = await this.questService.addQuest(message.member, discordAssignees, messageArray.join(" "));
            
            await newQuest.save();
    
            let questEmbed: MessageEmbed = new MessageEmbed()
                .setAuthor("A new quest has been commissioned")
                .setDescription(newQuest.description)
                .setFooter(`Quest ID: ${newQuest.id}`)
                .setColor("#573F26")
                .addField("Assignor", message.member)
                .addField("Assignees", discordAssignees.join("\n") + " ");
    
            message.channel.send(questEmbed);
        }
        else if(messageArray[0] == "list")
        {
            let allQuests: Array<Quest> = await this.questService.getAllQuest(message.guild);
            let targetMember: GuildMember = message.mentions.members.first();
            let targetUser: User; 

            if(targetMember) targetUser = await this.userService.getUser(targetMember, message.guild);

            if(targetUser) allQuests = allQuests.filter(quest => quest.assignees.some(assignee => assignee.discordID == targetUser.discordID));

            let questEmbed: MessageEmbed = new MessageEmbed();
            if(allQuests.length > 0)
            {
                questEmbed.setAuthor(`Quests ${targetUser ? "for " + targetMember.user.tag : "of " + message.guild.name}`);
                allQuests.forEach(quest => questEmbed.addField(`A quest for ${bot.users.resolve(quest.assignees[0].discordID).tag} ID: ${quest.id}`, quest.description));
            }
            else
            {
                questEmbed.setAuthor("The quest board contains no quests");
            }

            message.channel.send(questEmbed);
        }
        else if(messageArray[0] == "finish")
        {
            if(isNaN(Number(messageArray[1]))) return message.channel.send("Please specify a valid ID");
                let finishedQuest: Quest = await this.questService.getQuest(Number(messageArray[1]), message.guild);

                if(!finishedQuest) return message.channel.send("Specified Quest could not be found");
                if(finishedQuest.assignees.some(assignee => assignee.discordID == message.member.id) || message.member.hasPermission("ADMINISTRATOR"))
                {
                    finishedQuest.remove();
                    message.channel.send(super.getSuccessEmbed().setDescription(`Quest with ID ${finishedQuest.id} is done.`));
                }
                else
                {
                    message.channel.send(super.getSuccessEmbed().setDescription("Thats not your quest."));
                }
        }
        else
        {
            super.sendHelp(message);
        }
    }

}
class QuestCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "quest";
        this.description = "adds, lists or finishes a Quest";
        this.usage = `${AbstractCommandOptions.prefix}quest add {@User} {description...}\n${AbstractCommandOptions.prefix}quest list\n${AbstractCommandOptions.prefix}quest finish {id}`;
        this.cooldown = 5;
        this.reqPermission = PermissionLevel.moderator;
    }
}