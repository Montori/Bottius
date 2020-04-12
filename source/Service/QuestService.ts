import { Quest } from "../Material/Quest";

export class QuestService
{
    private static instance: QuestService;

    public static getInstance(): QuestService
    {
        if(!QuestService.instance)
        {
            this.instance = new QuestService();
        }

        return this.instance;
    }

    public async getQuest(questID: number)
    {
        return await Quest.findOne({relations: ["assignor", "assignees"], where: {id: questID}});
    }

    public async getAllQuest()
    {
        return await Quest.find({relations: ["assignor", "assignees"]});
    }
}