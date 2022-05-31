import * as Base from './base.mjs';
import * as Calc from '../dmg-calc.mjs';
import * as Widget from '../widget.mjs';
import * as Utils from '../utils.mjs';
import * as TypeDefs from '../typedefs.mjs';



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


    static addNormalChargedDmgInc = [0.12, 0.15, 0.18, 0.21, 0.24];
    static addDmgIncByTime = [0.08, 0.10, 0.12, 0.14, 0.16];


    static totalDmgInc(rank, nstack) {
        let ret = AmosBow.addNormalChargedDmgInc[rank];
        ret += AmosBow.addDmgIncByTime[rank] * Number(nstack);

        return ret;
    }


    defineEffects = [
        {
            uiList: [{
                type: "select",
                name: "stacksDmgInc",
                init: 5,
                options: (vm) => iota(0, 6).map((_, i) => {return {value: i, label: `通常/重撃ダメージ+${textPercentageFix(AmosBow.totalDmgInc(vm.rank(), i), 0)}（0.${i}秒後）`};})
            }],
            effect: {
                cond: (vm) => true,
                list: [{target: "baseNormalDmg", value: (vm) => AmosBow.totalDmgInc(vm.rank(), vm.stacksDmgInc())},
                       {target: "baseChargedDmg", value: (vm) => AmosBow.totalDmgInc(vm.rank(), vm.stacksDmgInc())}]
            }
        }
    ];
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new AmosBow(),
        "Anemo",
        {
            "vm": {
                "parent_id": "amos_bow",
                "rank": 0,
                "stacksDmgInc": 5
            },
            "expected": {
                "normal_100": 746.2050393599999,
                "normal_elem_100": 746.2050393599999,
                "skill_100": 490.92436799999996,
                "burst_100": 490.92436799999996
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new AmosBow().newViewModel()
    ));
});



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


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new SkywardHarp(),
        "Anemo",
        {
            "vm": {
                "parent_id": "skyward_harp",
                "rank": 0,
                "perAttack": 5,
                "useEffect": false
            },
            "expected": {
                "normal_100": 423.81144000000006,
                "normal_elem_100": 423.81144000000006,
                "skill_100": 423.81144000000006,
                "burst_100": 423.81144000000006
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new SkywardHarp().newViewModel()
    ));
});


// 終焉を嘆く詩
export class ElegyForTheEnd extends Base.WeaponData
{
    constructor()
    {
        super(
            "elegy_for_the_end",
            "終焉を嘆く詩",
            5,
            "Bow",
            608,
            TypeDefs.StaticStatusType.recharge,
            0.551
        );
    }


    static effectTable = {
        mry1: [60, 75, 90, 105, 120],
        mry2: [100, 125, 150, 175, 200],
        atk: [0.20, 0.25, 0.30, 0.35, 0.40],
    };


    defineEffects = [
        {
            uiList: [{
                type: "checkbox",
                name: "useEffect",
                init: true,
                label: (vm) => `熟知+${textInteger(ElegyForTheEnd.effectTable.mry2[vm.rank()])}，攻撃力+${textPercentageFix(ElegyForTheEnd.effectTable.atk[vm.rank()], 0)}`
            }],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.mastery,
                        value: (vm) => vm.useEffect() ? ElegyForTheEnd.effectTable.mry1[vm.rank()] + ElegyForTheEnd.effectTable.mry2[vm.rank()]
                                                      : ElegyForTheEnd.effectTable.mry1[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.rateAtk,
                        value: (vm) => vm.useEffect() ? ElegyForTheEnd.effectTable.atk[vm.rank()] : 0
                    }
                ]
            }
        }
    ];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new ElegyForTheEnd(),
        "Anemo",
        {
            "vm": {
                "parent_id": "elegy_for_the_end",
                "level": "90",
                "rank": 0,
                "useEffect": true
            },
            "expected": {
                "normal_100": 393.78960000000006,
                "normal_elem_100": 393.78960000000006,
                "skill_100": 393.78960000000006,
                "burst_100": 393.78960000000006
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new ElegyForTheEnd().newViewModel()
    ));
});



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


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new ThunderingPulse(),
        "Anemo",
        {
            "vm": {
                "parent_id": "thundering_pulse",
                "rank": 0,
                "buffStacks": 3
            },
            "expected": {
                "normal_100": 569.0221488,
                "normal_elem_100": 569.0221488,
                "skill_100": 406.444392,
                "burst_100": 406.444392
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new ThunderingPulse().newViewModel()
    ));
});




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


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new PolarStar(),
        "Anemo",
        {
            "vm": {
                "parent_id": "polar_star",
                "rank": 0,
                "buffStacks": 3
            },
            "expected": {
                "normal_100": 508.86154799999997,
                "normal_elem_100": 508.86154799999997,
                "skill_100": 569.92493376,
                "burst_100": 569.92493376
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new PolarStar().newViewModel()
    ));
});


