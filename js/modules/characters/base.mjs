import * as Calc from '../dmg-calc.mjs';
import * as Widget from '../widget.mjs';

export class CharacterData
{
    /**
     * @param {string} id
     * @param {string} name
     * @param {number} rarity
     * @param {string} elem
     * @param {string} weaponType
     * @param {number} bAtk
     * @param {number} bDef
     * @param {number} bHP
     * @param {string} bBonusType
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

        this.baseAtk = bAtk;
        this.rateAtk = 0;
        this.baseDef = bDef;
        this.rateDef = 0;
        this.baseHP = bHP;
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
        
        this[bBonusType] += bBonusValue;
    }


    newViewModel()
    {
        return new CharacterViewModel(this);
    }



    /**
     * @type {{id: string; label: string; dmgScale: (vm: CharacterViewModel) => (number | number[]) | (number | number[])[]; attackProps: Object}[]}
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
    constructor(id, label)
    {
        this.id = id;
        this.label = label;

        /** @type {Calc.AttackInfo[]} */
        this.cachedInfos = undefined;
    }


    evaluate(calc, additionalProps = {})
    {
        return Calc.VGData.zero();
    }


    /**
     * すべてのAttackPropsを返します．計算を高速化するために内部でキャッシュを持ちます
     * @param {Calc.DamageCalculator} calc
     * @param {Calc.AttackInfo[]} attackInfos 
     * @returns {Calc.AttackInfo[]}
     */
    getAllCompressedAttackInfos(calc, attackInfos) {
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
                infos = Calc.compressAttackInfos(infos, "strong", calc);
                this.cachedInfos = infos;
            } else {
                // optimizedModeをやめる
                this.cachedInfos = undefined;
            }
        }

        return infos;
    }


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


    evaluateWithCache(calc, genInfos) {
        /** @type {Calc.AttackInfo[]} */
        let infos;
        if(this.hasCache()) {
            infos = this.cachedInfos;
        } else {
            infos = genInfos();
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
     * @param {{ id: string; label: string; dmgScale: ((vm: CharacterViewModel) => number); attackProps: object; }} presetAttackObject
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
    evaluate(calc, additionalProps = {})
    {
        return this.evaluateWithCache(calc, () => {
            return [this.dmgScale(this.cvm)].flat(10).map(s => {
                    return new Calc.AttackInfo(s, this.ref, {...additionalProps, ...this.attackProps}, 1);
            });
        });
    }
}


export class CompoundedPresetAttackEvaluator extends AttackEvaluator
{
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
    evaluate(calc, additionalProps = {})
    {
        return this.evaluateWithCache(calc, () => {
            return this.list.map(e => {
                let scales = [e.dmgScale(this.cvm)].flat(10);

                let ref = "atk";
                if("ref" in e)
                    ref = e.ref;

                return scales.map(s => {
                    return new Calc.AttackInfo(s, ref, {...additionalProps, ...e.attackProps}, 1);
                });
            }).flat(10);
        });
    }
}


export class FunctionAttackEvaluator extends AttackEvaluator
{
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
        this.constell = ko.observable(0);           // 凸数, 無凸==0
        this.normalRank = ko.observable(9);         // 通常天賦
        this.skillRank = ko.observable(9);          // スキル天賦
        this.burstRank = ko.observable(9);          // 爆発天賦
    }


    maxNormalTalentRank() { return 11; }
    maxSkillTalentRank() { return 10; }
    maxBurstTalentRank() { return 10; }


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
        calc.character = this.parent;

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
        calc.basePhysicalDmg.value += this.parent.basePhysicalDmg;

        calc.baseRecharge.value += this.parent.baseRecharge;
        calc.baseMastery.value += this.parent.baseMastery;

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
        this.constell(obj.constell);
        this.normalRank(obj.normalRank);
        this.skillRank(obj.skillRank);
        this.burstRank(obj.burstRank);
    }
}


export let AddTalentRegister = (Base) => class extends Base {
    talents = [];

    /**
     * @param {{type: string, requiredC: number, uiList: {type: string, name: string, init: any, label: (vm:CharacterViewModel) => string}[], effect: {cond: (vm:CharacterViewModel)=>boolean, list: Object[]}}} obj 
     */
    registerTalent(obj) {
        this.talents.push(obj);
        obj.uiList.forEach(e => {
            if(e == undefined) return;

            if(e.name && !(e.name in this))
                this[e.name] = ko.observable(e.init);
        });
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        this.talents.forEach(talent => {
            if(talent.requiredC > this.constell() || talent.effect == undefined)
                return;

            if(talent.effect.cond(this)) {
                talent.effect.list.forEach(e => {
                    if(e.dynamic) {
                        // TODO: もっと上手い解決方法はないか？
                        let ctx = Calc.VGData.context;
                        eval(`calc = calc.applyExtension(Klass => class extends Klass {
                            ${e.target}(attackProps) {
                                if(e.condAttackProps(attackProps)) {
                                    let v = e.value(this);
                                    if(typeof v == 'number')
                                        v = Calc.VGData.constant(v).as(ctx);

                                    return super.${e.target}(attackProps).add(v);
                                } else
                                    return super.${e.target}(attackProps);
                            }});`);
                    } else {
                        calc[e.target].value += e.value(this);
                    }
                });
            }
        });

        return calc;
    }


    /**
     * @param {string} target
     */
    viewHTMLList(target) {
        let uiList = {
            "Other": [],
            "Skill": [],
            "Burst": [],
        };

        this.talents.forEach(talent => {
            if(talent.requiredC > this.constell())
                return;

            let str = "";
            talent.uiList.forEach(e => {
                if(e == undefined) return;

                switch(e.type) {
                    case "checkbox":
                        str += Widget.checkBoxViewHTML(e.name, e.label(this),
                                e.other ? e.other(this) : undefined);
                        break;
                    case "select":
                        str += Widget.selectViewHTML(e.name, e.options,
                                e.label ? e.label(this) : undefined,
                                e.other ? e.other(this) : undefined);
                        break;
                    case "html":
                        str += e.html(this);
                        break;
                    default:
                        console.assert(`Unsupported UI type: ${e.type}`);
                }
            });

            uiList[talent.type].push(str);
        });

        let ret = super.viewHTMLList(target).slice(0);

        if(uiList["Skill"].length)
            ret.push(Widget.buildViewHTML(target, "元素スキル関連効果", uiList["Skill"].join("<hr>")));

        if(uiList["Burst"].length)
            ret.push(Widget.buildViewHTML(target, "元素爆発関連効果", uiList["Burst"].join("<hr>")));

        if(uiList["Other"].length)
            ret.push(Widget.buildViewHTML(target, "その他効果", uiList["Other"].join("<hr>")));

        return ret;
    }


    toJS()
    {
        let obj = super.toJS();

        this.talents.forEach(talent => {
            talent.uiList.forEach(e => {
                if(e == undefined) return;

                if(e.name)
                    obj[e.name] = this[e.name]();
            });
        });

        return obj;
    }


    fromJS(obj)
    {
        super.fromJS(obj);

        this.talents.forEach(talent => {
            talent.uiList.forEach(e => {
                if(e == undefined) return;

                if(e.name)
                    this[e.name](obj[e.name]);
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
            1,
            elem,
            type,
            100,            /* bAtk */
            200,            /* bDef */
            10000,          /* bHP */
            "baseCrtDmg",   /* bBonusType */
            0.100           /* bBonusValue */
        );
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
