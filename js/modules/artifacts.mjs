import * as Widget from '/js/modules/widget.mjs';


export class ArtifactData
{
    constructor(id, name, abbr)
    {
        this.id = id;
        this.name = name;
        this.abbr = abbr;
    }


    newViewModel()
    {
        return new ArtifactViewModel(this);
    }
}


export class ArtifactViewModel
{
    // bonusType: '2' or '4'
    constructor(data, bonusType)
    {
        this.parent = data;
        this.bonusType = bonusType;
    }


    applyDmgCalc(calc)
    {
        return calc;
    }


    viewHTMLList(target)
    {
        return [];
    }


    toJS() {
        let obj = {};
        obj.parent_id = this.parent.id;
        obj.bonusType = this.bonusType;
        return obj;
    }


    fromJS(obj) {
        this.bonusType = obj.bonusType;
    }
}


// 剣闘士のフィナーレ
export class GladiatorsFinale extends ArtifactData
{
    constructor()
    {
        super(
            "gladiators_finale",
            "剣闘士のフィナーレ",
            "剣闘士",
        )
    }

    newViewModel(bonusType)
    {
        return new GladiatorsFinaleViewModel(this, bonusType);
    }
}


// 剣闘士のフィナーレ, ViewModel
export class GladiatorsFinaleViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.rateAtk.value += 0.18;

        if(this.bonusType == 2)
            return calc;

        // when bonusType == 4 as follows:
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalcGladiatorsFinale = class extends CalcType {
            normalDmgBuff() {
                if(this.character.weaponType == 'Sword'
                || this.character.weaponType == 'Claymore'
                || this.character.weaponType == 'Polearm') {
                    return super.normalDmgBuff().add(0.35);
                } else {
                    return super.normalDmgBuff();
                }
            }
        }

        calc = Object.assign(new NewCalcGladiatorsFinale(), calc);
        return calc;
    }
}


// 大地を流浪する楽団
export class WanderersTroupe extends ArtifactData
{
    constructor()
    {
        super(
            "wanderers_troupe",
            "大地を流浪する楽団",
            "楽団",
        )
    }

    newViewModel(bonusType)
    {
        return new WanderersTroupeViewModel(this, bonusType);
    }
}


// 大地を流浪する楽団, ViewModel
export class WanderersTroupeViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseMastery.value += 80;

        if(this.bonusType == 2)
            return calc;

        // when bonusType == 4 as follows:
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalcWanderersTroupe = class extends CalcType {
            chargedDmgBuff() {
                if(this.character.weaponType == 'Catalyst'
                || this.character.weaponType == 'Bow') {
                    return super.chargedDmgBuff().add(0.35);
                } else {
                    return super.chargedDmgBuff();
                }
            }
        }

        calc = Object.assign(new NewCalcWanderersTroupe(), calc);
        return calc;
    }
}


// 燃え盛る炎の魔女
export class CrimsonWitchOfFlames extends ArtifactData
{
    constructor()
    {
        super(
            'crimson_witch_of_flames',
            "燃え盛る炎の魔女",
            "火魔女",
        );
    }


    newViewModel(type)
    {
        return new CrimsonWitchOfFlamesViewModel(this, type);
    }
}


// 燃え盛る炎の魔女, ViewModel
export class CrimsonWitchOfFlamesViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffStacks = ko.observable(3);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        let bonusValue = 0.15;
        if(this.bonusType == '4') {
            bonusValue += bonusValue * 0.5 * this.buffStacks();
            
            calc.baseOverloadedBonus.value += 0.4;
            calc.baseBurningBonus.value += 0.4;
            calc.baseVaporizeBonus.value += 0.15;
            calc.baseMeltBonus.value += 0.15;
        }
        
        calc.basePyroDmg.value += bonusValue;
        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                Widget.buildViewHTML(target, "炎ダメバフ",
                    Widget.selectViewHTML("buffStacks", [
                        {value: 0, label: "+15.0%"},
                        {value: 1, label: "+22.5%"},
                        {value: 2, label: "+30.0%"},
                        {value: 3, label: "+37.5%"},
                    ]))
                );
        }

        return list;
    }


    toJS() {
        let obj = super.toJS();
        obj.buffStacks = this.buffStacks();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.buffStacks(obj.buffStacks);
    }
}