// 若水
export class AquaSimulacra extends Base.WeaponData
{
    constructor()
    {
        super(
            "aqua_simulacra",
            "若水",
            5,
            "Bow",
            542,
            TypeDefs.StaticStatusType.crtDmg,
            0.882
        );
    }


    newViewModel()
    {
        return new AquaSimulacraViewModel(this);
    }


    static subSkill = [
        {dmg: 0.20, hp: 0.16},
        {dmg: 0.25, hp: 0.20},
        {dmg: 0.30, hp: 0.24},
        {dmg: 0.35, hp: 0.28},
        {dmg: 0.40, hp: 0.32},
    ];
}


// 若水
export class AquaSimulacraViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        
        this.registerEffect({
            uiList: [
                {
                    type: "checkbox",
                    name: "useEffect",
                    init: true,
                    label: (vm) => `全ダメバフ+${textPercentageFix(AquaSimulacra.subSkill[vm.rank()].dmg, 0)}`
                }
            ],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.allDmg,
                        value: (vm) => vm.useEffect() ? AquaSimulacra.subSkill[vm.rank()].dmg : 0,
                    },
                    {
                        target: TypeDefs.StaticStatusType.rateHP,
                        value: (vm) => AquaSimulacra.subSkill[vm.rank()].hp
                    },
                ]
            }
        });
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new AquaSimulacra(),
        "Anemo",
        {
            "vm": {
                "parent_id": "aqua_simulacra",
                "level": "90",
                "rank": 0,
                "useEffect": true
            },
            "expected": {
                "normal_100": 372.36898800000006,
                "normal_elem_100": 372.36898800000006,
                "skill_100": 372.36898800000006,
                "burst_100": 372.36898800000006
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new AquaSimulacra().newViewModel()
    ));
});


// 西風猟弓
export class FavoniusWarbow extends Base.WeaponData
{
    constructor()
    {
        super(
            "favonius_warbow",
            "西風猟弓",
            4,
            "Bow",
            454,
            TypeDefs.StaticStatusType.recharge,
            0.613
        );
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new FavoniusWarbow(),
        "Anemo",
        {
            "vm": {
                "parent_id": "favonius_warbow",
                "level": "90",
                "rank": 0
            },
            "expected": {
                "normal_100": 256.779,
                "normal_elem_100": 256.779,
                "skill_100": 256.779,
                "burst_100": 256.779
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new FavoniusWarbow().newViewModel()
    ));
});


// 祭礼の弓
export class SacrificialBow extends Base.WeaponData
{
    constructor()
    {
        super(
            "sacrificial_bow",
            "祭礼の弓",
            4,
            "Bow",
            565,
            TypeDefs.StaticStatusType.recharge,
            0.306
        );
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new SacrificialBow(),
        "Anemo",
        {
            "vm": {
                "parent_id": "sacrificial_bow",
                "level": "90",
                "rank": 0
            },
            "expected": {
                "normal_100": 308.2275,
                "normal_elem_100": 308.2275,
                "skill_100": 308.2275,
                "burst_100": 308.2275
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new SacrificialBow().newViewModel()
    ));
});


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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new Rust(),
        "Anemo",
        {
            "vm": {
                "parent_id": "rust",
                "rank": 0
            },
            "expected": {
                "normal_100": 559.306377,
                "normal_elem_100": 559.306377,
                "skill_100": 399.50455500000004,
                "burst_100": 399.50455500000004
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Rust().newViewModel()
    ));
});


