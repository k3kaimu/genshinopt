//@ts-check
/// <reference path="../../main.js" />
import * as Calc from '../dmg-calc.mjs';
import * as Widget from '../widget.mjs';
import * as TypeDefs from '../typedefs.mjs';
import * as Utils from "../utils.mjs";


/**
 * @typedef {{
 *  id: string;
 *  label: string;
 *  ref?: TypeDefs.DynamicStatusType;
 *  dmgScale?: (vm: CharacterViewModel) => (number | number[]) | (number | number[])[];
 *  attackProps?: Object;
 *  list?: {dmgScale: (vm: CharacterViewModel) => (number | number[]) | (number | number[])[], attackProps: Object, ref?: TypeDefs.DynamicStatusType}[];
 *  newEvaluator?: (vm: CharacterViewModel, obj: PresetAttackObject) => AttackEvaluator;
 *  func?: (calc: Calc.DamageCalculator, vm: CharacterViewModel) => (number | Calc.VGData);
 * }} PresetAttackObject
 */


export class CharacterData
{
    /**
     * @param {string} id
     * @param {string} name
     * @param {4 | 5} rarity
     * @param {TypeDefs.Element} elem
     * @param {TypeDefs.WeaponType} weaponType
     * @param {number | number[]} bAtk
     * @param {number | number[]} bDef
     * @param {number | number[]} bHP
     * @param {TypeDefs.StaticStatusType} bBonusType
     * @param {number} bBonusValue
     */
    constructor(id, name, rarity, elem, weaponType, bAtk, bDef, bHP, bBonusType, bBonusValue) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;   // 5 or 4

        /*
        Anemo, Cryo, Dendro, Electro, Geo, Hydro, Pyro
        */
        this.elem = elem;
        console.assert(this.elem == "Anemo" || this.elem == "Cryo" || this.elem == "Dendro"
                    || this.elem == "Electro" || this.elem == "Geo" || this.elem == "Hydro"
                    || this.elem == "Pyro" );

        /*
        Sword, Claymore, Polearm, Catalyst, Bow
        */
        this.weaponType = weaponType;
        console.assert(this.weaponType == "Sword" || this.weaponType == "Claymore" || this.weaponType == "Polearm"
                    || this.weaponType == "Catalyst" || this.weaponType == "Bow");

        this.baseAtk = new CharacterBaseStats(this.id, this.rarity, "ATK", bAtk);
        this.rateAtk = 0;
        this.baseDef = new CharacterBaseStats(this.id, this.rarity, "DEF", bDef);        
        this.rateDef = 0;
        this.baseHP = new CharacterBaseStats(this.id, this.rarity, "HP", bHP);
        this.rateHP = 0;

        this.baseCrtRate = 0.05;
        this.baseCrtDmg = 0.5;

        this.baseAnemoDmg = 0;
        this.baseGeoDmg = 0;
        this.baseElectroDmg = 0;
        this.basePyroDmg = 0;
        this.baseHydroDmg = 0;
        this.baseCryoDmg = 0;
        this.baseDendroDmg = 0;
        this.basePhysicalDmg = 0;

        this.baseRecharge = 1;      // 元素チャージ効率 
        this.baseMastery = 0;       // 元素熟知
        this.baseHealingBonus = 0;
        
        this[bBonusType] += bBonusValue;
    }


    newViewModel()
    {
        // @ts-ignore
        return new CharacterViewModel(this);
    }


    /**
     * @type {PresetAttackObject[]}
     */
    static presetAttacks = [
        {
            id: 'normal_100',
            label: "通常攻撃（100%）",
            dmgScale(vm){ return 1; },  // たとえば「通常攻撃1段目～5段目」のように，攻撃が複数の場合には配列を返す
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "normal_skill",
            label: "通常攻撃＋スキル",
            list: [
                {
                    dmgScale(vm) { return 1; },
                    attackProps: { isNormal: true, isPhysical: true }
                },
                {
                    dmgScale(vm) { return 1; },
                    attackProps: { isSkill: true, isPhysical: true }
                },
            ]
        }
    ];
}


