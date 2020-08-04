import { Client, GuildMember, VoiceState, Guild, VoiceChannel } from "discord.js";
import { UserService } from "./UserService";
import { User } from "../Entities/Persistent/User";

export class VoiceChatExperienceService
{
    private static instance: VoiceChatExperienceService;
    private bot: Client;
    private userService: UserService = UserService.getInstance();
    private voiceMap: Map<String, Array<VoiceMember>> = new Map();

    public static init(bot: Client)
    {
        if(!VoiceChatExperienceService.instance)
        {
            this.instance = new VoiceChatExperienceService(bot);
        }
    }
    
    public static getInstance(): VoiceChatExperienceService
    {
        return this.instance;
    }

    private constructor(bot: Client)
    {
        this.bot = bot;
    }

    public distributeVoiceExperience()
    {
        this.voiceMap.forEach(async userList => {
            if(userList.length >= 2)
            {
                for(const voiceMember of userList)
                {
                    if(!voiceMember.isMuted)
                    {
                        let user: User = await this.userService.getUser(voiceMember.member, voiceMember.member.guild);
                        user.vcxp += 10;
                        await user.save();
                    }
                }
            }
        });
    }

    public handleVoiceStateEvent(oldState: VoiceState, newState: VoiceState)
    {
        if(newState.member.user.bot) return;

        if(!oldState.channel && newState.channel) //user joins channel
        {
            let userArray = this.getUserArray(newState.channel);

            userArray.push(new VoiceMember(newState.member, newState.mute || newState.deaf));
            this.updateMap(newState.channel, userArray);
        }
        else if(oldState.channel && !newState.channel) //user leaves channel
        {
            let userArray = this.getUserArray(oldState.channel).filter(voiceMember => voiceMember.id != oldState.member.id);

            this.updateMap(oldState.channel, userArray);
        }
        else if((!oldState.mute && newState.mute) || (!oldState.deaf && newState.mute)) //user mute or deaf
        {
            let userArray = this.getUserArray(newState.channel);

            if(!userArray.find(member => member.member.id == newState.member.id)) userArray.push(new VoiceMember(newState.member, newState.mute || newState.deaf));
            let userIndex: number = userArray.findIndex(voiceMember => voiceMember.id == newState.member.id);
            userArray[userIndex].isMuted = newState.mute || newState.deaf;

            this.updateMap(oldState.channel, userArray);
        }
        else if((oldState.mute && !newState.mute) || (oldState.deaf && !newState.mute)) //user unmute or undeaf
        {
            let userArray = this.getUserArray(newState.channel);

            if(!userArray.find(member => member.member.id == newState.member.id)) userArray.push(new VoiceMember(newState.member, newState.mute || newState.deaf));
            let userIndex: number = userArray.findIndex(voiceMember => voiceMember.id == newState.member.id);
            userArray[userIndex].isMuted = newState.mute || newState.deaf;

            this.updateMap(oldState.channel, userArray);
        }
        else if(oldState.channel && newState.channel) //user switches channel
        {
            let oldUserArray = this.getUserArray(oldState.channel).filter(member => member.id != oldState.member.id);
            let newUserArray = this.getUserArray(newState.channel);

            newUserArray.push(new VoiceMember(newState.member, newState.mute || newState.deaf));

            this.updateMap(oldState.channel, oldUserArray);
            this.updateMap(newState.channel, newUserArray);
        }
    }

    private updateMap(channel: VoiceChannel, userArray: Array<VoiceMember>)
    {
        if(userArray.length == 0)
        {
            this.voiceMap.delete(channel.id);
        }
        else
        {
            this.voiceMap.set(channel.id, userArray);
        }
    }

    private getUserArray(channel: VoiceChannel): Array<VoiceMember>
    {
        let userList = this.voiceMap.get(channel.id);
        if(!userList)
        {
            userList = new Array<VoiceMember>();
            this.voiceMap.set(channel.id, userList);
        }
        return userList;
    }

}

class VoiceMember
{
    public readonly id: string;
    public readonly member: GuildMember;
    public isMuted: boolean;

    constructor(member: GuildMember, isMuted: boolean)
    {
        this.member = member;
        this.isMuted = isMuted;
        this.id = member.id;
    }
}