// 絶弦
export class TheStringless extends Base.WeaponData
{
    constructor()
    {
        super(
            "the_stringless",
            "絶弦",
            4,
            "Bow",
            510,
            TypeDefs.StaticStatusType.mastery,
            165
        );
    }


    static effectTable = [0.24, 0.30, 0.36, 0.42, 0.48];


    defineEffects = [
        {
            uiList: [],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.skillDmg,
                        value: (vm) => TheStringless.effectTable[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.burstDmg,
                        value: (vm) => TheStringless.effectTable[vm.rank()]
                    }
                ]
            }
        }
    ];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new TheStringless(),
        "Anemo",
        {
            "vm": {
                "parent_id": "the_stringless",
                "level": "90",
                "rank": 0
            },
            "expected": {
                "normal_100": 282.735,
                "normal_elem_100": 282.735,
                "skill_100": 350.5914000000001,
                "burst_100": 350.5914000000001
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new TheStringless().newViewModel()
    ));
});


// ダークアレイの狩人
export class AlleyHunter extends Base.WeaponData
{
    constructor()
    {
        super(
            "alley_hunter",
            "ダークアレイの狩人",
            4,
            "Bow",
            565,
            TypeDefs.StaticStatusType.rateAtk,
            0.276
        );
    }

    static effectTable = [0.02, 0.025, 0.03, 0.035, 0.04];

    defineEffects = [{
        uiList: [{
            type: "select",
            name: "numOfStacks",
            init: 10,
            options: (vm) => iota(0, 11).map(n => {return {value: n, label: `ダメージ+${textPercentageFix(AlleyHunter.effectTable[vm.rank()] * n, 0)}` };})
        }],
        effect: {
            cond: (vm) => true,
            list: [{
                target: TypeDefs.StaticStatusType.allDmg,
                value: (vm) => AlleyHunter.effectTable[vm.rank()] * Number(vm.numOfStacks())
            }]
        }
    }];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new AlleyHunter(),
        "Anemo",
        {
            "vm": {
                "parent_id": "alley_hunter",
                "level": "90",
                "rank": 0,
                "numOfStacks": 10
            },
            "expected": {
                "normal_100": 471.95794799999993,
                "normal_elem_100": 471.95794799999993,
                "skill_100": 471.95794799999993,
                "burst_100": 471.95794799999993
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new AlleyHunter().newViewModel()
    ));
});


// 旧貴族長弓
export class RoyalBow extends Base.WeaponData
{
    constructor()
    {
        super(
            "royal_bow",
            "旧貴族長弓",
            4,
            "Bow",
            510,
            "rateAtk",
            0.416
        );
    }


    newViewModel()
    {
        return new RoyalBowViewModel(this);
    }


    static effectTable = [0.08, 0.10, 0.12, 0.14, 0.16];
}