export class AttackEvaluator
{
    /**
     * @param {string} id
     * @param {string} label
     */
    constructor(id, label)
    {
        this.id = id;
        this.label = label;

        /** @type {Calc.AttackInfo[]} */
        this.cachedInfos = undefined;
    }


    /**
     * @param {Calc.DamageCalculator} calc
     */
    evaluate(calc, additionalProps = {})
    {
        return this.evaluateWithCache(calc, additionalProps);
    }


    /**
     * @param {Calc.DamageCalculator} calc 
     * @param {Object} additionalProps 
     * @returns {Calc.AttackInfo[]}
     */
    attackInfos(calc, additionalProps = {})
    {
        return [];
    }


    /**
     * ステータスを評価して返します
     * @param {Calc.DamageCalculator} calc 
     * @param {Object} additionalProps 
     * @param {TypeDefs.DynamicStatusType[]} statusList 
     * @returns {Object<TypeDefs.DynamicStatusType, Calc.VGData[]>}
     */
    evaluateStatus(calc, additionalProps = {}, statusList)
    {
        /** @type {Calc.AttackInfo[]} */
        let infos = this.getAllCompressedAttackInfos(calc, this.attackInfos(calc, additionalProps), "strong");

        let ret = {};
        statusList.forEach(st => {
            let values = infos.map(info => calc[st](info.props));
            values = uniqueArray(values, (/** @type {Calc.VGData} */ a, /** @type {Calc.VGData} */ b) => isApproxEqual(a.value, b.value, 1e-4, undefined));
            ret[st] = values.sort((a, b) => a - b);
        });

        return ret;
    }


    /**
     * すべてのAttackPropsを返します．計算を高速化するために内部でキャッシュを持ちます
     * @param {Calc.DamageCalculator} calc
     * @param {Calc.AttackInfo[]} attackInfos
     * @param {"strong" | "weak" | "none"} level
     * @returns {Calc.AttackInfo[]}
     */
    getAllCompressedAttackInfos(calc, attackInfos, level = "strong") {
        if(this.hasCache())
            return this.cachedInfos;

        let infos = calc.getAllAttackInfos(attackInfos);
        if(this.cachedInfos !== undefined && this.cachedInfos.length == 0) {
            // キャッシュしてよいかどうか確認する
            // すべてのprobが定数であればキャッシュしてよい

            let check = true;
            infos.forEach(info => {
                if(!info.prob.isConstant())
                    check = false;
            });

            if(check) {
                // すべて定数だったのでキャッシュする
                // levelがnoneの場合は圧縮しない
                if(level !== "none")
                    infos = Calc.compressAttackInfos(infos, level, calc);

                this.cachedInfos = infos;
            } else {
                // optimizedModeをやめる
                this.cachedInfos = undefined;
            }
        }

        return infos;
    }


    /**
     * @param {any} flag
     */
    setOptimizedMode(flag) {
        if(flag)
            this.cachedInfos = [];
        else
            this.cachedInfos = undefined;
    }


    clearInfoCache() {
        if(this.cachedInfos !== undefined)
            this.cachedInfos = [];
    }


    hasCache() {
        if(this.cachedInfos != undefined && this.cachedInfos.length > 0)
            return true;
        else
            return false;
    }


    /**
     * @param {Calc.DamageCalculator} calc
     */
    evaluateWithCache(calc, additionalProps = {}) {
        /** @type {Calc.AttackInfo[]} */
        let infos;
        if(this.hasCache()) {
            infos = this.cachedInfos;
        } else {
            infos = this.attackInfos(calc, additionalProps);
            infos = this.getAllCompressedAttackInfos(calc, infos);
        }

        let dmg = Calc.VGData.zero();
        infos.forEach(info => {
            dmg = dmg.add(calc.calculate(info).total().mul(info.prob));
        });
        
        return dmg;
    }
}


