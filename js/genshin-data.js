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
        this.parent = ch;
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
                            <label class="form-check-label">
                                <input class="form-check-input" type="checkbox" data-bind="checked: hpLowerThan50" checked>
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
                                    <label class="form-check-label">
                                        <input class="form-check-input" type="checkbox" data-bind="checked: useC6Effect" checked>
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
        this.parent = data;
    }


    viewHTMLList(target)
    {
        return [];
    }
}


// 護摩の杖
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


// 護摩の杖, ViewModel
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
                    <label class="form-check-label">
                        <input class="form-check-input" type="radio" name="`+target+uid+`" value="highHP" data-bind="checked: selLowHighHP">
                        HP上限の0.8%分攻撃力上昇
                    </label>
                    </div>
                    <div class="form-check">
                    <label class="form-check-label">
                        <input class="form-check-input" type="radio" name="`+target+uid+`" value="lowHP" data-bind="checked: selLowHighHP">
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


// 磐岩結緑
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


class ArtifactData
{
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
    }


    newViewModel()
    {
        return new ArtifactViewModel(this);
    }
}


class ArtifactViewModel
{
    // bonusType: '2' or '4'
    constructor(data, bonusType)
    {
        this.parent = data;
        this.bonusType = bonusType;
    }


    viewHTMLList(target)
    {
        return [];
    }
}


// 燃え盛る炎の魔女
class CrimsonWitchOfFlames extends ArtifactData
{
    constructor()
    {
        super(
            'crimson_witch_of_flames',
            "燃え盛る炎の魔女"
        )
    }


    newViewModel()
    {
        return new CrimsonWitchOfFlamesViewModel(this);
    }
}


// 燃え盛る炎の魔女, ViewModel
class CrimsonWitchOfFlamesViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffStacks = ko.observable();
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                `
                <div class="card">
                    <div class="card-header p-2">火魔女：炎ダメバフ</div>
                    <div class="card-body p-2">
                        <div class="form-group m-0">
                            <div class="form-check" data-bind="with: ` + target + `">
                                <select class="custom-select" aria-label="バフ効果量" data-bind="value: buffStacks">
                                    <option value="0">+15.0%</option>
                                    <option value="1">+22.5%</option>
                                    <option value="2">+30.0%</option>
                                    <option selected value="3">+37.5%</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                `);
        }

        return list;
    }
}


// 追憶のしめ縄
class ShimenawaReminiscence extends ArtifactData
{
    constructor()
    {
        super(
            'shimenawa_reminiscence',
            "追憶のしめ縄"
        );
    }


    newViewModel()
    {
        return new ShimenawaReminiscenceViewModel(this);
    }
}


// 追憶のしめ縄, ViewModel
class ShimenawaReminiscenceViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffEffect = ko.observable();
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                `
                <div class="card">
                    <div class="card-header p-2">しめ縄：ダメバフ</div>
                    <div class="card-body p-2">
                        <div class="form-group m-0">
                            <div class="form-check" data-bind="with: ` + target + `">
                                <label class="form-check-label">
                                    <input class="form-check-input" type="checkbox" data-bind="checked: buffEffect" checked>
                                    通常・重撃・落下+50%ダメバフ（元素エネ15消費）
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                `);
        }

        return list;
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
    ],

    artifacts: [
        new ShimenawaReminiscence(),
    ],
};
