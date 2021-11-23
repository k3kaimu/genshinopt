
export class WeaponData
{
    constructor(id, name, rarity, weaponType, bAtk, bBonusType, bBonusValue) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;

        /*
        Sword, Claymore, Polearm, Catalyst, Bow
        */
        this.weaponType = weaponType;

        this.baseAtk = bAtk;
        this.rateAtk = 0;
        this.baseDef = 0;
        this.rateDef = 0;
        this.baseHP = 0;
        this.rateHP = 0;

        this.baseCrtRate = 0;
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


    newViewModel()
    {
        return new WeaponViewModel(this);
    }
}


export class WeaponViewModel
{
    constructor(data)
    {
        this.parent = data;
        this.rank = ko.observable();
    }


    applyDmgCalc(calc)
    {
        calc.baseAtk.value += this.parent.baseAtk;
        calc.rateAtk.value += this.parent.rateAtk;
        calc.baseDef.value += this.parent.baseDef;
        calc.rateDef.value += this.parent.rateDef;
        calc.baseHP.value += this.parent.baseHP;
        calc.rateHP.value += this.parent.rateHP;

        calc.baseCrtRate.value += this.parent.baseCrtRate;
        calc.baseCrtDmg.value += this.parent.baseCrtDmg;

        calc.baseAnemoDmg.value += this.parent.baseAnemoDmg;
        calc.baseGeoDmg.value += this.parent.baseGeoDmg;
        calc.baseElectroDmg.value += this.parent.baseElectroDmg;
        calc.basePyroDmg.value += this.parent.basePyroDmg;
        calc.baseHydroDmg.value += this.parent.baseHydroDmg;
        calc.baseCryoDmg.value += this.parent.baseCryoDmg;
        calc.baseDendroDmg.value += this.parent.baseDendroDmg;

        return calc;
    }


    viewHTMLList(target)
    {
        return [];
    }
}