export class PresetAttackEvaluator extends AttackEvaluator
{
    /**
     * @function
     * @param {number} scale
     * @type {(arg0: any) => any}
     */
    dmgScale;
    
    /**
     * @type {Object}
     */
    attackProps;

    /**
     * @type {string}
     */
    ref;

    /**
     * @param {CharacterViewModel} vm
     * @param {PresetAttackObject} presetAttackObject
     */
    constructor(vm, presetAttackObject)
    {
        super(presetAttackObject.id, presetAttackObject.label);
        this.cvm = vm;      // ViewModel of character 
        this.dmgScale = presetAttackObject.dmgScale;
        this.attackProps = presetAttackObject.attackProps;
        
        if("ref" in presetAttackObject)
            this.ref = presetAttackObject.ref;
        else
            this.ref = "atk";
    }


    /**
     * @param {Calc.DamageCalculator} calc
     */
    attackInfos(calc, additionalProps = {})
    {
        return [this.dmgScale(this.cvm)].flat(10).map(s => {
                return new Calc.AttackInfo(s, this.ref, {...additionalProps, ...this.attackProps}, 1);
        });
    }
}


export class CompoundedPresetAttackEvaluator extends AttackEvaluator
{
    /**
     * @param {CharacterViewModel} vm
     * @param {PresetAttackObject} presetAttackObject
     */
    constructor(vm, presetAttackObject)
    {
        super(presetAttackObject.id, presetAttackObject.label);
        this.cvm = vm;
        this.list = presetAttackObject.list;

        // 先頭のみを継承する
        this.attackProps = presetAttackObject.list[0].attackProps;
    }


    /**
     * @param {Calc.DamageCalculator} calc
     */
    attackInfos(calc, additionalProps = {})
    {
        return this.list.map(e => {
            let scales = [e.dmgScale(this.cvm)].flat(10);

            let ref = "atk";
            if("ref" in e)
                ref = e.ref;

            return scales.map(s => {
                return new Calc.AttackInfo(s, ref, {...additionalProps, ...e.attackProps}, 1);
            });
        }).flat(10);
    }
}


export class FunctionAttackEvaluator extends AttackEvaluator
{
    /**
     * @param {CharacterViewModel} vm
     * @param {PresetAttackObject} presetAttackObject
     */
    constructor(vm, presetAttackObject)
    {
        super(presetAttackObject.id, presetAttackObject.label);

        this.cvm = vm;
        if(presetAttackObject.attackProps)
            this.attackProps = presetAttackObject.attackProps;
        else
            this.attackProps = {};

        this.func = presetAttackObject.func;
    }


    attackInfos()
    {
        return [new Calc.AttackInfo(0, "", {}, 1)];
    }


    /**
     * @param {Calc.DamageCalculator} calc 
     */
    evaluate(calc, additionalProps = {})
    {
        let v = this.func(calc, this.cvm);
        if(typeof v == "number")
            v = Calc.VGData.constant(v);

        return v;
    }
}


class CharacterViewModelImpl
{
    /**
     * @param {CharacterData} ch
     */
    constructor(ch)
    {
        this.parent = ch;
        this.level = ko.observable("90");           // レベル．未突破80レベルは"80"，突破済み80レベルは"80+"
        this.constell = ko.observable(0);           // 凸数, 無凸==0
        this.normalRank = ko.observable(9);         // 通常天賦
        this.skillRank = ko.observable(9);          // スキル天賦
        this.burstRank = ko.observable(9);          // 爆発天賦
    }


    maxNormalTalentRank() { return 11; }
    maxSkillTalentRank() { return 10; }
    maxBurstTalentRank() { return 10; }


    normalTalentRow() { return Object.getPrototypeOf(this.parent).constructor.normalTalentTable[this.normalRank()-1]; }
    skillTalentRow() { return Object.getPrototypeOf(this.parent).constructor.skillTalentTable[this.skillRank()-1]; }
    burstTalentRow() { return Object.getPrototypeOf(this.parent).constructor.burstTalentTable[this.burstRank()-1]; }


