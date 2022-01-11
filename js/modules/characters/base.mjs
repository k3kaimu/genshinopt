import * as Calc from '../dmg-calc.mjs';

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
        }
    ];
}


export class AttackEvaluator
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
     * @param {CharacterViewModel} vm
     * @param {{ id: string; label: string; dmgScale: ((vm: CharacterViewModel) => number); attackProps: object; }} presetAttackObject
     */
    constructor(vm, presetAttackObject)
    {
        this.cvm = vm;      // ViewModel of character 
        Object.assign(this, presetAttackObject);
    }


    /**
     * @param {Calc.DamageCalculator} calc
     */
    evaluate(calc, additionalProps = {})
    {
        let scales = [this.dmgScale(this.cvm)].flat();
        let dmg = Calc.VGData.zero();
        let newProps = {...additionalProps, ...this.attackProps};
        scales.forEach(s => {
            dmg = dmg.add(calc.calculate(s, newProps).total());
        });
       
        return dmg;
    }
}


export class CharacterViewModel
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
            else
                ret.push(new AttackEvaluator(this, a));
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
        let attacks = Object.getPrototypeOf(this.parent).constructor.presetAttacks.slice(0);
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
                ret.push(new AttackEvaluator(this, a));
        });

        return ret;
    }
}
