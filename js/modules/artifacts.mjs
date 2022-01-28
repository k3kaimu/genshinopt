import * as Calc from './dmg-calc.mjs';
import * as Widget from './widget.mjs';
import * as Utils from './utils.mjs';


export class ArtifactData
{
    constructor(id, name, abbr)
    {
        this.id = id;
        this.name = name;
        this.abbr = abbr;
    }


    newViewModel(bonusType)
    {
        return new ArtifactViewModel(this, bonusType);
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
        Calc.VGData.pushContext('Artifact');
        calc = this.applyDmgCalcImpl(calc);
        Calc.VGData.popContext();
        return calc;
    }


    applyDmgCalcImpl(calc)
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


// テスト用聖遺物
export class TestArtifact extends ArtifactData
{
    constructor()
    {
        super(
            "test_artifact",
            "テスト用聖遺物",
            "テスト",
        );
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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.rateAtk.value += 0.18;

        if(this.bonusType == 2)
            return calc;

        // when bonusType == 4 as follows:
        let ctx = Calc.VGData.context;
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalcGladiatorsFinale = class extends CalcType {
            normalDmgBuff() {
                if(this.character.weaponType == 'Sword'
                || this.character.weaponType == 'Claymore'
                || this.character.weaponType == 'Polearm') {
                    return super.normalDmgBuff().add(Calc.VGData.constant(0.35).as(ctx));
                } else {
                    return super.normalDmgBuff();
                }
            }
        }

        calc = Object.assign(new NewCalcGladiatorsFinale(), calc);
        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new GladiatorsFinale(),
        "Anemo",
        "Sword",
        {
            "vm": {
                "parent_id": "gladiators_finale",
                "bonusType": 4
            },
            "expected": {
                "normal_100": 234.40995000000004,
                "normal_elem_100": 234.40995000000004,
                "skill_100": 173.637,
                "burst_100": 173.637
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new GladiatorsFinale().newViewModel(4)
    ));
});



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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseMastery.value += 80;

        if(this.bonusType == 2)
            return calc;

        // when bonusType == 4 as follows:
        let ctx = Calc.VGData.context;
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalcWanderersTroupe = class extends CalcType {
            chargedDmgBuff() {
                if(this.character.weaponType == 'Catalyst'
                || this.character.weaponType == 'Bow') {
                    return super.chargedDmgBuff().add(Calc.VGData.constant(0.35).as(ctx));
                } else {
                    return super.chargedDmgBuff();
                }
            }
        }

        calc = Object.assign(new NewCalcWanderersTroupe(), calc);
        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new WanderersTroupe(),
        "Anemo",
        "Catalyst",
        {
            "vm": {
                "parent_id": "wanderers_troupe",
                "bonusType": 4
            },
            "expected": {
                "normal_100": 147.15,
                "normal_elem_100": 147.15,
                "skill_100": 147.15,
                "burst_100": 147.15
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new WanderersTroupe().newViewModel(4)
    ));
});


// 雷を鎮める尊者
export class Thundersoother extends ArtifactData
{
    constructor()
    {
        super(
            "thundersoother",
            "雷を鎮める尊者",
            "雷討",
        );
    }


    newViewModel(bonusType)
    {
        return new ThundersootherViewModel(this, bonusType);
    }
}


// 雷を鎮める尊者
export class ThundersootherViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.useEffect4 = ko.observable(true);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.bonusType == 4 && this.useEffect4()) {
            calc.baseAllDmg.value += 0.35;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                Widget.buildViewHTML(target, "ダメージバフ",
                    Widget.checkBoxViewHTML("useEffect4", "ダメージ+35%"))
                );
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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new Thundersoother(),
        "Anemo",
        "Catalyst",
        {
            "vm": {
                "parent_id": "thundersoother",
                "bonusType": 4,
                "useEffect4": true
            },
            "expected": {
                "normal_100": 198.65250000000003,
                "normal_elem_100": 198.65250000000003,
                "skill_100": 198.65250000000003,
                "burst_100": 198.65250000000003
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Thundersoother().newViewModel(4)
    ));
});


// 雷のような怒り
export class ThunderingFury extends ArtifactData
{
    constructor()
    {
        super(
            "thundering_fury",
            "雷のような怒り",
            "雷怒",
        );
    }


    newViewModel(bonusType)
    {
        return new ThunderingFuryViewModel(this, bonusType);
    }
}


// 雷のような怒り
export class ThunderingFuryViewModel extends ArtifactViewModel
{
    // TODO: 4セット効果のスキルクールタイム減少効果は未実装

