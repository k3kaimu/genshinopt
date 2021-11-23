import * as Base from '/js/modules/characters/base.mjs';


// 旅人（雷）
export class TravelerElectro extends Base.CharacterData
{
    constructor()
    {
        super(
            "traveler_anemo",
            "旅人(雷)",
            5,
            "Electro",
            "Sword",
            213,        /* bAtk */
            682,        /* bDef */
            10875,      /* bHP */
            "rateAtk",  /* bBonusType */
            0.24        /* bBonusValue */
            );
    }
}