    /**
     * @param {Calc.DamageCalculator} calc
     */
    applyDmgCalc(calc)
    {
        Calc.VGData.pushContext('Character');
        calc = this.applyDmgCalcImpl(calc);
        Calc.VGData.popContext();
        return calc;
    }


    /**
     * @param {Calc.DamageCalculator} calc
     * @returns {Calc.DamageCalculator}
     */
    applyDmgCalcImpl(calc)
    {
        let strLv = this.level();
        let parsedLv = Utils.parseStrLevel(strLv);

        calc.character = this.parent;
        calc.characterLv = Utils.parseStrLevel(this.level()).level;

        calc.baseAtk.value += this.parent.baseAtk.atLv(strLv);
        calc.rateAtk.value += this.parent.rateAtk * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.baseDef.value += this.parent.baseDef.atLv(strLv);
        calc.rateDef.value += this.parent.rateDef * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.baseHP.value += this.parent.baseHP.atLv(strLv);
        calc.rateHP.value += this.parent.rateHP * ascensionAdditionalStatusMultiplier[parsedLv.rank];

        calc.baseCrtRate.value += this.parent.baseCrtRate * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.baseCrtDmg.value += this.parent.baseCrtDmg * ascensionAdditionalStatusMultiplier[parsedLv.rank];

        calc.baseAnemoDmg.value += this.parent.baseAnemoDmg * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.baseGeoDmg.value += this.parent.baseGeoDmg * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.baseElectroDmg.value += this.parent.baseElectroDmg * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.basePyroDmg.value += this.parent.basePyroDmg * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.baseHydroDmg.value += this.parent.baseHydroDmg * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.baseCryoDmg.value += this.parent.baseCryoDmg * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.baseDendroDmg.value += this.parent.baseDendroDmg * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.basePhysicalDmg.value += this.parent.basePhysicalDmg * ascensionAdditionalStatusMultiplier[parsedLv.rank];

        calc.baseRecharge.value += this.parent.baseRecharge * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.baseMastery.value += this.parent.baseMastery * ascensionAdditionalStatusMultiplier[parsedLv.rank];
        calc.baseHealingBonus.value += this.parent.baseHealingBonus * ascensionAdditionalStatusMultiplier[parsedLv.rank];

        return calc;
    }


    // typeof(return): string[]
    /**
     * @param {string} target
     */
    viewHTMLList(target){
        return [];
    }


    /**
     * @returns {AttackEvaluator[]}
     */
    presetAttacks() {
        /** @type {PresetAttackObject[]} */
        let attacks = Object.getPrototypeOf(this.parent).constructor.presetAttacks;
        let ret = [];
        attacks.forEach(a => {
            if("newEvaluator" in a)
                ret.push(a.newEvaluator(this, a));
            else if("list" in a)
                ret.push(new CompoundedPresetAttackEvaluator(this, a));
            else if("func" in a)
                ret.push(new FunctionAttackEvaluator(this, a));
            else
                ret.push(new PresetAttackEvaluator(this, a));
        });

        return ret;
    }


    /**
     * @returns {Object}
     */
    toJS() {
        let obj = {};
        obj.level = this.level();
        obj.parent_id  = this.parent.id;
        obj.constell   = this.constell();
        obj.normalRank = this.normalRank();
        obj.skillRank  = this.skillRank();
        obj.burstRank  = this.burstRank();
        return obj;
    }


    /**
     * @param {Object} obj
     */
    fromJS(obj) {
        this.level(obj.level || "90");
        this.constell(obj.constell);
        this.normalRank(obj.normalRank);
        this.skillRank(obj.skillRank);
        this.burstRank(obj.burstRank);
    }
}