    constructor(parent, bonusType)
    {
        super(parent, bonusType);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseElectroDmg.value += 0.15;

        if(this.bonusType == 4) {
            calc.baseOverloadedBonus.value += 0.40;
            calc.baseElectroChargedBonus.value += 0.40;
            calc.baseSuperconductBonus.value += 0.40;
        }

        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new ThunderingFury(),
        "Electro",
        "Catalyst",
        {
            "vm": {
                "parent_id": "thundering_fury",
                "bonusType": 4
            },
            "expected": {
                "normal_100": 147.15,
                "normal_elem_100": 169.2225,
                "skill_100": 169.2225,
                "burst_100": 169.2225
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new ThunderingFury().newViewModel(4)
    ));
});


// 烈火を渡る賢者
export class Lavawalker extends ArtifactData
{
    constructor()
    {
        super(
            "lavawalker",
            "烈火を渡る賢者",
            "火渡",
        );
    }


    newViewModel(bonusType)
    {
        return new LavawalkerViewModel(this, bonusType);
    }
}


// 烈火を渡る賢者
export class LavawalkerViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.useEffect4 = ko.observable(true);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.bonusType == 4 && this.useEffect4()) {
            calc.baseAllDmg.value += 0.35;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                Widget.buildViewHTML(target, "ダメージバフ",
                    Widget.checkBoxViewHTML("useEffect4", "ダメージ+35%"))
                );
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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new Lavawalker(),
        "Pyro",
        "Catalyst",
        {
            "vm": {
                "parent_id": "lavawalker",
                "bonusType": 4,
                "useEffect4": true
            },
            "expected": {
                "normal_100": 198.65250000000003,
                "normal_elem_100": 198.65250000000003,
                "skill_100": 198.65250000000003,
                "burst_100": 198.65250000000003
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Lavawalker().newViewModel(4)
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new CrimsonWitchOfFlames(),
        "Pyro",
        "Catalyst",
        {
            "vm": {
                "parent_id": "crimson_witch_of_flames",
                "bonusType": 4,
                "buffStacks": 3
            },
            "expected": {
                "normal_100": 147.15,
                "normal_elem_100": 202.33125,
                "skill_100": 202.33125,
                "burst_100": 202.33125
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new CrimsonWitchOfFlames().newViewModel(4)
    ));
});


// 旧貴族のしつけ
export class NoblesseOblige extends ArtifactData
{
    constructor()
    {
        super(
            'noblesse_oblige',
            "旧貴族のしつけ",
            "旧貴族",
        );
    }


    newViewModel(type)
    {
        return new NoblesseObligeViewModel(this, type);
    }
}


// 旧貴族のしつけ
export class NoblesseObligeViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.useEffect4 = ko.observable(true);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseBurstDmg.value += 0.20;

        if(this.bonusType == 4 && this.useEffect4()) {
            calc.rateAtk.value += 0.2;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                Widget.buildViewHTML(target, "爆発後バフ",
                    Widget.checkBoxViewHTML("useEffect4", "攻撃力+20%"))
                );
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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new NoblesseOblige(),
        "Pyro",
        "Catalyst",
        {
            "vm": {
                "parent_id": "noblesse_oblige",
                "bonusType": 4,
                "useEffect4": true
            },
            "expected": {
                "normal_100": 176.58,
                "normal_elem_100": 176.58,
                "skill_100": 176.58,
                "burst_100": 211.89600000000002
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new NoblesseOblige().newViewModel(4)
    ));
});


// 血染めの騎士道
export class BloodstainedChivalry extends ArtifactData
{
    constructor()
    {
        super(
            'bloodstained_chivalry',
            "血染めの騎士道",
            "血染",
        );
    }


    newViewModel(type)
    {
        return new BloodstainedChivalryViewModel(this, type);
    }
}


// 血染めの騎士道
export class BloodstainedChivalryViewModel extends ArtifactViewModel
{
    // TODO: 4セット効果のスタミナ消費減少は未対応

    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.useEffect4 = ko.observable(true);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.basePhysicalDmg.value += 0.25;

        if(this.bonusType == 4 && this.useEffect4()) {
            calc.baseChargedDmg.value += 0.5;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                Widget.buildViewHTML(target, "敵を倒した後のバフ",
                    Widget.checkBoxViewHTML("useEffect4", "重撃ダメージ+50%"))
                );
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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new BloodstainedChivalry(),
        "Pyro",
        "Catalyst",
        {
            "vm": {
                "parent_id": "bloodstained_chivalry",
                "bonusType": 4,
                "useEffect4": true
            },
            "expected": {
                "normal_100": 183.9375,
                "normal_elem_100": 147.15,
                "skill_100": 147.15,
                "burst_100": 147.15
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new BloodstainedChivalry().newViewModel(4)
    ));
});


