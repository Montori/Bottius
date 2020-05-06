import { MessageService } from "./MessageService";
import { UserService } from "./UserService";
import { ServerDataService } from "./ServerDataService";
import { ServerData } from "../Material/ServerData";
import { Client, GuildMember, TextChannel, Channel } from "discord.js";

export class BirthdayService {
	private static instance: BirthdayService;
	private static userService: UserService = UserService.getInstance();
	private static serverService: ServerDataService = ServerDataService.getInstance();
	private static madeInterval: boolean = false;

	public static getInstance(): BirthdayService {
		return this.instance;
	}

	public static async updateBirthdays(bot: Client) {
		let servers = await this.serverService.getAllServerData();
		let today = new Date();

		let yesterday = today;
		yesterday.setDate(yesterday.getDate() - 1);

		// Process every server
		servers.forEach((s: ServerData, i: number) => {

			let server = bot.guilds.cache.get(s.guildID);

			// Neither a channel nor role is set
			if (!s.birthdayChannelID && !s.birthdayRoleID) return;

			// Update every member
			server.members.cache.forEach(async (u: GuildMember) => {
				let user = await this.userService.getUser(u);

				// The user doesn't have a birthday yet
				if (!user.birthday) return;

				// It's the user's birthday today
				if (user.birthday.getUTCDate() == today.getUTCDate() &&
					user.birthday.getUTCMonth() == today.getUTCMonth()) {

					// Say happy birthday
					if (s.birthdayChannelID) {

						let channel = bot.channels.cache.get(s.birthdayChannelID);
						if (channel && channel.type == "text") {

							//Channel is good
							(channel as TextChannel).send(`Happy birthday to <@!${user.id}>!`);

						} else {

							// Channel is bad
							s.birthdayChannelID = "";
							s.save();
						}
					}

					// Give them the birthday role
					if (s.birthdayRoleID)
						await server.members.cache.get(user.discordID).roles.add(s.birthdayRoleID);

					return;
				}
				// It was the user's birthday yesterday
				else if (
					user.birthday.getUTCDate() == yesterday.getUTCDate() &&
					user.birthday.getUTCMonth() == yesterday.getUTCMonth()) {

					// Take their birthday role :(
					if (s.birthdayRoleID)
						await server.members.cache.get(user.discordID).roles.remove(s.birthdayRoleID);
				}
			});
		});

		// Run every day
		if (!this.madeInterval)
			setInterval((c: Client) => this.updateBirthdays(c), 24 * 60 * 60 * 1000, bot);
	}
}