export let AddTalentRegister = (/** @type {typeof CharacterViewModelImpl} */ Base) => class extends Base {
    /**
     * @type {TypeDefs.TalentDefinition[]}
     */
    talents = [];

    /**
     * @param {TypeDefs.TalentDefinition} obj 
     */
    registerTalent(obj) {
        this.talents.push(obj);
        obj.uiList?.forEach(e => {
            if(e == undefined) return;

            if(e.name && !(e.name in this))
                this[e.name] = ko.observable(e.init);
        });
    }


    /**
     * @param {Calc.DamageCalculator} calc
     */
    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        this.talents.forEach(talent => {
            if(talent.requiredC > this.constell() || talent.effect == undefined)
                return;

            calc = calc.applyEffect(talent.effect, this);
        });

        return calc;
    }


    /**
     * @param {string} target
     */
    viewHTMLList(target) {
        let list = {
            "Other": [],
            "Skill": [],
            "Burst": [],
        };

        this.talents.forEach(talent => {
            if(talent.requiredC > this.constell())
                return;

            let str = "";
            talent.uiList?.forEach(e => {
                if(e == undefined) return;
                let uistr = Widget.buildUIItem(e, this);
                if(uistr !== undefined)
                    str += uistr;
            });

            if(str.length != 0)
                list[talent.type].push(str);
        });

        let ret = super.viewHTMLList(target).slice(0);

        if(list["Skill"].length)
            ret.push(Widget.buildViewHTML(target, "元素スキル関連効果", list["Skill"].join("<hr>")));

        if(list["Burst"].length)
            ret.push(Widget.buildViewHTML(target, "元素爆発関連効果", list["Burst"].join("<hr>")));

        if(list["Other"].length)
            ret.push(Widget.buildViewHTML(target, "その他効果", list["Other"].join("<hr>")));

        return ret;
    }


    toJS()
    {
        let obj = super.toJS();

        this.talents.forEach(talent => {
            talent.uiList?.forEach(e => {
                if(e == undefined) return;

                if(e.name)
                    obj[e.name] = this[e.name]();
            });
        });

        return obj;
    }


    /**
     * @param {{ [x: string]: any; }} obj
     */
    fromJS(obj)
    {
        super.fromJS(obj);

        this.talents.forEach(talent => {
            talent.uiList?.forEach(e => {
                if(e == undefined) return;

                if(e.name)
                    this[e.name](obj[e.name] ?? e.init);
            });
        });
    }
};


/**
 * @typedef {CharacterViewModelImpl} CharacterViewModel
 */
export let CharacterViewModel = AddTalentRegister(CharacterViewModelImpl);


// テスト用キャラクター
export class TestCharacter extends CharacterData
{
    /**
     * @param {string} elem
     * @param {string} type
     */
    constructor(elem, type)
    {
        super(
            "test_character",
            "テスト用キャラクター",
            4,
            elem,
            type,
            [10, 20, 40, 50, 60, 70, 80, 100],                  /* bAtk */
            [60, 80, 100, 120, 140, 160, 180, 200],             /* bDef */
            [800, 2000, 4000, 5000, 7000, 8000, 9000, 10000],   /* bHP */
            "baseCrtDmg",   /* bBonusType */
            0.100           /* bBonusValue */
        );

        // 強制的にレベル90でのステータスを設定する
        this.baseAtk.ascv = 0;
        this.baseAtk.lv01 = 100 / characterBaseStatsLevelMultiplier[89][0];
        this.baseDef.ascv = 0;
        this.baseDef.lv01 = 200 / characterBaseStatsLevelMultiplier[89][0];
        this.baseHP.ascv = 0;
        this.baseHP.lv01 = 10000 / characterBaseStatsLevelMultiplier[89][0];
    }


    newViewModel()
    {
        return new TestCharacterViewModel(this);
    }
}


// テスト用キャラクター
export class TestCharacterViewModel extends CharacterViewModel
{
    /**
     * @param {CharacterData} parent
     */
    constructor(parent)
    {
        super(parent);
    }


