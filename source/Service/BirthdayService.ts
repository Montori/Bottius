import { MessageService } from "./MessageService";
import { UserService } from "./UserService";
import { ServerDataService } from "./ServerDataService";
import { ServerData } from "../Material/ServerData";
import { Client, GuildMember, TextChannel, Channel } from "discord.js";

export class BirthdayService {
	private static instance: BirthdayService;
	private static userService: UserService = UserService.getInstance();
	private static serverService: ServerDataService = ServerDataService.getInstance();

	public static getInstance(): BirthdayService {
		return this.instance;
	}

	public static async updateBirthdays(bot: Client) {
		let servers = await this.serverService.getAllServerData();
		let d = new Date();
		servers.forEach((s: ServerData, i: number) => {
			let server = bot.guilds.cache.find(g => g.id == s.guildID);
			if (s.birthdayChannelID || s.birthdayRoleID) {
				server.members.cache.forEach(async (u: GuildMember) => {
					let user = await this.userService.getUser(u);
					if (user.birthday &&
						user.birthday.getUTCDate() == d.getUTCDate() &&
						user.birthday.getUTCMonth() == d.getUTCMonth()) {
						if (s.birthdayChannelID) {
							let channel = await bot.channels.cache.get(s.birthdayChannelID);
							if (channel && channel.type == "text") {
								(channel as TextChannel).send(`Happy birthday to <@!${user.id}>!`);
							} else {
								s.birthdayChannelID = "";
								s.save();
							}
						}
						if (s.birthdayRoleID) {
							(await server.members.fetch(user.discordID)).roles.add(s.birthdayRoleID);
						}
					}
					else if (user.birthday &&
						user.birthday.getUTCDate() - 1 == d.getUTCDate() &&
						user.birthday.getUTCMonth() == d.getUTCMonth()) {
						if (s.birthdayRoleID) {
							await (await server.members.fetch(user.discordID)).roles.remove(s.birthdayRoleID);
						}
					}
				});
			}
		});

		setInterval((c: Client) => this.updateBirthdays(c), 24 * 60 * 60 * 1000, bot);
	}
}