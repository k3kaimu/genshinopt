import * as Base from '/js/modules/characters/base.mjs';

// 旅人（風）
export class TravelerAnemo extends Base.CharacterData
{
    constructor()
    {
        super(
            "traveler_anemo",
            "旅人(風)",
            5,
            "Anemo",
            "Sword",
            213,        /* bAtk */
            682,        /* bDef */
            10875,      /* bHP */
            "rateAtk",  /* bBonusType */
            0.24        /* bBonusValue */
            );
    }
}
