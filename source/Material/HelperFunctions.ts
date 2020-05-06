import { Guild } from "discord.js";

export class HelperFunctions {
	// Checks if every character is a number
	public static isNumeric(input: string): Boolean {
		for (let i = 0; i < input.length; i++) {
			if (input[i] < '0' || input[i] > '9') return false; // Every character must be numeric
		}
		return true;
	}

	// Gets an ID from a tag / ID
	public static getID(input: string): string {
		if (this.isNumeric(input)) {
			return input;
		} else if (
			(
				(
					(
						(input.length > 3 && !(input[2] == "!" || input[2] == "&")) ||
						(input.length > 4 && (input[2] == "!" || input[2] == "&"))
					) && input[1] == "@"
				) ||
				(input.length > 2 && input[1] == "#") // Channel
			) &&
			input[0] == "<" &&
			input[input.length - 1] == ">") {
			let id!: string;
			if (input[2] == "!" || input[2] == "&") {
				id = input.substring(3, input.length - 1);
			} else {
				id = input.substring(2, input.length - 1);
			}
			if (this.isNumeric(id))
				return id;
			else
				return "";
		} else {
			return "";
		}
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