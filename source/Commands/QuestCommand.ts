import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed, DiscordAPIError } from "discord.js";
import { UserService } from "../Service/UserService";
import { Quest } from "../Material/Quest";
import { AbstractCommandHelpContent } from "../Material/AbstractCommandHelpContent";
import { QuestService } from "../Service/QuestService";
import { User } from "../Material/User";


export class QuestCommand extends AbstractCommand
{
    public helpEmbedContent: QuestCommandHelp = new QuestCommandHelp();

    public async run(bot: Client, message: Message, messageArray: string[]) 
    {
        let questService: QuestService = QuestService.getInstance();

        if(message.member.hasPermission("ADMINISTRATOR"))
        {
            let userService: UserService = UserService.getInstance();
    
                if(messageArray[0] == "add")
                {
                    messageArray = messageArray.slice(2);
    
                    if(message.mentions.members.first())
                    {
                        if(messageArray[0])
                        {
                            let assignee: User = await userService.getUser(message.mentions.members.first());
                            let assignor: User = await userService.getUser(message.member);
                             
                            let newQuest: Quest = new Quest(assignor, assignee, messageArray.join(" "));
                    
                            await newQuest.save();

                            let newQuestEmbed: MessageEmbed = new MessageEmbed()
                                .setAuthor("A new quest has been commisioned")
                                .setDescription(newQuest.description)
                                .addField(`Assignor`, bot.users.resolve(newQuest.assignor.discordID), true)
                                .addField("Assignee", bot.users.resolve(newQuest.assignee.discordID), true)
                                .setTimestamp(newQuest.createdAt)
                                .setFooter(`Quest ID: ${newQuest.id}`)
                                .setColor("#573F26");
    
                            message.channel.send(newQuestEmbed);
                        }
                        else
                        {
                            message.channel.send("Please add a description");
                        }
                    }
                    else
                    {
                        message.channel.send("Please specify an assignee");
                    }
                }
                else if(messageArray[0] == "list")
                {
                    let allQuests: Array<Quest> = await questService.getAllQuest();

                    let questEmbed: MessageEmbed = new MessageEmbed();
                    if(allQuests.length > 0)
                    {
                        questEmbed.setAuthor("Here are your quests master");
                        allQuests.forEach(quest => questEmbed.addField(`A quest for ${bot.users.resolve(quest.assignee.discordID).tag} `, quest.description));
                    }
                    else
                    {
                        questEmbed.setAuthor("The quest board contains no quests");
                    }

                    message.channel.send(questEmbed);
                }
                else if(messageArray[0] == "finish")
                {
                    if(!isNaN(Number(messageArray[1])))
                    {
                        let finishedQuest: Quest = await questService.getQuest(Number(messageArray[1]));

                        if(finishedQuest)
                        {
                            finishedQuest.remove();
                            message.channel.send(`Quest with ID ${finishedQuest.id} is done.`);
                        }else
                        {
                            message.channel.send("Specified Quest could not be found");
                        }
                    }else
                    {
                        message.channel.send("Please specify a valid ID");
                    }
                }
                else
                {
                    super.sendHelp(message);
                }
        }else
        {
            super.sendPermissionDenied(message);
        }
    }

}
class QuestCommandHelp extends AbstractCommandHelpContent
{
    public commandName: string;
    public description: string;
    public usage: string;
    
    constructor()
    {
        super();
        this.commandName = "quest";
        this.description = "adds, lists or finishes a Quest";
        this.usage = `${AbstractCommandHelpContent.prefix}quest add {@User} {description...}\n${AbstractCommandHelpContent.prefix}quest list\n${AbstractCommandHelpContent.prefix}quest finish {id}`;
    }
}