// 逆飛びの流星
export class RetracingBolide extends ArtifactData
{
    constructor()
    {
        super(
            "retracing_bolide",
            "逆飛びの流星",
            "逆飛び"
        );
    }


    newViewModel(type)
    {
        return new RetracingBolideViewModel(this, type);
    }
}


// 逆飛びの流星, ViewModel
export class RetracingBolideViewModel extends ArtifactViewModel
{
    constructor(parent, type)
    {
        super(parent, type);
        this.useEffect4 = ko.observable(true);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseRateShieldStrength.value += 0.35;

        if(this.bonusType == '4' && this.useEffect4()) {
            calc.baseNormalDmg.value += 0.4;
            calc.baseChargedDmg.value += 0.4;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                Widget.buildViewHTML(target, "ダメバフ", 
                    Widget.checkBoxViewHTML("useEffect4", "通常・重撃+40%ダメバフ")
                ));
        }

        return list;
    }


    toJS() {
        let obj = super.toJS();
        obj.useEffect4 = this.useEffect4();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.useEffect4(obj.useEffect4);
    }
}


// 氷風を彷徨う勇士
export class BlizzardStrayer extends ArtifactData
{
    constructor()
    {
        super(
            "blizzard_strayer",
            "氷風を彷徨う勇士",
            "氷風"
        );
    }


    newViewModel(type)
    {
        return new BlizzardStrayerViewModel(this, type);
    }
}


// 氷風を彷徨う勇士
export class BlizzardStrayerViewModel extends ArtifactViewModel
{
    constructor(parent, type)
    {
        super(parent, type);
        this.addCrtRate = ko.observable(0.2);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseCryoDmg.value += 0.15;

        if(this.bonusType == '4') {
            calc.baseCrtRate.value += Number(this.addCrtRate());
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                Widget.buildViewHTML(target, "会心率増加", 
                    Widget.selectViewHTML("addCrtRate", [
                        {value: 0, label: "+0%"},
                        {value: 0.2, label: "+20%（氷元素の影響のみ）"},
                        {value: 0.4, label: "+40%（凍結）"}
                    ])
                ));
        }

        return list;
    }


    toJS() {
        let obj = super.toJS();
        obj.addCrtRate = this.addCrtRate();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.addCrtRate(obj.addCrtRate);
    }
}


// 沈淪の心
export class HeartOfDepth extends ArtifactData
{
    constructor()
    {
        super(
            "heart_of_depth",
            "沈淪の心",
            "沈淪"
        );
    }


    newViewModel(type)
    {
        return new HeartOfDepthViewModel(this, type);
    }
}


// 沈淪の心
export class HeartOfDepthViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffEffect = ko.observable(true);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseHydroDmg.value += 0.15;

        if(this.bonusType == '4' && this.buffEffect()) {
            calc.baseNormalDmg.value += 0.3;
            calc.baseChargedDmg.value += 0.3;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(Widget.buildViewHTML(target, "ダメバフ（元素スキル後）",
                    Widget.checkBoxViewHTML("buffEffect", "通常・重撃+30%")
                ));
        }

        return list;
    }


    toJS() {
        let obj = super.toJS();
        obj.buffEffect = this.buffEffect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.buffEffect(obj.buffEffect);
    }
}


// 追憶のしめ縄
export class ShimenawaReminiscence extends ArtifactData
{
    constructor()
    {
        super(
            'shimenawa_reminiscence',
            "追憶のしめ縄",
            "しめ縄",
        );
    }


    newViewModel(type)
    {
        return new ShimenawaReminiscenceViewModel(this, type);
    }
}


// 追憶のしめ縄, ViewModel
export class ShimenawaReminiscenceViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffEffect = ko.observable(true);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.rateAtk.value += 0.18;

        if(this.bonusType == '4' && this.buffEffect()) {
            calc.baseNormalDmg.value += 0.5;
            calc.baseChargedDmg.value += 0.5;
            calc.basePlungeDmg.value += 0.5;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(Widget.buildViewHTML(target, "ダメバフ（元素エネ15消費）",
                    Widget.checkBoxViewHTML("buffEffect", "通常・重撃・落下+50%ダメバフ")
                ));
        }

        return list;
    }


    toJS() {
        let obj = super.toJS();
        obj.buffEffect = this.buffEffect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.buffEffect(obj.buffEffect);
    }
}