    makeIsElementTrue()
    {
        switch(this.parent.elem) {
            case 'Anemo':
                return {isAnemo: true};
            case 'Cryo':
                return {isCryo: true};
            case 'Dendro':
                return {isDendro: true};
            case 'Electro':
                return {isElectro: true};
            case 'Geo':
                return {isGeo: true};
            case 'Hydro':
                return {isHydro: true};
            case 'Pyro':
                return {isPyro: true};
        }

        return {};
    }


    presetAttacks() {
        /** @type {PresetAttackObject[]} */
        let attacks = Object.getPrototypeOf(this.parent).constructor.presetAttacks.slice(0, 1);
        attacks.push(
        {
            id: 'normal_elem_100',
            label: "通常元素攻撃（100%）",
            /**
             * @param {any} vm
             */
            dmgScale(vm){ return 1; },
            attackProps: { isNormal: true, ...this.makeIsElementTrue() }
        },
        {
            id: 'skill_100',
            label: "元素スキル（100%）",
            /**
             * @param {any} vm
             */
            dmgScale(vm){ return 1; },
            attackProps: { isSkill: true, ...this.makeIsElementTrue() }
        },
        {
            id: 'burst_100',
            label: "元素爆発（100%）",
            /**
             * @param {any} vm
             */
            dmgScale(vm){ return 1; },
            attackProps: { isBurst: true, ...this.makeIsElementTrue() }
        });

        let ret = [];
        attacks.forEach(a => {
            if("newEvaluator" in a)
                ret.push(a.newEvaluator(this, a));
            else
                ret.push(new PresetAttackEvaluator(this, a));
        });

        return ret;
    }
}


/**
 * Character Base Stats Level Multiplier from: https://genshin-impact.fandom.com/wiki/Level_Scaling/Character#Level_Multiplier
 * @type {number[][]}
 */
export const characterBaseStatsLevelMultiplier = [
    // 0:星4, 1:星5
    [1.000, 1.000],
    [1.083, 1.083],
    [1.165, 1.166],
    [1.248, 1.250],
    [1.330, 1.333],
    [1.413, 1.417],
    [1.495, 1.500],
    [1.578, 1.584],
    [1.661, 1.668],
    [1.743, 1.751],
    [1.826, 1.835],
    [1.908, 1.919],
    [1.991, 2.003],
    [2.073, 2.088],
    [2.156, 2.172],
    [2.239, 2.256],
    [2.321, 2.341],
    [2.404, 2.425],
    [2.486, 2.510],
    [2.569, 2.594],
    [2.651, 2.679],
    [2.734, 2.764],
    [2.817, 2.849],
    [2.899, 2.934],
    [2.982, 3.019],
    [3.064, 3.105],
    [3.147, 3.190],
    [3.229, 3.275],
    [3.312, 3.361],
    [3.394, 3.446],
    [3.477, 3.532],
    [3.560, 3.618],
    [3.642, 3.704],
    [3.725, 3.789],
    [3.807, 3.875],
    [3.890, 3.962],
    [3.972, 4.048],
    [4.055, 4.134],
    [4.138, 4.220],
    [4.220, 4.307],
    [4.303, 4.393],
    [4.385, 4.480],
    [4.468, 4.567],
    [4.550, 4.653],
    [4.633, 4.740],
    [4.716, 4.827],
    [4.798, 4.914],
    [4.881, 5.001],
    [4.963, 5.089],
    [5.046, 5.176],
    [5.128, 5.263],
    [5.211, 5.351],
    [5.294, 5.438],
    [5.376, 5.526],
    [5.459, 5.614],
    [5.541, 5.702],
    [5.624, 5.790],
    [5.706, 5.878],
    [5.789, 5.966],
    [5.872, 6.054],
    [5.954, 6.142],
    [6.037, 6.230],
    [6.119, 6.319],
    [6.202, 6.407],
    [6.284, 6.496],
    [6.367, 6.585],
    [6.450, 6.673],
    [6.532, 6.762],
    [6.615, 6.851],
    [6.697, 6.940],
    [6.780, 7.029],
    [6.862, 7.119],
    [6.945, 7.208],
    [7.028, 7.297],
    [7.110, 7.387],
    [7.193, 7.476],
    [7.275, 7.566],
    [7.358, 7.656],
    [7.440, 7.746],
    [7.523, 7.836],
    [7.606, 7.926],
    [7.688, 8.016],
    [7.771, 8.106],
    [7.853, 8.196],
    [7.936, 8.286],
    [8.018, 8.377],
    [8.101, 8.467],
    [8.183, 8.558],
    [8.266, 8.649],
    [8.349, 8.739],
];


