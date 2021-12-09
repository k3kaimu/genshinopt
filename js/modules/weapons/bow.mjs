import * as Base from '/js/modules/weapons/base.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Widget from '/js/modules/widget.mjs';



// 天空の翼
export class SkywardHarp extends Base.WeaponData
{
    constructor()
    {
        super(
            "skyward_harp",
            "天空の翼",
            5,
            "Bow",
            674,
            "baseCrtRate",
            0.221
        );
    }


    newViewModel()
    {
        return new SkywardHarpViewModel(this);
    }


    static addCrtDmg = [0.2, 0.25, 0.30, 0.35, 0.40];
}



// 天空の翼, viewmodel
export class SkywardHarpViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useEffect = ko.observable(false);
        this.perAttack = ko.observable(5);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseCrtDmg.value += SkywardHarp.addCrtDmg[this.rank()];

        if(! this.useEffect())
            return calc;

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let perAttack_ = Number(this.perAttack());

        let NewCalc = class extends CalcType {
            perAttackOfSkywardHarp = perAttack_;

            chainedAttackDmg(attackProps) {
                let superValue = super.chainedAttackDmg(attackProps);

                let newProps = shallowDup(attackProps);
                // 元々の攻撃の属性や攻撃種類を削除する
                newProps = Calc.deleteAllElementFromAttackProps(newProps);
                newProps = Calc.deleteAllAttackTypeFromAttackProps(newProps);

                newProps.isPhysical = true;   // 物理攻撃
                newProps.isChainable = false; // この攻撃では追撃は発生しない
                return superValue.add(super.calculateNormalDmg(1.25, newProps).div(this.perAttackOfSkywardHarp));
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "追加ダメージ",
                Widget.checkBoxViewHTML("useEffect",
                    `${Widget.spanText("perAttack()")}回に1回125%物理ダメージ`)
                +
                Widget.sliderViewHTML("perAttack", 1, 20, 1, `発生頻度`, {disable: "!useEffect()"})
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.perAttack = this.perAttack();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.perAttack(obj.perAttack);
    }
}



// 飛雷の鳴弦
export class ThunderingPulse extends Base.WeaponData
{
    constructor()
    {
        super(
            "thundering_pulse",
            "飛雷の鳴弦",
            5,
            "Bow",
            608,
            "baseCrtDmg",
            0.662
        );
    }


    newViewModel()
    {
        return new ThunderingPulseViewModel(this);
    }


    static subSkill = [
        {atk: 0.20, dmg: [0, 0.120, 0.240, 0.400]},
        {atk: 0.25, dmg: [0, 0.150, 0.300, 0.500]},
        {atk: 0.30, dmg: [0, 0.180, 0.360, 0.600]},
        {atk: 0.35, dmg: [0, 0.210, 0.420, 0.700]},
        {atk: 0.40, dmg: [0, 0.240, 0.480, 0.800]},
    ];
}


// 飛雷の鳴弦
export class ThunderingPulseViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.buffStacks = ko.observable(3);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.rateAtk.value += ThunderingPulse.subSkill[this.rank()].atk;
        calc.baseNormalDmg.value += ThunderingPulse.subSkill[this.rank()].dmg[this.buffStacks()];

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "飛雷の御執", 
                Widget.selectViewHTML("buffStacks", [
                    {value: 0, label: `通常攻撃ダメージ+${textPercentageFix(ThunderingPulse.subSkill[this.rank()].dmg[0], 1)}`},
                    {value: 1, label: `通常攻撃ダメージ+${textPercentageFix(ThunderingPulse.subSkill[this.rank()].dmg[1], 1)}`},
                    {value: 2, label: `通常攻撃ダメージ+${textPercentageFix(ThunderingPulse.subSkill[this.rank()].dmg[2], 1)}`},
                    {value: 3, label: `通常攻撃ダメージ+${textPercentageFix(ThunderingPulse.subSkill[this.rank()].dmg[3], 1)}`},
                ]))
        );

        return dst;
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




// 冬極の白星
export class PolarStar extends Base.WeaponData
{
    constructor()
    {
        super(
            "polar_star",
            "冬極の白星",
            5,
            "Bow",
            608,
            "baseCrtRate",
            0.331
        );
    }


    newViewModel()
    {
        return new PolarStarViewModel(this);
    }


    static subSkill = [
        {dmg: 0.12, atk: [0, 0.100, 0.200, 0.300, 0.480]},
        {dmg: 0.15, atk: [0, 0.125, 0.250, 0.375, 0.600]},
        {dmg: 0.18, atk: [0, 0.150, 0.300, 0.450, 0.720]},
        {dmg: 0.21, atk: [0, 0.175, 0.350, 0.525, 0.840]},
        {dmg: 0.24, atk: [0, 0.200, 0.400, 0.600, 0.960]},
    ];
}


// 冬極の白星
export class PolarStarViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.buffStacks = ko.observable(3);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseSkillDmg.value += PolarStar.subSkill[this.rank()].dmg;
        calc.baseBurstDmg.value += PolarStar.subSkill[this.rank()].dmg;
        calc.rateAtk.value += PolarStar.subSkill[this.rank()].atk[this.buffStacks()];

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "白夜の前兆者", 
                Widget.selectViewHTML("buffStacks", [
                    {value: 0, label: `攻撃力+${textPercentageFix(PolarStar.subSkill[this.rank()].atk[0], 1)}`},
                    {value: 1, label: `攻撃力+${textPercentageFix(PolarStar.subSkill[this.rank()].atk[1], 1)}`},
                    {value: 2, label: `攻撃力+${textPercentageFix(PolarStar.subSkill[this.rank()].atk[2], 1)}`},
                    {value: 3, label: `攻撃力+${textPercentageFix(PolarStar.subSkill[this.rank()].atk[3], 1)}`},
                    {value: 4, label: `攻撃力+${textPercentageFix(PolarStar.subSkill[this.rank()].atk[4], 1)}`},
                ]))
        );

        return dst;
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



// 弓蔵
export class Rust extends Base.WeaponData
{
    constructor()
    {
        super(
            "rust",
            "弓蔵",
            4,
            "Bow",
            510,
            "rateAtk",
            0.413
        );
    }


    newViewModel()
    {
        return new RustViewModel(this);
    }


    static addNormalDmg = [0.4, 0.5, 0.6, 0.7, 0.8];
}


// 弓蔵
export class RustViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseNormalDmg.value += Rust.addNormalDmg[this.rank()];
        calc.baseChargedDmg.value -= 0.1;

        return calc;
    }
}
