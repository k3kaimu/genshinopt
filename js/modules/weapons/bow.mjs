import * as Base from '/js/modules/weapons/base.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Widget from '/js/modules/widget.mjs';



// アモスの弓
export class AmosBow extends Base.WeaponData
{
    constructor()
    {
        super(
            "amos_bow",
            "アモスの弓",
            5,
            "Bow",
            608,
            "rateAtk",
            0.496
        );
    }


    newViewModel()
    {
        return new AmosBowViewModel(this);
    }


    static addNormalChargedDmgInc = [0.12, 0.15, 0.18, 0.21, 0.24];
    static addDmgIncByTime = [0.08, 0.10, 0.12, 0.14, 0.16];
}


// アモスの弓
export class AmosBowViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.stacksDmgInc = ko.observable(5);
    }


    totalDmgInc(nstack) {
        let rank_ = this.rank();
        let ret = AmosBow.addNormalChargedDmgInc[rank_];
        ret += AmosBow.addDmgIncByTime[rank_] * Number(nstack);

        return ret;
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let dmgInc = this.totalDmgInc(this.stacksDmgInc());
        calc.baseNormalDmg.value += dmgInc;
        calc.baseChargedDmg.value += dmgInc;

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "一心不乱",
                Widget.selectViewHTML("stacksDmgInc", [
                    {value: 0, label: `通常重撃ダメージ+${textPercentageFix(this.totalDmgInc(0), 0)}（0.0秒後）`},
                    {value: 1, label: `通常重撃ダメージ+${textPercentageFix(this.totalDmgInc(1), 0)}（0.1秒後）`},
                    {value: 2, label: `通常重撃ダメージ+${textPercentageFix(this.totalDmgInc(2), 0)}（0.2秒後）`},
                    {value: 3, label: `通常重撃ダメージ+${textPercentageFix(this.totalDmgInc(3), 0)}（0.3秒後）`},
                    {value: 4, label: `通常重撃ダメージ+${textPercentageFix(this.totalDmgInc(4), 0)}（0.4秒後）`},
                    {value: 5, label: `通常重撃ダメージ+${textPercentageFix(this.totalDmgInc(5), 0)}（0.5秒後）`},
                ])
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.stacksDmgInc = this.stacksDmgInc();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.stacksDmgInc(obj.stacksDmgInc);
    }
}



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
export class SkywardHarpViewModel extends Base.LikePrototypeArchaicViewModel
{
    constructor(parent)
    {
        super(
            parent,
            1,
            20,
            5,
            {},
            "攻撃命中時追加ダメージ"
        );
    }


    chainedAttackProps(parentAttackProps)
    {
        return {isPhysical: true, isChainable: false};
    }


    chainedAttackScale(parentAttackProps)
    {
        return 1.25;
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);
        calc.baseCrtDmg.value += SkywardHarp.addCrtDmg[this.rank()];
        return calc;
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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseNormalDmg.value += Rust.addNormalDmg[this.rank()];
        calc.baseChargedDmg.value -= 0.1;

        return calc;
    }
}


// 澹月・試作
export class PrototypeCrescent extends Base.WeaponData
{
    constructor()
    {
        super(
            "prototype_crescent",
            "澹月・試作",
            4,
            "Bow",
            510,
            "rateAtk",
            0.413
        );
    }


    newViewModel()
    {
        return new PrototypeCrescentViewModel(this);
    }


    static addAtk = [0.36, 0.45, 0.54, 0.63, 0.72];
}


export class PrototypeCrescentViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useAddRateAtk = ko.observable(true);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useAddRateAtk()) {
            calc.rateAtk.value += PrototypeCrescent.addAtk[this.rank()];
        }

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "帰らない", Widget.checkBoxViewHTML("useAddRateAtk", `攻撃力+${textPercentageFix(PrototypeCrescent.addAtk[this.rank()], 0)}`))
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.useAddRateAtk = this.useAddRateAtk();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.useAddRateAtk(obj.useAddRateAtk);
    }
}