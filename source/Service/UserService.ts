import { User } from '../Material/User';
import { GuildMember } from 'discord.js';

export class UserService
{
   private static instance: UserService;

    public static getInstance(): UserService
    {
        if(!UserService.instance)
        {
            this.instance = new UserService();
        }

        return this.instance;
    }

    public async getUser(guildMember : GuildMember): Promise<User>
    {
        let foundUser = await User.findOne({where: {discordID: guildMember.id}});
        if(!foundUser)
        {
            foundUser = new User(guildMember.id);
        }

        return foundUser;
    }
}