// 旧貴族長弓
export class RoyalBowViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);

        this.registerEffect({
            uiList: [
                {
                    type: "radio",
                    name: "selType",
                    init: "effective",
                    options: (vm) => [
                        {value: "effective", label: "実質的な会心率の上昇量を利用"},
                        {value: "constant", label: "固定の会心率の上昇量を利用"},
                    ]
                },
                {
                    type: "select",
                    name: "buffStacks",
                    init: 1,
                    options: (vm) => iota(0, 6).map(n => {return {value: n, label: `会心率+${textPercentageFix(this.crtIncrease(n), 0)}`};}),
                    other: (vm) => {return {visible: "selType() == 'constant'"};}
                }
            ],
            effect: undefined
        });
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.selType() == "constant") {
            calc.baseCrtRate.value += this.crtIncrease(this.buffStacks());
        } else {
            let incP = RoyalBow.effectTable[this.rank()];

            calc = calc.applyExtension(Klass => class extends Klass {
                crtRate(attackProps)
                {
                    if(hasAnyProperties(attackProps, ["incCrtRateRoyalBow"])) {
                        return super.crtRate(attackProps).add(attackProps.incCrtRateRoyalBow);
                    } else {
                        return super.crtRate(attackProps);
                    }
                }

                modifyAttackInfo(attackInfo) {
                    return super.modifyAttackInfo(attackInfo).map(info => {
                        if(!hasAnyProperties(info.props, ["incCrtRateRoyalBow"])) {
                            const cr = this.crtRate(info.props);
                            const inc = Calc.royalCriticalRate(cr, incP).sub(cr);

                            return new Calc.AttackInfo(info.scale, info.ref, {...info.props, incCrtRateRoyalBow: inc}, info.prob);
                        } else {
                            return info;
                        }
                    });
                }
            });
        }

        return calc;
    }


    crtIncrease(numStacks)
    {
        return RoyalBow.effectTable[this.rank()] * Number(numStacks);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new RoyalBow(),
        "Anemo",
        {
            "vm": {
                "parent_id": "royal_bow",
                "level": "90",
                "rank": 0,
                "selType": "effective",
                "buffStacks": 1
            },
            "expected": {
                "normal_100": 440.0379575566927,
                "normal_elem_100": 440.0379575566927,
                "skill_100": 440.0379575566927,
                "burst_100": 440.0379575566927
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new RoyalBow().newViewModel()
    ));
});



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


// 澹月・試作
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


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new PrototypeCrescent(),
        "Anemo",
        {
            "vm": {
                "parent_id": "prototype_crescent",
                "rank": 0,
                "useAddRateAtk": true
            },
            "expected": {
                "normal_100": 501.289155,
                "normal_elem_100": 501.289155,
                "skill_100": 501.289155,
                "burst_100": 501.289155
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new PrototypeCrescent().newViewModel()
    ));
});


// 黒岩の戦弓
export class BlackcliffWarbow extends Base.WeaponData
{
    constructor()
    {
        super(
            "blackcliff_warbow",
            "黒岩の戦弓",
            4,
            "Bow",
            565,
            "baseCrtDmg",
            0.368
        );
    }

    newViewModel()
    {
        return new BlackcliffWarbowViewModel(this);
    }

    static effectTable = [0.12, 0.15, 0.18, 0.21, 0.24];
}


// 黒岩の戦弓 viewmodel
export class BlackcliffWarbowViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.effectStacks = ko.observable(3);
    }

    incRateAtk(numStacks)
    {
        return Number(numStacks) * BlackcliffWarbow.effectTable[this.rank()];
    }

    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.rateAtk.value += this.incRateAtk(this.effectStacks());

        return calc;
    }

    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "勝ちに乗じる",
                Widget.selectViewHTML("effectStacks", [
                    {value: 0, label: `攻撃力+${textPercentageFix(this.incRateAtk(0), 0)}`},
                    {value: 1, label: `攻撃力+${textPercentageFix(this.incRateAtk(1), 0)}`},
                    {value: 2, label: `攻撃力+${textPercentageFix(this.incRateAtk(2), 0)}`},
                    {value: 3, label: `攻撃力+${textPercentageFix(this.incRateAtk(3), 0)}`}
                ])
            )
        );

        return dst;
    }

    toJS() {
        let obj = super.toJS();
        obj.effectStacks = this.effectStacks();

        return obj;
    }

    fromJS(obj) {
        super.fromJS(obj);
        this.effectStacks(obj.effectStacks);
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new BlackcliffWarbow(),
        "Anemo",
        {
            "vm": {
                "parent_id": "blackcliff_warbow",
                "rank": 0,
                "effectStacks": 3
            },
            "expected": {
                "normal_100": 426.67783199999997,
                "normal_elem_100": 426.67783199999997,
                "skill_100": 426.67783199999997,
                "burst_100": 426.67783199999997
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new BlackcliffWarbow().newViewModel()
    ));
});
