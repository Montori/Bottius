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
		return month > 0 && month < 13 && date > 0 && date <= daysInMonths[month];
	}

	public static setBirthday(user: User, date: number, month: number) {
		if (!user.birthday) user.birthday = new Date();
		user.birthday.setMonth(month);
		user.birthday.setDate(date);
		user.save();
	}

	public static removeBirthday(user: User) {
		delete user.birthday;
		user.birthday = null;
		user.save();
	}

	public async runInternal(bot: Client, message: Message, messageArray: string[]) {
		let user: User = await this.userService.getUser(message.member);
		let server: ServerData = await this.serverDataService.getServerData(message.guild);
		let id: string = message.author.id;

		let numberSuffix = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"]; // 1st, 2nd, 3rd etc.
		let monthNames = ["December", "January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November"];

		switch (messageArray.length) {

			case 4:
				switch (messageArray[0]) {
					case "set":
						let taggedID: string = HelperFunctions.getID(messageArray[1]);
						let date = parseInt(messageArray[2]);
						let month = parseInt(messageArray[3]);

						// Setting own birthday (By ID/tag)
						if (taggedID == user.discordID) {

							// Invalid birthday
							if (!BirthdayCommand.validateBirthday(date, month))
								return message.channel.send("Please provide a valid date.");

							BirthdayCommand.setBirthday(user, date, month);
							return message.channel.send(`Your birthday has been set. (PS. you can set your birthday with \`${AbstractCommandOptions.prefix}birthday set {DD} {MM}\`)`);
						}

						// Regular member attempting to set somebody else's birthday
						if (user.permissionLevel < PermissionLevel.moderator)
							return message.channel.send("You must be a staff member to set another member's birthday!");

						// A staff member attempting to set somebody else's birthday
						if (!HelperFunctions.verifyUserID(message.guild, taggedID))
							return message.channel.send("Please provide a valid member.");

						// Invalid birthday
						if (!BirthdayCommand.validateBirthday(date, month))
							return message.channel.send("Please provide a valid date.");

						let taggedUser: User = await this.userService.getUserWithID(taggedID);

						BirthdayCommand.setBirthday(taggedUser, date, month);
						return message.channel.send(`<@!${taggedID}>'s birthday has been set.`);

					default:
						return message.channel.send(`This subcommand is unkown.`);
				}

			case 3:
				switch (messageArray[0]) {
					// !!birthday set {DD} {MM}
					case "set":
						let date = parseInt(messageArray[1]);
						let month = parseInt(messageArray[2]);

						if (!BirthdayCommand.validateBirthday(date, month))
							return message.channel.send("Please provide a valid date.");

						BirthdayCommand.setBirthday(user, date, month)
						return message.channel.send("Your birthday has been set.");

					// !!birthday role set {role}
					case "role":
						if (messageArray[1] != "set") break;

						// Not a staff member
						if (user.permissionLevel < PermissionLevel.moderator)
							return message.channel.send("You must be a staff member to set the birthday role!");

						let roleID = HelperFunctions.getID(messageArray[2])

						// Invalid role
						if (!HelperFunctions.verifyRoleID(message.guild, roleID))
							return message.channel.send("Please provide a valid role.");

						server.birthdayRoleID = roleID;
						server.save();
						return message.channel.send("The birthday role has been set.");

					// !!birthday channel set {channel}
					case "channel":
						if (messageArray[1] != "set") break;

						// Regular user being naughty
						if (user.permissionLevel < PermissionLevel.moderator)
							return message.channel.send("You must be a staff member to set the birthday channel!");

						let channelID = HelperFunctions.getID(messageArray[2])

						// Invalid channel
						if (!HelperFunctions.verifyChannelID(message.guild, channelID) && message.guild.channels.cache.get(channelID).type == "text")
							return message.channel.send("Please provide a valid channel.");

						server.birthdayChannelID = channelID;
						server.save();
						return message.channel.send("The birthday channel has been set.");

					default:
						return message.channel.send(`This subcommand is unkown.`);
				}

			case 2:
				switch (messageArray[0]) {

					// !!birthday set {DD}
					case "set":
						return message.channel.send(`Please provide a complete date. (\`${AbstractCommandOptions.prefix}birthday set {DD} {MM}\`)`);

					// !!birthday clear {user}
					case "clear":
						let taggedID: string = HelperFunctions.getID(messageArray[1]);

						// Clearing own birthday (By ID/tag)
						if (taggedID == user.discordID) {

							// No data to clear
							if (!user.birthday)
								return message.channel.send("Your birthday is already cleared.");

							BirthdayCommand.removeBirthday(user);
							return message.channel.send(`Your birthday has been cleared. (PS. you can clear your birthday with \`${AbstractCommandOptions.prefix}birthday clear\`)`);
						}

						// A regular user attempting to clear somebody elses's birthday
						if (user.permissionLevel < PermissionLevel.moderator)
							return message.channel.send("You must be a staff member to clear another member's birthday!");

						// A staff member attempting to clear somebody else's birthday
						if (!HelperFunctions.verifyUserID(message.guild, taggedID))
							return message.channel.send("Please provide a valid member.");

						let taggedUser: User = await this.userService.getUserWithID(taggedID);

						// No data to clear
						if (!taggedUser.birthday)
							return message.channel.send(`<@!${taggedID}>'s birthday is already cleared.`)

						// Success!
						BirthdayCommand.removeBirthday(taggedUser);
						return message.channel.send(`<@!${taggedID}>'s birthday has been cleared.`);

					case "role":
						switch (messageArray[1]) {

							// !!birthday role set
							case "set":
								// Regular user being naughty
								if (user.permissionLevel < PermissionLevel.moderator)
									return message.channel.send("You must be a staff member to set the birthday role!");

								// No role provided
								return message.channel.send("Please provide a role to set.");

							// !!birthday role remove
							case "remove":
								// Regular user being naughty
								if (user.permissionLevel < PermissionLevel.moderator)
									return message.channel.send("You must be a staff member to remove the birthday role!");

								// No role to remove
								if (!server.birthdayRoleID)
									return message.channel.send("The birthday role is already cleared.");

								//delete server.birthdayRoleID;
								server.birthdayRoleID = "";
								server.save();
								return message.channel.send("The birthday role has been removed.");

							default:
								return message.channel.send(`This subcommand is unkown.`);
						}

					case "channel":
						switch (messageArray[1]) {

							// !!birthday channel set
							case "set":
								// Regular user being naughty
								if (user.permissionLevel < PermissionLevel.moderator)
									return message.channel.send("You must be a staff member to set the birthday channel!");

								return message.channel.send("Please provide a channel to set.");

							// !!birthday channel remove
							case "remove":
								if (user.permissionLevel < PermissionLevel.moderator)
									return message.channel.send("You must be a staff member to remove the birthday role!");

								if (!server.birthdayChannelID)
									return message.channel.send("The birthday channel is already cleared.")

								server.birthdayChannelID = "";
								server.save();

								return message.channel.send("The birthday channel has been removed.");

							default:
								return message.channel.send("This subcommand is unkown.");
						}

					default:
						return message.channel.send(`This subcommand is unkown.`);
				}

			case 1:
				switch (messageArray[0]) {
					// !!birthday set
					case "set":
						return message.channel.send(`Please provide a date. (\`${AbstractCommandOptions.prefix}birthday set {DD} {MM}\`)`);

					// !!birthday clear
					case "clear":
						// No data to clear
						if (!user.birthday)
							return message.channel.send("Your birthday is already cleared.");

						BirthdayCommand.removeBirthday(user);
						return message.channel.send("Your birthday has been cleared.");

					// !!birthday role
					case "role":
						// No role to see
						if (!server.birthdayRoleID)
							return message.channel.send("There is currently no assigned role for this server.");

						// Shows the current role
						return message.channel.send(`This server's role is currently assigned to '${(await message.guild.roles.fetch(server.birthdayRoleID)).name}' (ID ${server.birthdayRoleID}).`);

					// !!birthday channel
					case "channel":
						// No channel to see
						if (!server.birthdayChannelID)
							return message.channel.send("You must be a staff member to remove the birthday role!");

						// Shows the current channel
						return message.channel.send(`This server's channel is currently assigned to '${(await message.guild.channels.cache.get(server.birthdayChannelID)).name}' (ID ${server.birthdayChannelID}).`);

					// !!birthday {user}
					default:
						let taggedID: string = HelperFunctions.getID(messageArray[0]);
						if (!HelperFunctions.verifyUserID(message.guild, taggedID))
							return message.channel.send("Please provide a valid member.");

						if (taggedID == id) { //  Looking at own birthday (By ID/tag)
							if (user.birthday)
								return message.channel.send("Please set your birthdate before using this command.");

							return message.channel.send(`Your birthday is on the ${user.birthday.getDate()}${numberSuffix[user.birthday.getDate() % 10]} of ${monthNames[user.birthday.getMonth()]}. (PS. you can see your birthday with \`${AbstractCommandOptions.prefix}birthday\`)`);
						}

						let taggedUser: User = await this.userService.getUserWithID(taggedID);

						if (!taggedUser.birthday)
							return message.channel.send(`<@!${taggedID}>'s birthday is unknown.`);

						// Example: @Montori's birthday is on the 1st of January.
						return message.channel.send(`<@!${taggedID}>'s birthday is on the ${taggedUser.birthday.getDate()}${numberSuffix[taggedUser.birthday.getDate() % 10]} of ${monthNames[taggedUser.birthday.getMonth()]}.`);
				}

			case 0:
				if (!user.birthday)
					return message.channel.send("Please set your birthdate before using this command.");

				return message.channel.send(`Your birthday is on the ${user.birthday.getDate()}${numberSuffix[user.birthday.getDate() % 10]} of ${monthNames[user.birthday.getMonth()]}.`);

			default:
				return message.channel.send(`This subcommand is unkown.`);
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