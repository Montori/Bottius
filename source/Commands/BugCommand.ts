import { AbstractCommand } from "./AbstractCommand";
import { Client, Message, MessageEmbed } from "discord.js";
import { AbstractCommandOptions } from "../Entities/Transient/AbstractCommandOptions";
import { BugService } from "../Service/BugService";
import { Bug } from "../Entities/Persistent/Bug";
import { PermissionLevel } from "../Entities/Transient/PermissionLevel";

export class BugCommand extends AbstractCommand
{
    public commandOptions: BugCommandOptions = new BugCommandOptions();
    private bugService: BugService = BugService.getInstance();

    public async runInternal(bot: Client, message: Message, messageArray: Array<string>)
    {
        if(messageArray[0] == "report")
        {
            if(!messageArray[0]) return message.channel.send(super.getFailedEmbed().setDescription("Please provide a description for the bug."));

            messageArray = messageArray.slice(1);
            let newBug: Bug = await this.bugService.addBug(message.member, messageArray.join(" "));
            
            await newBug.save();
    
            let BugEmbed: MessageEmbed = new MessageEmbed()
                .setAuthor("Your bug has been reported")
                .setDescription(newBug.description)
                .setFooter(`Bug ID: ${newBug.id}`)
                .setColor("#573F26")
                .addField("User", message.member)
    
            message.channel.send(BugEmbed);
        }
        else if((await this.userService.getUser(message.member, message.guild)).permissionLevel < PermissionLevel.master) return super.sendPermissionDenied(message, PermissionLevel.master)
        else
        {
            if(messageArray[0] == "remove")
            {
                if(isNaN(Number(messageArray[1]))) return message.channel.send(super.getFailedEmbed().setAuthor("Please specify a valid ID"));
                let removeBug: Bug = await this.bugService.getBug(Number(messageArray[1]));

                if(!removeBug) return message.channel.send(super.getFailedEmbed().setAuthor("Specified Bug could not be found"));
                if(removeBug)
                {
                    removeBug.remove();
                    message.channel.send(super.getSuccessEmbed().setDescription(`Bug with ID: ${removeBug.id} has been removed.`));
                }
            } 
            else if(messageArray[0] == "list")
            {
                let allBugs: Array<Bug> = await this.bugService.getAllBugs(message.guild);

                let BugEmbed: MessageEmbed = new MessageEmbed()
                .setAuthor("Here are your Bugs");
                if(allBugs.length > 0)
                {
                    allBugs.forEach(Bug => BugEmbed.addField(`Bug reported by **${bot.users.resolve(Bug.assignor.discordID).tag}** ID: **${Bug.id}**`, Bug.description));
                }
                else
                {
                    BugEmbed.setAuthor("The Bug board contains no Bugs");
                }
    
                message.channel.send(BugEmbed);
            }
        }

    }
}

class BugCommandOptions extends AbstractCommandOptions
{
    constructor()
    {
        super();
        this.commandName = "Bug";
        this.description = "reports a bug to the developers!";
        this.usage = `${AbstractCommandOptions.prefix}bug report {description...},\n${AbstractCommandOptions.prefix}bug remove {ID},\n${AbstractCommandOptions.prefix}bug list`;
    }

}