/**
 * Character Base Stats @ Lv.1 from: https://genshin-impact.fandom.com/wiki/Level_Scaling/Character#Base_Value
 * @type {Object}
 */
export const characterBaseStatsAtLv1 = 
{
    // 0:HP, 1:ATK, 2:DEF
    albedo: [1029.6, 19.6, 68.2],
    amber: [793.3, 18.7, 50.4],
    barbara: [820.6, 13.4, 56.1],
    beidou: [1094.1, 18.9, 54.4],
    bennett: [1039.4, 16.0, 64.7],
    chongyun: [920.9, 18.7, 54.4],
    diluc: [1010.5, 26.1, 61.0],
    diona: [802.4, 17.8, 50.4],
    eula: [1029.6, 26.6, 58.5],
    fischl: [770.5, 20.5, 49.8],
    ganyu: [762.7, 26.1, 49.1],
    hu_tao: [1210.7, 8.3, 68.2],
    jean: [1144.0, 18.6, 59.8],
    kaedehara_kazuha: [1039.1, 23.1, 62.8],
    kaeya: [975.6, 18.7, 66.4],
    kamisato_ayaka: [1001.0, 26.6, 61.0],
    keqing: [1020.1, 25.1, 62.2],
    klee: [800.8, 24.2, 47.9],
    lisa: [802.4, 19.4, 48.1],
    mona: [810.3, 22.3, 50.9],
    ningguang: [820.6, 17.8, 48.1],
    noelle: [1012.1, 16.0, 67.0],
    qiqi: [962.9, 22.3, 71.8],
    razor: [1003.0, 19.6, 62.9],
    rosaria: [1030.3, 20.12, 59.5],
    sucrose: [775.0, 14.2, 58.9],
    sayu: [993.9, 20.5, 62.4],
    tartaglia: [1020.1, 23.5, 63.4],
    traveler: [911.8, 17.8, 57.2],
    venti: [819.9, 20.5, 52.1],
    xiangling: [911.8, 18.9, 56.1],
    xiao: [991.5, 27.2, 62.2],
    xingqiu: [857.1, 16.9, 63.5],
    xinyan: [939.1, 20.8, 67.0],
    yanfei: [784.1, 20.1, 49.2],
    yoimiya: [791.3, 25.1, 47.9],
    zhongli: [1144.0, 19.6, 57.4]
};


/**
 * Character Max Ascension Bonus from https://genshin-impact.fandom.com/wiki/Level_Scaling/Character#Ascension_Value
 * @type {Object}
 */
