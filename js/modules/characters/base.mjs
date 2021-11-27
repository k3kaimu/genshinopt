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

        /*
        Sword, Claymore, Polearm, Catalyst, Bow
        */
        this.weaponType = weaponType;
        
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
            label: "通常攻撃（100%）",
            makeViewModel(characterViewModel) {
                return new NoReactionAttack(1, { isNormal: true });
            },
        }
    ];
}


export class CharacterViewModel
{
    constructor(ch)
    {
        this.parent = ch;
        this.constell = ko.observable(0);           // 凸数
        this.normalRank = ko.observable(9);      // 通常天賦
        this.skillRank = ko.observable(9);        // スキル天賦
        this.burstRank = ko.observable(9);       // 爆発天賦
    }


    applyDmgCalc(calc)
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


    toJS() {
        return {
            parent_id:  this.parent.id,
            constell:   this.constell(),
            normalRank: this.normalRank(),
            skillRank:  this.skillRank(),
            burstRank:  this.burstRank(),
        };
    }


    fromJS(obj) {
        this.constell(obj.constell);
        this.normalRank(obj.normalRank);
        this.skillRank(obj.skillRank);
        this.burstRank(obj.burstRank);
    }
}


export class AttackViewModel
{
    constructor() {}

    calculate(calc) {
        return undefined;
    }

    viewHTMLList(target) {
        return [];
    }
}


export class NoReactionAttack
{
    constructor(dmgScale, attackProps)
    {
        this.dmgScale = dmgScale;
        this.attackProps = Object.assign({}, attackProps);
    }


    calculate(calc) {
        return calc.calculateDmg(this.dmgScale, this.attackProps).mul(0.5).mul(0.9);
    }


    viewHTMLList(target){ return []; }
}



export class VaporizeMeltProbabilityViewModel
{
    constructor(dmgScale, attackProps)
    {
        this.reactionType = ko.observable("isVaporize");
        this.prob = ko.observable(0);

        this.dmgScale = dmgScale;

        this.attackProps = Object.assign({}, attackProps);
        delete this.attackProps.isVaporize;
        delete this.attackProps.isMelt;
    }


    calculate(calc) {
        let newprops = Object.assign({}, this.attackProps);

        let dmg1 = calc.calculateDmg(this.dmgScale, newprops);

        newprops[this.reactionType()] = true;
        let dmg2 = calc.calculateDmg(this.dmgScale, newprops);

        return dmg1.mul(1 - Number(this.prob())).add(dmg2.mul(Number(this.prob()))).mul(0.5).mul(0.9);
    }


    viewHTMLList(target){
        return [
            `
            <div class="card" data-bind="with: `+ target +`">
            <div class="card-header p-2">蒸発/溶解</div>
            <div class="card-body p-2">
                <div class="form-group row">
                  <label class="col-5 mt-2">元素反応</label>
                  <div class="col-7">
                    <select class="form-control" data-bind="value: reactionType">
                      <option value="isVaporize">蒸発</option>
                      <option value="isMelt">溶解</option>
                    </select>
                  </div>
                </div>
                <div class="form-group row">
                  <label class="col-sm-5 col-form-label">反応確率：<span data-bind="text: textPercentage(prob() ,2)"></span></label>
                  <div class="col-sm-7 mt-sm-2">
                    <input type="range" data-bind="value: prob" class="form-control-range" min="0" max="1" step="0.1">
                  </div>
                </div>
            </div>
            </div>
            `
        ]
    }
}