// 悠久の磐岩
export class ArchaicPetra extends ArtifactData
{
    constructor()
    {
        super(
            'archaic_petra',
            "悠久の磐岩",
            "悠久",
        );
    }


    newViewModel(type)
    {
        return new ArchaicPetraViewModel(this, type);
    }
}


// 悠久の磐岩
export class ArchaicPetraViewModel extends ArtifactViewModel
{
    constructor(parent, type)
    {
        super(parent, type);
        this.useEffect4 = ko.observable(true);
        this.selectedElem = ko.observable('Character');
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseGeoDmg.value += 0.15;

        if(this.bonusType == 4 && this.useEffect4()) {
            // calc.baseChargedDmg.value += 0.5;
            let elem = this.selectedElem();
            if(elem == 'Character') {
                elem = calc.character.elem;
            }

            switch(elem) {
                case 'Anemo':
                case 'Geo':
                    break;

                case 'ALL':
                    calc.baseCryoDmg.value += 0.35;
                    calc.baseDendroDmg.value += 0.35;
                    calc.baseElectroDmg.value += 0.35;
                    calc.baseHydroDmg.value += 0.35;
                    calc.basePyroDmg.value += 0.35;
                    break;

                case 'Cryo':
                    calc.baseCryoDmg.value += 0.35;
                    break;
                case 'Dendro':
                    calc.baseDendroDmg.value += 0.35;
                    break;
                case 'Electro':
                    calc.baseElectroDmg.value += 0.35;
                    break;
                case 'Hydro':
                    calc.baseHydroDmg.value += 0.35;
                    break;
                case 'Pyro':
                    calc.basePyroDmg.value += 0.35;
                    break;
                default:
                    console.assert(0, elem);
            }
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                Widget.buildViewHTML(target, "元素ダメージバフ",
                    Widget.checkBoxViewHTML("useEffect4", "特定元素のダメージ+35%")
                    +
                    Widget.selectViewHTML("selectedElem", [
                        {value: 'ALL', label: '全元素（岩/風以外）'},
                        {value: 'Character', label: 'キャラ元素（岩/風以外）'},
                        {value: 'Cryo', label: '氷元素'},
                        {value: 'Electro', label: '雷元素'},
                        {value: 'Pyro', label: '炎元素'},
                        {value: 'Hydro', label: '水元素'},
                        {value: 'Dendro', label: '草元素'},
                    ], undefined, {"disable": "!useEffect4()"})
                    ));
        }

