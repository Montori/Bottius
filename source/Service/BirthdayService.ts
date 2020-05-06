import { UserService } from "./UserService";
import { ServerDataService } from "./ServerDataService";
import { Client, TextChannel, GuildMember, Guild } from "discord.js";
import { User } from "../Material/User";

export class BirthdayService {
	private static instance: BirthdayService;
	private static userService: UserService = UserService.getInstance();
	private static serverService: ServerDataService = ServerDataService.getInstance();
	private static madeInterval: boolean = false;

	public static getInstance(): BirthdayService {
		if (!BirthdayService.instance) {
			BirthdayService.instance = new BirthdayService();
		}

		return BirthdayService.instance;
	}

	public static async updateBirthdays(bot: Client) {
		let today = new Date();

		let yesterday = today;
		yesterday.setDate(yesterday.getDate() - 1);

		let birthdayUsers = await User.find({ where: { birthday: { getUTCDate: today.getUTCDate(), getUTCMonth: today.getUTCMonth() } } });
		let priorBirthdayUsers = await User.find({ where: { birthday: { getUTCDate: yesterday.getUTCDate(), getUTCMonth: yesterday.getUTCMonth() } } });

		let guilds = await this.serverService.getAllServerData();

		for (const s of guilds) {
			let server = bot.guilds.resolve(s.guildID);
			for (const user of birthdayUsers) {
				if (server.members.resolve(user.discordID)) {
					// Say happy birthday
					if (s.birthdayChannelID) {

						let channel = bot.channels.resolve(s.birthdayChannelID);
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
						await (await server.members.fetch(user.discordID)).roles.add(s.birthdayRoleID);
				}
			}
			for (const user of priorBirthdayUsers) {
				if (server.members.resolve(user.discordID)) {
					// Take their birthday role :(
					if (s.birthdayRoleID)
						await (await server.members.fetch(user.discordID)).roles.remove(s.birthdayRoleID);
				}
			}
		}

		// Run every day
		if (!this.madeInterval)
			setInterval((c: Client) => this.updateBirthdays(c), 24 * 60 * 60 * 1000, bot);
	}
}