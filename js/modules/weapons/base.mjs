import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Widget from '/js/modules/widget.mjs';


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
        this.basePhysicalDmg = 0;

        this.baseRecharge = 0;
        this.baseMastery = 0;

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
        this.rank = ko.observable(0);
    }


    applyDmgCalc(calc)
    {
        Calc.VGData.pushContext('Weapon');
        calc = this.applyDmgCalcImpl(calc);
        Calc.VGData.popContext();
        return calc;
    }


    applyDmgCalcImpl(calc)
    {
        calc.weapon = this.parent;

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


    viewHTMLList(target)
    {
        return [];
    }


    toJS() {
        let obj = {};
        obj.parent_id = this.parent.id;
        obj.rank = this.rank();
        return obj;
    }


    fromJS(obj) {
        this.rank(obj.rank);
    }
}



export class WeaponWithChainedAttack extends WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    checkChainedAttack(parentAttackProps)
    {
        return false;
    }


    calcChainedAttackDmg(calc, parentAttackProps)
    {
        return Calc.VGData.zero();
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let vm = this;
        let NewCalc = class extends CalcType {
            #vmWeapon = vm;

            chainedAttackDmg(attackProps) {
                let superValue = super.chainedAttackDmg(attackProps);

                if(this.#vmWeapon.checkChainedAttack(attackProps)) {
                    return superValue.add(this.#vmWeapon.calcChainedAttackDmg(calc, attackProps));
                } else {
                    return superValue;
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }
}


export class LikePrototypeArchaicViewModel extends WeaponWithChainedAttack
{
    constructor(parent, min, max, init, condProps, sliderHTMLTitle)
    {
        super(parent);
        this.useEffect = ko.observable(false);
        this.perAttack = ko.observable(init);
        this.minPerAttack = min;
        this.maxPerAttack = max;
        this.condProps = condProps;
        this.sliderHTMLTitle = sliderHTMLTitle;
    }


    chainedAttackProps(parentAttackProps)
    {
        return {};
    }


    chainedAttackScale(parentAttackProps)
    {
        return 0;
    }


    checkChainedAttack(attackProps)
    {
        return this.useEffect() && hasAnyPropertiesWithSameValue(attackProps, this.condProps);
    }


    calcChainedAttackDmg(calc, attackProps)
    {
        let newProps = shallowDup(attackProps);
        // 元々の攻撃の属性や攻撃種類を削除する
        newProps = Calc.deleteAllElementFromAttackProps(newProps);
        newProps = Calc.deleteAllAttackTypeFromAttackProps(newProps);

        newProps = Object.assign(newProps, this.chainedAttackProps(attackProps));
        let scale = this.chainedAttackScale(attackProps);
        return calc.calculateNormalDmg(scale, newProps).div(Number(this.perAttack()));
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, this.sliderHTMLTitle,
                Widget.checkBoxViewHTML("useEffect",
                    `${Widget.spanText("perAttack()")}回に1回追加ダメージ`)
                +
                Widget.sliderViewHTML("perAttack", this.minPerAttack, this.maxPerAttack, 1, `発生頻度`, {disable: "!useEffect()"})
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.perAttack = this.perAttack();
        obj.useEffect = this.useEffect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.perAttack(obj.perAttack);
        this.useEffect(obj.useEffect);
    }
}