        return list;
    }


    toJS() {
        let obj = super.toJS();
        obj.useEffect4 = this.useEffect4();
        obj.selectedElem = this.selectedElem();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.useEffect4(obj.useEffect4);
        this.selectedElem(obj.selectedElem);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new ArchaicPetra(),
        "Geo",
        "Catalyst",
        {
            "vm": {
                "parent_id": "archaic_petra",
                "bonusType": 4,
                "useEffect4": true,
                "selectedElem": "Character"
            },
            "expected": {
                "normal_100": 147.15,
                "normal_elem_100": 169.2225,
                "skill_100": 169.2225,
                "burst_100": 169.2225
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new ArchaicPetra().newViewModel(4)
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new RetracingBolide(),
        "Geo",
        "Catalyst",
        {
            "vm": {
                "parent_id": "retracing_bolide",
                "bonusType": 4,
                "useEffect4": true
            },
            "expected": {
                "normal_100": 206.01,
                "normal_elem_100": 206.01,
                "skill_100": 147.15,
                "burst_100": 147.15
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new RetracingBolide().newViewModel(4)
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new BlizzardStrayer(),
        "Cryo",
        "Catalyst",
        {
            "vm": {
                "parent_id": "blizzard_strayer",
                "bonusType": 4,
                "addCrtRate": 0.2
            },
            "expected": {
                "normal_100": 163.35,
                "normal_elem_100": 187.8525,
                "skill_100": 187.8525,
                "burst_100": 187.8525
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new BlizzardStrayer().newViewModel(4)
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new HeartOfDepth(),
        "Hydro",
        "Catalyst",
        {
            "vm": {
                "parent_id": "heart_of_depth",
                "bonusType": 4,
                "buffEffect": true
            },
            "expected": {
                "normal_100": 191.29500000000002,
                "normal_elem_100": 213.3675,
                "skill_100": 169.2225,
                "burst_100": 169.2225
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new HeartOfDepth().newViewModel(4)
    ));
});


// 蒼白の炎
export class PaleFlame extends ArtifactData
{
    constructor()
    {
        super(
            "pale_flame",
            "蒼白の炎",
            "蒼白"
        );
    }


    newViewModel(type)
    {
        return new PaleFlameViewModel(this, type);
    }
}


// 蒼白の炎
export class PaleFlameViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffStacks = ko.observable(2);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.basePhysicalDmg.value += 0.25;

        if(this.bonusType == 4) {
            if(this.buffStacks() == 1) {
                calc.rateAtk.value += 0.09;
            } else if(this.buffStacks() == 2) {
                calc.rateAtk.value += 0.18;
                calc.basePhysicalDmg.value += 0.25;
            }
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == 4) {
            list.push(
                Widget.buildViewHTML(target, "スキル命中によるバフ",
                    Widget.selectViewHTML("buffStacks", [
                        {label: "物理ダメージ+25%", value: 0},
                        {label: "物理ダメージ+25%, 攻撃力+9%", value: 1},
                        {label: "物理ダメージ+50%, 攻撃力+18%", value: 2},
                    ])
            ));
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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new PaleFlame(),
        "Hydro",
        "Catalyst",
        {
            "vm": {
                "parent_id": "pale_flame",
                "bonusType": 4,
                "buffStacks": 2
            },
            "expected": {
                "normal_100": 260.4555,
                "normal_elem_100": 173.637,
                "skill_100": 173.637,
                "burst_100": 173.637
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new PaleFlame().newViewModel(4)
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new ShimenawaReminiscence(),
        "Hydro",
        "Catalyst",
        {
            "vm": {
                "parent_id": "shimenawa_reminiscence",
                "bonusType": 4,
                "buffEffect": true
            },
            "expected": {
                "normal_100": 260.4555,
                "normal_elem_100": 260.4555,
                "skill_100": 173.637,
                "burst_100": 173.637
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new ShimenawaReminiscence().newViewModel(4)
    ));
});


// 絶縁の旗印
export class EmblemOfSeveredFate extends ArtifactData
{
    constructor()
    {
        super(
            'emblem_of_severed_fate',
            "絶縁の旗印",
            "絶縁",
        );
    }


    newViewModel(type)
    {
        return new EmblemOfSeveredFateViewModel(this, type);
    }
}


// 絶縁の旗印
export class EmblemOfSeveredFateViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseRecharge.value += 0.2;

        if(this.bonusType == '4') {
            let ctx = Calc.VGData.context;
            let CalcType = Object.getPrototypeOf(calc).constructor;
            let NewCalc = class extends CalcType {
                burstDmgBuff(attackProps) {
                    let val = super.burstDmgBuff(attackProps);
                    let rec = this.recharge(attackProps);

                    return val.add(rec.mul(0.25).min_number(0.75).as(ctx));
                }
            };

            calc = Object.assign(new NewCalc(), calc);
        }

        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new EmblemOfSeveredFate(),
        "Hydro",
        "Catalyst",
        {
            "vm": {
                "parent_id": "emblem_of_severed_fate",
                "bonusType": 4
            },
            "expected": {
                "normal_100": 147.15,
                "normal_elem_100": 147.15,
                "skill_100": 147.15,
                "burst_100": 191.29500000000002
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new EmblemOfSeveredFate().newViewModel(4)
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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

runUnittest(function(){
    console.assert(Utils.checkUnittestForArtifact(
        new HuskOfOpulentDreams(),
        "Hydro",
        "Catalyst",
        {
            "vm": {
                "parent_id": "husk_of_opulent_dreams",
                "bonusType": 4,
                "buffStacks": 4
            },
            "expected": {
                "normal_100": 147.15,
                "normal_elem_100": 147.15,
                "skill_100": 147.15,
                "burst_100": 147.15
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new HuskOfOpulentDreams().newViewModel(4)
    ));
});



export const artifacts = [
    new GladiatorsFinale(),
    new WanderersTroupe(),
    new Thundersoother(),
    new ThunderingFury(),
    new Lavawalker(),
    new CrimsonWitchOfFlames(),
    new NoblesseOblige(),
    new BloodstainedChivalry(),
    new ArchaicPetra(),
    new RetracingBolide(),
    new BlizzardStrayer(),
    new HeartOfDepth(),
    new PaleFlame(),
    new ShimenawaReminiscence(),
    new EmblemOfSeveredFate(),
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
    Calc.VGData.pushContext('Artifact');
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
            calc.baseHealingBonus.value += 0.359;
            break;

        default:
            console.log("Unknown value: ", e.value);
    }

    Calc.VGData.popContext();
    return calc;
}


