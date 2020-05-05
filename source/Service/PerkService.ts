import { Perk } from "../Material/Perk";

export class PerkService
{
    private static instance: PerkService;

    public static getInstance(): PerkService
    {
        if(!PerkService.instance)
        {
            this.instance = new PerkService();
        }

        return this.instance;
    }

    public async doesPerkExist(roleID: string): Promise<boolean>
    {
        let result: boolean = false;
        let perk: Perk = await Perk.findOne({where: {role: roleID}});
        
        if(perk) result = true;
        return result;
    }

    public addPerk(lvl: number, roleID: string)
    {
        let perk: Perk = new Perk(lvl, roleID);
        perk.save();
    }

    public async getPerk(roleID: string) : Promise<Perk>
    {
        return Perk.findOne({where: {role: roleID}});
    }

    public async removePerk(roleID: string)
    {
        let perk: Perk = await Perk.findOne({where: {role: roleID}});
        perk.remove();
    }

    public async getAllPerks() : Promise<Array<Perk>>
    {
        return await Perk.find({order: {reqLevel:"DESC"}});
    }
}