export const characterMaxAscensionBonus = {
    // 0:HP, 1:ATK, 2:DEF
    albedo: [4228.0, 80.3, 280.1],
    amber: [2838.3, 66.9, 180.2],
    barbara: [2936.1, 47.8, 200.7],
    beidou: [3914.8, 67.5, 194.5],
    bennett: [3719.1, 57.3, 231.4],
    chongyun: [3295.0, 66.9, 194.5],
    diluc: [4149.7, 107.0, 250.6],
    diona: [2870.9, 63.7, 180.2],
    eula: [4228.0, 109.3, 240.0],
    fischl: [2756.7, 73.3, 178.1],
    ganyu: [3131.9, 107.0, 201.5],
    hu_tao: [4971.9, 34.0, 280.1],
    jean: [4697.8, 76.5, 245.7],
    kaedehara_kazuha: [4267.2, 94.8, 258.0],
    kaeya: [3490.7, 66.9, 237.5],
    kamisato_ayaka: [4110.6, 109.3, 250.6],
    keqing: [4188.9, 103.2, 255.5],
    klee: [3288.5, 99.4, 196.6],
    lisa: [2870.9, 69.5, 172.0],
    mona: [3327.6, 91.7, 208.8],
    ningguang: [2936.1, 63.7, 172.0],
    noelle: [3621.2, 57.3, 239.6],
    qiqi: [3954.0, 91.7, 294.8],
    razor: [3588.6, 70.1, 225.2],
    rosaria: [3686.5, 72.0, 212.9],
    sucrose: [2773.0, 51.0, 210.9],
    sayu: [3556.0, 73.3, 223.4],
    tartaglia: [4188.9, 96.3, 260.4],
    traveler: [3262.4, 63.7, 204.8],
    venti: [3366.8, 84.1, 213.8],
    xiangling: [3262.4, 67.5, 200.7],
    xiao: [4071.4, 111.6, 255.5],
    xingqiu: [3066.6, 60.5, 227.3],
    xinyan: [3360.2, 74.6, 239.6],
    yanfei: [2805.6, 72.0, 176.1],
    yoimiya: [3249.3, 103.2, 196.5],
    zhongli: [4697.8, 80.3, 235.9],
};



/**
 * 突破によるステータスの乗数
 */
export const ascensionBonusMultiplier = [0, 38/182, 65/182, 101/182, 128/182, 155/182, 1];


/**
 * 突破による追加ステータスの乗数
 */
export const ascensionAdditionalStatusMultiplier = [0, 0, 0.25, 0.5, 0.5, 0.75, 1];


/**
 * 
 * @param {4 | 5} rarity -- キャラクターのレアリティ
 * @param {number[]} row -- レベル1, 20, 40, 50, 60, 70, 80, 90におけるステータスの値の配列（それぞれ未突破）
 * @returns {[number, number]} -- result[0]にレベル1でのステータス値，result[1]に最大突破時の追加ステータス値
 */
export function estimateBaseStatsAndAscensionBonus(rarity, row)
{
    let lvls = [1, 20, 40, 50, 60, 70, 80, 90];
    let ascv = [0, ...ascensionBonusMultiplier];

    /** @type [number, number][] */
    let mat = lvls.map((e, i) => {
        return [characterBaseStatsLevelMultiplier[e - 1][rarity == 4 ? 0 : 1], ascv[i]];
    });

    return Utils.estimateTwoParamLeastSquares(mat, row);
}


export class CharacterBaseStats
{
    constructor(id, rarity, type, value)
    {
        this.id = id;
        this.rarity = rarity;
        this.rarityIndex = rarity == 4 ? 0 : 1;
        this.typeIndex = {HP: 0, ATK: 1, DEF: 2}[type];

        let lv90 = undefined;

        if(Array.isArray(value)) {
            let coeffs = estimateBaseStatsAndAscensionBonus(rarity, value);
            this.lv01 = coeffs[0];
            this.ascv = coeffs[1];

            lv90 = value[value.length - 1];
        } else {
            this.lv01 = characterBaseStatsAtLv1[id][this.typeIndex];
            this.ascv = characterMaxAscensionBonus[id][this.typeIndex];
            lv90 = value;
        }

        let estLv90 = this.ascv + this.lv01 * characterBaseStatsLevelMultiplier[89][this.rarityIndex];
        let diff = estLv90 - lv90;
        this.ascv -= diff;
    }


    /**
     * レベルの文字列表現を与えます．たとえば，strLv == "80"は未突破のLv80を表し，strLv == "80+"は突破済みのLv80を表します
     * @param {string} strLv 
     */
    atLv(strLv) {
        let {rank, level} = Utils.parseStrLevel(strLv);

        return this.lv01 * characterBaseStatsLevelMultiplier[level-1][this.rarityIndex]
                + this.ascv * ascensionBonusMultiplier[rank];
    }
}
