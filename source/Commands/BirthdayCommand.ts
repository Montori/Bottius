import { AbstractCommand } from "./AbstractCommand";
import { AbstractCommandOptions } from "../Material/AbstractCommandOptions";
import { Client, Message, MessageEmbed, GuildMember, Guild, Role } from "discord.js";
import { UserService } from "../Service/UserService";
import { User } from "../Material/User";
import { PermissionLevel } from "../Material/PermissionLevel";
import { ServerData } from "../Material/ServerData";
import { ServerDataService } from "../Service/ServerDataService";
import { HelperFunctions } from "../Material/HelperFunctions";

export class BirthdayCommand extends AbstractCommand {
	public commandOptions: BirthdayCommandHelp = new BirthdayCommandHelp();
	public userService: UserService = UserService.getInstance();
	public serverDataService: ServerDataService = ServerDataService.getInstance();

	private static monthEnum = {
		JANUARY: "January",
		FEBRUARY: "February",
		MARCH: "March",
		APRIL: "April",
		MAY: "May",
		JUNE: "June",
		JULY: "July",
		AUGUST: "August",
		SEPTEMBER: "September",
		OCTOBER: "October",
		NOVEMBER: "November",
		DECEMBER: "December",
	};

	private static monthOrder = [
		BirthdayCommand.monthEnum.DECEMBER, // December is stored as 0 in the Date type
		BirthdayCommand.monthEnum.JANUARY,
		BirthdayCommand.monthEnum.FEBRUARY,
		BirthdayCommand.monthEnum.MARCH,
		BirthdayCommand.monthEnum.APRIL,
		BirthdayCommand.monthEnum.MAY,
		BirthdayCommand.monthEnum.JUNE,
		BirthdayCommand.monthEnum.JULY,
		BirthdayCommand.monthEnum.AUGUST,
		BirthdayCommand.monthEnum.SEPTEMBER,
		BirthdayCommand.monthEnum.OCTOBER,
		BirthdayCommand.monthEnum.NOVEMBER,
		BirthdayCommand.monthEnum.DECEMBER
	];

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