// 華館夢醒形骸記
export class HuskOfOpulentDreams extends ArtifactData
{
    constructor()
    {
        super(
            'husk_of_opulent_dreams',
            "華館夢醒形骸記",
            "華館",
        );
    }


    newViewModel(type)
    {
        return new HuskOfOpulentDreamsViewModel(this, type);
    }
}


// 華館夢醒形骸記
export class HuskOfOpulentDreamsViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffStacks = ko.observable(4);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.rateDef.value += 0.3;

        if(this.bonusType == '4') {
            calc.rateDef.value += 0.06 * Number(this.buffStacks());
            calc.baseGeoDmg.value += 0.06 * Number(this.buffStacks());
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                Widget.buildViewHTML(target, "防御&岩ダメバフ+6%/スタック",
                    Widget.selectViewHTML("buffStacks", [
                        {value: 0, label: "防御力+30%"},
                        {value: 1, label: "防御力+36%，岩ダメバフ+6%"},
                        {value: 2, label: "防御力+42%，岩ダメバフ+12%"},
                        {value: 3, label: "防御力+48%，岩ダメバフ+18%"},
                        {value: 4, label: "防御力+54%，岩ダメバフ+24%"},
                    ]))
                );
        }

        return list;
    }


    toJS() {
        let obj = super.toJS();
        obj.buffStacks = this.buffStacks();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.buffStacks(obj.buffStacks);
    }
}



export const artifacts = [
    new GladiatorsFinale(),
    new WanderersTroupe(),
    new CrimsonWitchOfFlames(),
    new RetracingBolide(),
    new BlizzardStrayer(),
    new HeartOfDepth(),
    new ShimenawaReminiscence(),
    new HuskOfOpulentDreams(),
];


export function lookupArtifact(id)
{
    let ret = undefined;
    artifacts.forEach(e => {
        if(e.id == id)
            ret = e;
    });

    return ret;
}


runUnittest(function(){
    console.assert(lookupArtifact("heart_of_depth").id == "heart_of_depth");
});



// statusType: "ATK%", "DEF%", "HP%", "Mastery", "Recharge", "PhyDmg", "ElmDmg", "CrtRate", "CrtDmg", "Heal"
export function applyDmgCalcArtifactMainStatus(calc, character, statusType)
{
    switch(statusType) {
        case "ATK%":
            calc.rateAtk.value += 0.466;
            break;

        case "DEF%":
            calc.rateDef.value += 0.583;
            break;

        case "HP%":
            calc.rateHP.value += 0.466;
            break;

        case "Mastery":
            calc.baseMastery.value += 187;
            break;

        case "Recharge":
            calc.baseRecharge.value += 0.518;
            break;

        case "PhyDmg":
            calc.basePhysicalDmg.value += 0.583;
            break;

        case "ElmDmg":
            switch(character.elem) {
                case "Anemo":
                    calc.baseAnemoDmg.value +=  0.466;
                    break;
                case "Cryo":
                    calc.baseCryoDmg.value +=  0.466;
                    break;
                case "Dendro":
                    calc.baseDendroDmg.value +=  0.466;
                    break;
                case "Electro":
                    calc.baseElectroDmg.value +=  0.466;
                    break;
                case "Geo":
                    calc.baseGeoDmg.value +=  0.466;
                    break;
                case "Hydro":
                    calc.baseHydroDmg.value +=  0.466;
                    break;
                case "Pyro":
                    calc.basePyroDmg.value +=  0.466;
                    break;
            }
            break;

        case "CrtRate":
            calc.baseCrtRate.value += 0.311;
            break;

        case "CrtDmg":
            calc.baseCrtDmg.value += 0.622;
            break;

        case "Heal":
            // calc.baseHeal.value += 0.359;
            break;

        default:
            console.log("Unknown value: ", e.value);
    }

    return calc;
}


