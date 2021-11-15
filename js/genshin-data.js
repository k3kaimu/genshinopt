class CharacterData
{
    constructor(id, name, rarity, elem, weaponType, bAtt, bDef, bHP, bBonusType, bBonusValue) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;   // 5 or 4

        /*
        Anemo, Cryo, Dendro, Electro, Geo, Hydro, Pyro
        */
        this.elem = elem;

        /*
        Sword, Claymore, Polearm, Catalyst, Bow
        */
        this.weaponType = weaponType;
        
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


    newViewModel()
    {
        return new CharacterViewModel(this);
    }
}


class CharacterViewModel
{
    constructor(ch)
    {
        this.character = ch;
    }


    // typeof(return): string[]
    viewHTMLList(target){
        return [];
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
            "Sword",
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
            "Sword",
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
            "Sword",
            213,        /* bAtt */
            682,        /* bDef */
            10875,      /* bHP */
            "rateAtt",  /* bBonusType */
            0.24        /* bBonusValue */
            );
    }
}



// 胡桃
class HuTao extends CharacterData
{
    constructor()
    {
        super(
            "hu_tao",
            "胡桃",
            5,
            "Pyro",
            "Polearm",
            106,            /* bAtt */
            876,            /* bDef */
            15552,          /* bHP */
            "baseCrtDmg",   /* bBonusType */
            0.384           /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new HuTaoViewModel(this);
    }
}


class HuTaoViewModel extends CharacterViewModel
{
    constructor(ch)
    {
        super(ch);
        this.hpLowerThan50 = ko.observable(true);
        this.useC6Effect = ko.observable();
    }


    viewHTMLList(target)
    {
        return [
            `
            <div class="card">
                <div class="card-header p-2">血のかまど</div>
                <div class="card-body p-2">
                    <div class="form-group m-0">
                        <div class="form-check" data-bind="with: ` + target + `">
                            <input class="form-check-input" type="checkbox" data-bind="checked: hpLowerThan50" checked>
                            <label class="form-check-label">
                            +33%炎ダメ（HP50%以下）
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            `,
            `
            <div data-bind="if: $root.selConstellation() >= 6">
                <div class="card">
                    <div class="card-header p-2">冥蝶の抱擁（6凸効果）</div>
                        <div class="card-body p-2">
                            <div class="form-group m-0">
                                <div class="form-check" data-bind="with: ` + target + `">
                                    <input class="form-check-input" type="checkbox" data-bind="checked: useC6Effect" checked>
                                    <label class="form-check-label">
                                    会心率+100%
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `
        ];
    }
}



class WeaponData
{
    constructor(id, name, rarity, weaponType, bAtt, bBonusType, bBonusValue) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;

        /*
        Sword, Claymore, Polearm, Catalyst, Bow
        */
        this.weaponType = weaponType;

        this.baseAtt = bAtt;
        this.rateAtt = 0;
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


class WeaponViewModel
{
    constructor(data)
    {
        this.weapon = data;
    }


    viewHTMLList(target)
    {
        return [];
    }
}


class StaffOfHoma extends WeaponData
{
    constructor()
    {
        super(
            "staff_of_homa",
            "護摩の杖",
            5,
            "Polearm",
            608,
            "baseCrtDmg",
            0.662
        );
    }


    newViewModel()
    {
        return new StaffOfHomaViewModel(this);
    }
}


class StaffOfHomaViewModel extends WeaponViewModel
{
    constructor(data)
    {
        super(data);
        this.selLowHighHP = ko.observable("lowHP");
    }


    viewHTMLList(target)
    {
        var uid = genUniqueId();

        return [
            `
            <div class="card">
                <div class="card-header p-2">攻撃力上昇効果</div>
                <div class="card-body p-2">
                <div class="form-group" data-bind="with: `+target+`">
                    <div class="form-check">
                    <input class="form-check-input" type="radio" name="`+target+uid+`" value="highHP" data-bind="checked: selLowHighHP">
                    <label class="form-check-label">
                        HP上限の0.8%分攻撃力上昇
                    </label>
                    </div>
                    <div class="form-check">
                    <input class="form-check-input" type="radio" name="`+target+uid+`" value="lowHP" data-bind="checked: selLowHighHP">
                    <label class="form-check-label">
                        HP上限の1.8%分攻撃力上昇
                    </label>
                    </div>
                </div>
                </div>
            </div>
            `
        ]
    }
}


class PrimordialJadeCutter extends WeaponData
{
    constructor()
    {
        super(
            "primordial_jade_cutter",
            "磐岩結緑",
            5,
            "Sword",
            542,
            "baseCrtRate",
            0.441
        );
    }
}

genshinData = {
    characters: [
        new TravelerAnemo(),
        new TravelerGeo(),
        new TravelerElectro(),
        new HuTao(),
    ],

    weapons: [
        new StaffOfHoma(),
        new PrimordialJadeCutter(),
    ]
};