		switch (messageArray.length) {

			case 4:
				switch (messageArray[0]) {
					case "set":
						let taggedID: string = HelperFunctions.getID(messageArray[1]);
						let date = parseInt(messageArray[2]);
						let month = parseInt(messageArray[3]);

						// Setting own birthday (By ID/tag)
						if (taggedID == user.discordID) {
							// Only staff can change their birthdays
							if (user.birthday && user.permissionLevel < PermissionLevel.moderator)
								return super.sendPermissionDenied(message);

							// Invalid birthday
							if (!BirthdayCommand.validateBirthday(date, month))
								return message.channel.send(super.getFailedEmbed().setDescription("An invalid date was provided."));

							BirthdayCommand.setBirthday(user, date, month);
							return message.channel.send(super.getSuccessEmbed().setDescription(`Your birthday has been set. (PS. you can set your birthday with \`${AbstractCommandOptions.prefix}birthday set {DD} {MM}\`)`));
						}

						// Regular member attempting to set somebody else's birthday
						if (user.permissionLevel < PermissionLevel.moderator)
							return super.sendPermissionDenied(message);// message.channel.send("You must be a staff member to set another member's birthday!");

						// A staff member attempting to set somebody else's birthday
						if (!HelperFunctions.verifyUserID(message.guild, taggedID))
							return message.channel.send(super.getFailedEmbed().setDescription("An invalid member was provided."));

						// Invalid birthday
						if (!BirthdayCommand.validateBirthday(date, month))
							return message.channel.send(super.getFailedEmbed().setDescription("An invalid date was provided."));

						let taggedUser: User = await this.userService.getUserWithID(taggedID);

						BirthdayCommand.setBirthday(taggedUser, date, month);
						return message.channel.send(super.getSuccessEmbed().setDescription(`<@!${taggedID}>'s birthday has been set.`));

					default:
						return super.sendHelp(message);
				}

			case 3:
				switch (messageArray[0]) {
					// !!birthday set {DD} {MM}
					case "set":
						// Only staff can change their birthdays
						if (user.birthday && user.permissionLevel < PermissionLevel.moderator)
							return super.sendPermissionDenied(message);

						let date = parseInt(messageArray[1]);
						let month = parseInt(messageArray[2]);

						if (!BirthdayCommand.validateBirthday(date, month))
							return message.channel.send(super.getFailedEmbed().setDescription("An invalid date was provided."));

						BirthdayCommand.setBirthday(user, date, month)
						return message.channel.send(super.getSuccessEmbed().setDescription("Your birthday has been set."));

					// !!birthday role set {role}
					case "role":
						if (messageArray[1] != "set") break;

						// Not a staff member
						if (user.permissionLevel < PermissionLevel.moderator)
							return super.sendPermissionDenied(message);// message.channel.send("You must be a staff member to set the birthday role!");

						let roleID = HelperFunctions.getID(messageArray[2])

						// Invalid role
						if (!HelperFunctions.verifyRoleID(message.guild, roleID))
							return message.channel.send(super.getFailedEmbed().setDescription("An invalid role was provided"));

						server.birthdayRoleID = roleID;
						server.save();
						return message.channel.send(super.getSuccessEmbed().setDescription("The birthday role has been set."));

					// !!birthday channel set {channel}
					case "channel":
						if (messageArray[1] != "set")
							return super.sendHelp(message);

						// Regular user being naughty
						if (user.permissionLevel < PermissionLevel.moderator)
							return super.sendPermissionDenied(message);// message.channel.send("You must be a staff member to set the birthday channel!");

						let channelID = HelperFunctions.getID(messageArray[2])

						// Invalid channel
						if (!HelperFunctions.verifyChannelID(message.guild, channelID) && message.guild.channels.resolve(channelID).type == "text")
							return message.channel.send(super.getFailedEmbed().setDescription("An invalid channel was provided."));

						server.birthdayChannelID = channelID;
						server.save();
						return message.channel.send(super.getSuccessEmbed().setDescription("The birthday channel has been set."));

					default:
						return super.sendHelp(message);
				}

			case 2:
				switch (messageArray[0]) {

					// !!birthday set {DD}
					case "set":
						return message.channel.send(super.getFailedEmbed().setDescription(`An incomplete date was provided. (\`${AbstractCommandOptions.prefix}birthday set {DD} {MM}\`)`));

					// !!birthday clear {user}
					case "clear":

						// A regular user attempting to clear a birthday
						if (user.permissionLevel < PermissionLevel.moderator)
							return super.sendPermissionDenied(message);// message.channel.send("You must be a staff member to clear a member's birthday!");

						let taggedID: string = HelperFunctions.getID(messageArray[1]);

						// Clearing own birthday (By ID/tag)
						if (taggedID == user.discordID) {

							// No data to clear
							if (!user.birthday)
								return message.channel.send(super.getFailedEmbed().setDescription("Your birthday is already cleared."));

							BirthdayCommand.removeBirthday(user);
							return message.channel.send(super.getSuccessEmbed().setDescription(`Your birthday has been cleared. (PS. you can clear your birthday with \`${AbstractCommandOptions.prefix}birthday clear\`)`));
						}

						// A staff member attempting to clear somebody else's birthday
						if (!HelperFunctions.verifyUserID(message.guild, taggedID))
							return message.channel.send(super.getFailedEmbed().setDescription("An invalid member was provided."));

						let taggedUser: User = await this.userService.getUserWithID(taggedID);

						// No data to clear
						if (!taggedUser.birthday)
							return message.channel.send(super.getFailedEmbed().setDescription(`<@!${taggedID}>'s birthday is already cleared.`));

						// Success!
						BirthdayCommand.removeBirthday(taggedUser);
						return message.channel.send(super.getSuccessEmbed().setDescription(`<@!${taggedID}>'s birthday has been cleared.`));

					case "role":
						switch (messageArray[1]) {

							// !!birthday role set
							case "set":
								// Regular user being naughty
								if (user.permissionLevel < PermissionLevel.moderator)
									return super.sendPermissionDenied(message);// message.channel.send("You must be a staff member to set the birthday role!");

								// No role provided
								return message.channel.send(super.getFailedEmbed().setDescription("A role was not provided."));

							// !!birthday role remove
							case "remove":
								// Regular user being naughty
								if (user.permissionLevel < PermissionLevel.moderator)
									return super.sendPermissionDenied(message);// message.channel.send("You must be a staff member to remove the birthday role!");

								// No role to remove
								if (!server.birthdayRoleID)
									return message.channel.send(super.getFailedEmbed().setDescription("The birthday role has not been set."));

								//delete server.birthdayRoleID;
								server.birthdayRoleID = "";
								server.save();
								return message.channel.send(super.getSuccessEmbed().setDescription("The birthday role has been removed."));

							default:
								return super.sendHelp(message);
						}

					case "channel":
						switch (messageArray[1]) {

							// !!birthday channel set
							case "set":
								// Regular user being naughty
								if (user.permissionLevel < PermissionLevel.moderator)
									return super.sendPermissionDenied(message);// message.channel.send("You must be a staff member to set the birthday channel!");

								return message.channel.send(super.getFailedEmbed().setDescription("Please provide a channel to set."));

							// !!birthday channel remove
							case "remove":
								if (user.permissionLevel < PermissionLevel.moderator)
									return super.sendPermissionDenied(message);// message.channel.send("You must be a staff member to remove the birthday role!");

								if (!server.birthdayChannelID)
									return message.channel.send(super.getFailedEmbed().setDescription("The birthday channel is not set."));

								server.birthdayChannelID = "";
								server.save();

								return message.channel.send(super.getSuccessEmbed().setDescription("The birthday channel has been removed."));

							default:
								return super.sendHelp(message);
						}

					default:
						return super.sendHelp(message);
				}

			case 1:
				switch (messageArray[0]) {
					// !!birthday set
					case "set":
						return message.channel.send(super.getFailedEmbed().setDescription(`Please provide a date. (\`${AbstractCommandOptions.prefix}birthday set {DD} {MM}\`)`));

					// !!birthday clear
					case "clear":
						// No data to clear
						if (!user.birthday)
							return message.channel.send(super.getFailedEmbed().setDescription("Your birthday is not set."));

						// Only staff can clear birthdays
						if (user.permissionLevel < PermissionLevel.moderator)
							return super.sendPermissionDenied(message);

						BirthdayCommand.removeBirthday(user);
						return message.channel.send(super.getSuccessEmbed().setDescription("Your birthday has been cleared."));

					// !!birthday role
					case "role":
						// No role to see
						if (!server.birthdayRoleID)
							return message.channel.send(super.getFailedEmbed().setDescription("The birthday role is not set."));

						// Shows the current role
						return message.channel.send(super.getSuccessEmbed().setDescription(`The birthday role is currently assigned to '${(await message.guild.roles.fetch(server.birthdayRoleID)).name}' (ID ${server.birthdayRoleID}).`));

					// !!birthday channel
					case "channel":
						// No channel to see
						if (!server.birthdayChannelID)
							return super.sendPermissionDenied(message);// message.channel.send("You must be a staff member to remove the birthday role!");

						// Shows the current channel
						return message.channel.send(super.getSuccessEmbed().setDescription(`This server's channel is currently assigned to '${message.guild.channels.resolve(server.birthdayChannelID).name}' (ID ${server.birthdayChannelID}).`));

					// !!birthday {user}
					default:
						let taggedID: string = HelperFunctions.getID(messageArray[0]);
						if (!HelperFunctions.verifyUserID(message.guild, taggedID))
							return message.channel.send(super.getFailedEmbed().setDescription("An invalid user was provided."));

						if (taggedID == id) { //  Looking at own birthday (By ID/tag)
							if (user.birthday)
								return message.channel.send(super.getFailedEmbed().setDescription("Your birthday has not been set yet."));

							return message.channel.send(super.getSuccessEmbed().setDescription(`Your birthday is on the ${user.birthday.getDate()}${HelperFunctions.getSuffix(user.birthday.getDate())} of ${BirthdayCommand.monthOrder[user.birthday.getMonth()]}. (PS. you can see your birthday with \`${AbstractCommandOptions.prefix}birthday\`)`));
						}

						let taggedUser: User = await this.userService.getUserWithID(taggedID);

						if (!taggedUser.birthday)
							return message.channel.send(super.getFailedEmbed().setDescription(`<@!${taggedID}>'s birthday has not been set yet.`));

						// Example: @Montori's birthday is on the 1st of January.
						return message.channel.send(super.getSuccessEmbed().setDescription(`<@!${taggedID}>'s birthday is on the ${taggedUser.birthday.getDate()}${HelperFunctions.getSuffix(taggedUser.birthday.getDate())} of ${BirthdayCommand.monthOrder[taggedUser.birthday.getMonth()]}.`));
				}

			case 0:
				if (!user.birthday)
					return message.channel.send(super.getFailedEmbed().setDescription("Your birthday has not been set yet."));

				return message.channel.send(super.getSuccessEmbed().setDescription(`Your birthday is on the ${user.birthday.getDate()}${HelperFunctions.getSuffix(user.birthday.getDate())} of ${BirthdayCommand.monthOrder[user.birthday.getMonth()]}.`));

			default:
				return super.sendHelp(message);
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