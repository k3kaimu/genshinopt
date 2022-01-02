import * as Calc from '/js/modules/dmg-calc.mjs';

export class CharacterData
{
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
    constructor(vm, presetAttackObject)
    {
        this.cvm = vm;      // ViewModel of character 
        Object.assign(this, presetAttackObject);
    }


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
    viewHTMLList(target){
        return [];
    }


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


    toJS() {
        let obj = {};
        obj.parent_id  = this.parent.id;
        obj.constell   = this.constell();
        obj.normalRank = this.normalRank();
        obj.skillRank  = this.skillRank();
        obj.burstRank  = this.burstRank();
        return obj;
    }


    fromJS(obj) {
        this.constell(obj.constell);
        this.normalRank(obj.normalRank);
        this.skillRank(obj.skillRank);
        this.burstRank(obj.burstRank);
    }
}
