class CharacterData
{
    constructor(id, name, rarity, elem, bAtt, bDef, bHP, bBonusType, bBonusValue) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;
        this.elem = elem;
        
        this.baseAtt = bAtt;
        this.rateAtt = 0;
        this.baseDef = bDef;
        this.rateDef = 0;
        this.baseHP = bHP;
        this.rateHP = 0;

        this.baseCrtRate = 5;
        this.baseCrtDmg = 0;

        this.baseAnemoDmg = 0;
        this.baseGeoDmg = 0;
        this.baseElectroDmg = 0;
        this.basePyroDmg = 0;
        this.baseHydroDmg = 0;
        this.baseCryoDmg = 0;
        this.baseDendroDmg = 0;
        
        this[bBonusType] += bBonusValue;
    }
}


// 旅人（風）
class TravelerAnemo extends CharacterData
{
    constructor()
    {
        super(
            "traveler_anemo",
            "旅人(風)",
            5,
            "Anemo",
            213,        /* bAtt */
            682,        /* bDef */
            10875,      /* bHP */
            "rateAtt",  /* bBonusType */
            0.24        /* bBonusValue */
            );
    }
}


// 旅人（岩）
class TravelerGeo extends CharacterData
{
    constructor()
    {
        super(
            "traveler_anemo",
            "旅人(岩)",
            5,
            "Geo",
            213,        /* bAtt */
            682,        /* bDef */
            10875,      /* bHP */
            "rateAtt",  /* bBonusType */
            0.24        /* bBonusValue */
            );
    }
}


// 旅人（雷）
class TravelerElectro extends CharacterData
{
    constructor()
    {
        super(
            "traveler_anemo",
            "旅人(雷)",
            5,
            "Electro",
            213,        /* bAtt */
            682,        /* bDef */
            10875,      /* bHP */
            "rateAtt",  /* bBonusType */
            0.24        /* bBonusValue */
            );
    }
}


genshinData = {
    characters: [
        new TravelerAnemo(),
        new TravelerGeo(),
        new TravelerElectro(),
    ],
};