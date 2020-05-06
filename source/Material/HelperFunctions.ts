import { Guild } from "discord.js";

export class HelperFunctions {
	private static readonly userRegex =  /^<@!?(\d+)>$/;
	private static readonly channelRegex = /^<#(\d+)>$/;
	private static readonly roleRegex =   /^<@&(\d+)>$/;
	private static readonly idRegex =        /^(\d+)$/;

	// Checks if every character is a number
	public static isNumeric(input: string): Boolean {
		for (let i = 0; i < input.length; i++) {
			if (input[i] < '0' || input[i] > '9') return false; // Every character must be numeric
		}
		return true;
	}

	// Gets an ID from a tag / ID
	public static getID(input: string): string {
		if (this.userRegex.test(input)) {
			let results = this.userRegex.exec(input);
			return results[1]
		}
		if (this.channelRegex.test(input)) {
			let results = this.channelRegex.exec(input);
			return results[1]
		}
		if (this.roleRegex.test(input)) {
			let results = this.roleRegex.exec(input);
			return results[1]
		}
		if (this.idRegex.test(input)) {
			return input;
		}
		return "";
	}

	// Verifies that a member with this ID is in the server
	public static verifyUserID(server: Guild, id: string): Boolean {
		if (server.members.cache.find(u => u.id == id)) return true;
		else return false;
	}

	// Verifies that a role with this ID is in the server
	public static verifyRoleID(server: Guild, id: string) {
		if (server.roles.cache.find(r => r.id == id)) return true;
		else return false;
	}

	// Verifies that a channel with this ID is in the server
	public static verifyChannelID(server: Guild, id: string) {
		if (server.channels.cache.find(c => c.id == id)) return true;
		else return false;
	}
}