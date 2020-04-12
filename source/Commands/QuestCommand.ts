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
                    let discordAssignees = message.mentions.members.array();
                    if(discordAssignees[0])
                    {
                        let assignees: Array<User> = new Array<User>();
                        let assignor: User = await userService.getUser(message.member);

                        for(const member of discordAssignees)
                        {
                            assignees.push(await userService.getUser(member));
                        }
                        
                        messageArray = messageArray.slice(assignees.length-1);

                        if(messageArray[0])
                        {
                            let newQuest: Quest = new Quest(assignor, assignees, messageArray.join(" "));
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
                        else
                        {
                            message.channel.send("Please provide a description for your quest");
                        }
                    }
                    else
                    {
                        message.channel.send("Please provide an assignee for this quest")
                    }
                }
                else if(messageArray[0] == "list")
                {
                    let allQuests: Array<Quest> = await questService.getAllQuest();

                    let questEmbed: MessageEmbed = new MessageEmbed();
                    if(allQuests.length > 0)
                    {
                        questEmbed.setAuthor("Here are your quests master");
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
                    if(!isNaN(Number(messageArray[1])))
                    {
                        let finishedQuest: Quest = await questService.getQuest(Number(messageArray[1]));

                        if(finishedQuest)
                        {
                            if(finishedQuest.assignees.some(assignee => assignee.discordID == message.member.id) || message.member.hasPermission("ADMINISTRATOR"))
                            {
                                finishedQuest.remove();
                                message.channel.send(`Quest with ID ${finishedQuest.id} is done.`);
                            }
                            else
                            {
                                message.channel.send("Thats not your quest.");
                            }
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