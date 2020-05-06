import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, MessageEmbed, GuildMember, Guild, Role } from "discord.js";
import { UserService } from "../Service/UserService";
import { User } from "../Material/User";
import { PermissionLevel } from "../Material/PermissionLevel";
import { stringify } from "querystring";
import { Brackets, MongoClient } from "typeorm";
import { ServerData } from "../Material/ServerData";
import { ServerDataService } from "../Service/ServerDataService";
import { HelperFunctions } from "../Material/HelperFunctions";

export class BirthdayCommand extends AbstractCommand {
	public commandOptions: BirthdayCommandHelp = new BirthdayCommandHelp();
	public userService: UserService = UserService.getInstance();
	public serverDataService: ServerDataService = ServerDataService.getInstance();

	// Verifies that this is a valid date
	public static validateBirthday(date: number, month: number): boolean {
		let daysInMonths = [0, // So the array can be 1-indexed
			31, 29, 31, 30,
			31, 30, 31, 31,
			30, 31, 30, 31
		];
		if (month > 0 && month < 13 && date > 0 && date <= daysInMonths[month]) {
			return true
		} else {
			return false;
		}
	}

	public async runInternal(bot: Client, message: Message, messageArray: string[]) {
		let user: User = await this.userService.getUser(message.member);
		let server: ServerData = await this.serverDataService.getServerData(message.guild);
		let id: string = message.author.id;

		let numberSuffix = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]; // 1st, 2nd, 3rd etc.
		let monthNames = ["December", "January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November"];
		if (messageArray[0]) {
			switch (messageArray[0]) {
				case "set":
					if (messageArray.length == 4) { // Setting a birthday by ID/tag
						let taggedID: string = HelperFunctions.getID(messageArray[1]);
						let month = parseInt(messageArray[3]);
						let date = parseInt(messageArray[2]);
						if (taggedID != user.discordID) { // Setting somebody else's birthday
							if (user.permissionLevel >= PermissionLevel.moderator) {
								if (HelperFunctions.verifyUserID(message.guild, taggedID)) { // A staff member setting somebody else's birthday
									if (BirthdayCommand.validateBirthday(date, month)) {
										let taggedUser: User = await this.userService.getUserWithID(taggedID);
										if (!taggedUser.birthday) taggedUser.birthday = new Date();
										taggedUser.birthday.setMonth(month);
										taggedUser.birthday.setDate(date);
										taggedUser.save();

										message.channel.send(`<@!${taggedID}>'s birthday has been set.`);
									} else {
										message.channel.send("Please provide a valid date.");
									}
								} else { // A staff member attempting to set somebody else's birthday
									message.channel.send("Please provide a valid member.");
								}
							} else { // Regular member attempting to set somebody else's birthday
								message.channel.send("You must be a staff member to set another member's birthday!");
							}
						} else { // Setting own birthday (By ID/tag)
							if (BirthdayCommand.validateBirthday(date, month)) {
								if (!user.birthday) user.birthday = new Date();
								user.birthday.setMonth(month);
								user.birthday.setDate(date);
								user.save();

								message.channel.send(`Your birthday has been set. (PS. you can set your birthday with \`${AbstractCommandOptions.prefix}birthday set {DD} {MM}\`)`);
							} else {
								message.channel.send("Please provide a valid date.");
							}
						}
					} else if (messageArray.length == 3) { // Setting own birthday
						let month = parseInt(messageArray[2]);
						let date = parseInt(messageArray[1]);
						if (BirthdayCommand.validateBirthday(date, month)) {
							if (!user.birthday) user.birthday = new Date();
							user.birthday.setMonth(month);
							user.birthday.setDate(date);
							user.save();

							message.channel.send("Your birthday has been set.");
						} else {
							message.channel.send("Please provide a valid date.");
						}
					} else { // Failing at setting birthday
						message.channel.send(`Please provide a complete date. (\`${AbstractCommandOptions.prefix}birthday set {DD} {MM}\`)`);
					}
					break;

				case "clear":
					if (messageArray.length == 2) { // Clearing a birthday by ID/tag
						let taggedID: string = HelperFunctions.getID(messageArray[1]);
						if (taggedID != user.discordID) { // Clearing somebody else's birthday
							if (user.permissionLevel >= PermissionLevel.moderator) {
								if (HelperFunctions.verifyUserID(message.guild, taggedID)) { // A staff member clearing somebody else's birthday
									let taggedUser: User = await this.userService.getUserWithID(taggedID);
									if (taggedUser.birthday) {
										delete taggedUser.birthday;
										taggedUser.birthday = null;
										taggedUser.save();

										message.channel.send(`<@!${taggedID}>'s birthday has been cleared.`);
									} else {
										message.channel.send(`<@!${taggedID}>'s birthday is already cleared.`);
									}
								} else { // A staff member attempting to clear somebody else's birthday
									message.channel.send("Please provide a valid member.");
								}
							} else { // Regular member attempting to clear somebody else's birthday
								message.channel.send("You must be a staff member to clear another member's birthday!");
							}
						} else { // Clearing own birthday (By ID/tag)
							if (user.birthday) {
								delete user.birthday;
								user.birthday = null;
								user.save();

								message.channel.send(`Your birthday has been cleared. (PS. you can clear your birthday with \`${AbstractCommandOptions.prefix}birthday clear\`)`);
							} else {
								message.channel.send("Your birthday is already cleared.");
							}
						}
					} else { // Clearing own birthday
						if (user.birthday) {
							delete user.birthday;
							user.birthday = null;
							user.save();

							message.channel.send("Your birthday has been cleared.");
						} else {
							message.channel.send("Your birthday is already cleared.");
						}
					}
					break;

				case "role":
					if (messageArray[1]) {
						switch (messageArray[1]) {
							case "set":
								if (user.permissionLevel >= PermissionLevel.moderator) {
									if (messageArray[2]) {
										let roleID = HelperFunctions.getID(messageArray[2])
										if (HelperFunctions.verifyRoleID(message.guild, roleID)) {
											server.birthdayRoleID = roleID;
											server.save();

											message.channel.send("The birthday role has been set.");
										} else {
											message.channel.send("Please provide a valid role.");
										}
									} else {
										message.channel.send("Please provide a role to set.");
									}
								} else {
									message.channel.send("You must be a staff member to set the birthday role!");
								}
								break;

							case "remove":
								if (user.permissionLevel >= PermissionLevel.moderator) {
									if (server.birthdayRoleID) {
										//delete server.birthdayRoleID;
										server.birthdayRoleID = "";
										server.save();

										message.channel.send("The birthday role has been removed.");
									} else {
										message.channel.send("The birthday role is already cleared.");
									}
								} else {
									message.channel.send("You must be a staff member to remove the birthday role!");
								}
								break

							default:
								message.channel.send("This subcommand is unkown.");
								break;
						}
					} else {
						if (server.birthdayRoleID) {
							message.channel.send(`This server's role is currently assigned to '${(await message.guild.roles.fetch(server.birthdayRoleID)).name}' (ID ${server.birthdayRoleID}).`);
						} else {
							message.channel.send("There is currently no assigned role for this server.");
						}
					}
					break;

				case "channel":
					if (messageArray[1]) {
						switch (messageArray[1]) {
							case "set":
								if (user.permissionLevel >= PermissionLevel.moderator) {
									if (messageArray[2]) {
										let channelID = HelperFunctions.getID(messageArray[2])
										if (HelperFunctions.verifyChannelID(message.guild, channelID) && message.guild.channels.cache.get(channelID).type == "text") {
											server.birthdayChannelID = channelID;
											server.save();

											message.channel.send("The birthday channel has been set.");
										} else {
											message.channel.send("Please provide a valid channel.");
										}
									} else {
										message.channel.send("Please provide a channel to set.");
									}
								} else {
									message.channel.send("You must be a staff member to set the birthday channel!");
								}
								break;

							case "remove":
								if (user.permissionLevel >= PermissionLevel.moderator) {
									if (server.birthdayChannelID) {
										server.birthdayChannelID = "";
										server.save();

										message.channel.send("The birthday channel has been removed.");
									} else {
										message.channel.send("The birthday channel is already cleared.");
									}
								} else {
									message.channel.send("You must be a staff member to remove the birthday role!");
								}
								break

							default:
								message.channel.send("This subcommand is unkown.");
								break;
						}
					} else {
						if (server.birthdayChannelID) {
							message.channel.send(`This server's channel is currently assigned to '${(await message.guild.channels.cache.get(server.birthdayChannelID)).name}' (ID ${server.birthdayChannelID}).`);
						} else {
							message.channel.send("There is currently no assigned channel for this server.");
						}
					}
					break;

				default:
					let taggedID: string = HelperFunctions.getID(messageArray[0]);
					if (HelperFunctions.verifyUserID(message.guild, taggedID)) { // Getting the birthday of somebody else
						let taggedUser: User = await this.userService.getUserWithID(taggedID);
						if (taggedUser) { // Valid member
							if (taggedID == id) { //  Looking at own birthday (By ID/tag)
								if (user.birthday) {
									message.channel.send(`Your birthday is on the ${user.birthday.getDate()}${numberSuffix[user.birthday.getDate() % 10]} of ${monthNames[user.birthday.getMonth()]}. (PS. you can see your birthday with \`${AbstractCommandOptions.prefix}birthday\`)`);
								} else {
									message.channel.send("Please set your birthdate before using this command.");
								}
							} else { // Looking at somebody else's birthday
								if (taggedUser.birthday) {
									message.channel.send(`<@!${taggedID}>'s birthday is on the ${taggedUser.birthday.getDate()}${numberSuffix[taggedUser.birthday.getDate() % 10]} of ${monthNames[taggedUser.birthday.getMonth()]}.`);
								} else {
									message.channel.send(`<@!${taggedID}>'s birthday is unknown.`);
								}
							}
						} else { // Invalid member
							message.channel.send("Please provide a valid member.");
						}
					} else { // User has put something weird in the command
						message.channel.send("This subcommand is unkown.");
					}
					break;
			}
		} else {
			let user: User = await this.userService.getUser(message.member);
			if (user.birthday!) {
				message.channel.send(`Your birthday is on the ${user.birthday.getDate()}${numberSuffix[user.birthday.getDate() % 10]} of ${monthNames[user.birthday.getMonth()]}.`);
			} else {
				message.channel.send("Please set your birthdate before using this command.");
			}
		}
	}

}

class BirthdayCommandHelp extends AbstractCommandOptions {
	public commandName: string;
	public description: string;
	public usage: string;
	public cooldown: number;

	constructor() {
		super();
		this.commandName = "birthday";
		this.description = "For birthday stuff";
		this.usage =
			`${AbstractCommandOptions.prefix}birthday\n` +
			`${AbstractCommandOptions.prefix}birthday {user}\n` +
			`${AbstractCommandOptions.prefix}birthday clear\n` +
			`${AbstractCommandOptions.prefix}birthday clear {user}\n` +
			`${AbstractCommandOptions.prefix}birthday set {DD} {MM}\n` +
			`${AbstractCommandOptions.prefix}birthday set {user} {DD} {MM}\n` +
			`${AbstractCommandOptions.prefix}birthday role set {role}\n` +
			`${AbstractCommandOptions.prefix}birthday role remove\n` +
			`${AbstractCommandOptions.prefix}birthday channel set {channel}\n` +
			`${AbstractCommandOptions.prefix}birthday channel remove`;
	}
}