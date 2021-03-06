import * as Base from './base.mjs'
import * as Calc from '../dmg-calc.mjs'
import * as Widget from '../widget.mjs'
import * as Utils from '../utils.mjs';
import * as TypeDefs from '../typedefs.mjs';


// 天空の巻
export class SkywardAtlas extends Base.WeaponData
{
    constructor()
    {
        super(
            "skyward_atlas",
            "天空の巻",
            5,
            "Catalyst",
            674,
            "rateAtk",
            0.331
        );
    }


    static addDmgInc = [0.12, 0.15, 0.18, 0.21, 0.24];
    static addAttackScale = [1.60, 2.00, 2.40, 2.80, 3.20];


    defineEffects = [
        {
            uiList: [],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.anemoDmg,
                        value: (vm) => SkywardAtlas.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.cryoDmg,
                        value: (vm) => SkywardAtlas.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.dendroDmg,
                        value: (vm) => SkywardAtlas.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.electroDmg,
                        value: (vm) => SkywardAtlas.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.geoDmg,
                        value: (vm) => SkywardAtlas.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.hydroDmg,
                        value: (vm) => SkywardAtlas.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.pyroDmg,
                        value: (vm) => SkywardAtlas.addDmgInc[vm.rank()]
                    }
                ]
            }
        },
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useChainedAttack",
                    init: false,
                    label: (vm) => `${textInteger(vm.perAttack())}回に1回${textPercentageFix(SkywardAtlas.addAttackScale[vm.rank()], 0)}の追加ダメージ`
                },
                {
                    type: "slider",
                    name: "perAttack",
                    init: 15,
                    min: 1,
                    max: 30,
                    step: 1,
                    label: (vm) => `発生頻度`
                }
            ],
            effect: {
                cond: (vm) => vm.useChainedAttack(),
                list: [{
                    target: "addChainedAttackInfo",
                    isDynamic: true,
                    condAttackProps: (props) => props.isAttack,
                    value: (vmdata, calc, info) => new Calc.AttackInfo(
                        SkywardAtlas.addAttackScale[vmdata.rank],
                        "atk",
                        {isPhysical: true, ...Calc.newAttackProps(info.props)},
                        1 / Number(vmdata.perAttack))
                }]
            }
        }
    ];
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new SkywardAtlas(),
        "Anemo",
        {
            "vm": {
                "parent_id": "skyward_atlas",
                "level": "90",
                "rank": 0,
                "useChainedAttack": false,
                "perAttack": 15
            },
            "expected": {
                "normal_100": 477.494919,
                "normal_elem_100": 534.79430928,
                "skill_100": 534.79430928,
                "burst_100": 534.79430928
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new SkywardAtlas().newViewModel()
    ));
});


// 四風原典
export class LostPrayerToTheSacredWinds extends Base.WeaponData
{
    constructor()
    {
        super(
            "lost_prayer_to_the_sacred_winds",
            "四風原典",
            5,
            "Catalyst",
            608,
            TypeDefs.StaticStatusType.crtRate,
            0.331
        );
    }


    static addDmgInc = [0.08, 0.10, 0.12, 0.14, 0.16];


    defineEffects = [
        {
            uiList: [
                {
                    type: "select",
                    name: "numOfStacks",
                    init: 4,
                    options: (vm) => iota(0, 5).map(e => {
                        return {value: e, label: `全元素ダメージ+${textPercentageFix(e * LostPrayerToTheSacredWinds.addDmgInc[vm.rank()] , 0)}` }; })
                },
            ],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.anemoDmg,
                        value: (vm) => Number(vm.numOfStacks()) * LostPrayerToTheSacredWinds.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.cryoDmg,
                        value: (vm) => Number(vm.numOfStacks()) * LostPrayerToTheSacredWinds.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.dendroDmg,
                        value: (vm) => Number(vm.numOfStacks()) * LostPrayerToTheSacredWinds.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.electroDmg,
                        value: (vm) => Number(vm.numOfStacks()) * LostPrayerToTheSacredWinds.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.geoDmg,
                        value: (vm) => Number(vm.numOfStacks()) * LostPrayerToTheSacredWinds.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.hydroDmg,
                        value: (vm) => Number(vm.numOfStacks()) * LostPrayerToTheSacredWinds.addDmgInc[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.pyroDmg,
                        value: (vm) => Number(vm.numOfStacks()) * LostPrayerToTheSacredWinds.addDmgInc[vm.rank()]
                    }
                ]
            }
        }
    ];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new LostPrayerToTheSacredWinds(),
        "Anemo",
        {
            "vm": {
                "parent_id": "lost_prayer_to_the_sacred_winds",
                "level": "90",
                "rank": 0,
                "numOfStacks": 4
            },
            "expected": {
                "normal_100": 391.43196,
                "normal_elem_100": 516.6901872000001,
                "skill_100": 516.6901872000001,
                "burst_100": 516.6901872000001
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new LostPrayerToTheSacredWinds().newViewModel()
    ));
});


// 浮世の錠
export class MemoryOfDust extends Base.WeaponData
{
    constructor()
    {
        super(
            "memory_of_dust",
            "浮世の錠",
            5,
            "Catalyst",
            608,
            "rateAtk",
            0.496
        );
    }


    newViewModel()
    {
        return new MemoryOfDustViewModel(this);
    }


    static effectTable = [
        [0.20, 0.25, 0.30, 0.35, 0.40], //シールド強化
        [0.04, 0.05, 0.06, 0.07, 0.08]  // 攻撃力%
    ];
}


// 浮世の錠
export class MemoryOfDustViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.isShielded = ko.observable(true);
        this.effectStacks = ko.observable(5);
    }


    rateAtkEffect(numStacks)
    {
        if(this.isShielded()) {
            return MemoryOfDust.effectTable[1][this.rank()] * Number(numStacks) * 2;
        } else {
            return MemoryOfDust.effectTable[1][this.rank()] * Number(numStacks);
        }
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseRateShieldStrength.value += MemoryOfDust.effectTable[0][this.rank()];
        calc.rateAtk.value += this.rateAtkEffect(this.effectStacks());

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "金璋君臨",
                Widget.checkBoxViewHTML("isShielded", "シールド状態")
                +
                Widget.selectViewHTML("effectStacks", [
                    {value: 0, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(0), 0)}`},
                    {value: 1, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(1), 0)}`},
                    {value: 2, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(2), 0)}`},
                    {value: 3, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(3), 0)}`},
                    {value: 4, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(4), 0)}`},
                    {value: 5, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(5), 0)}`},
                ])
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.isShielded = this.isShielded();
        obj.effectStacks = this.effectStacks();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.isShielded(obj.isShielded);
        this.effectStacks(obj.effectStacks);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new MemoryOfDust(),
        "Anemo",
        {
            "vm": {
                "parent_id": "memory_of_dust",
                "rank": 0,
                "isShielded": true,
                "effectStacks": 5
            },
            "expected": {
                "normal_100": 622.187568,
                "normal_elem_100": 622.187568,
                "skill_100": 622.187568,
                "burst_100": 622.187568
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new MemoryOfDust().newViewModel()
    ));
});


// 不滅の月華
export class EverlastingMoonglow extends Base.WeaponData
{
    constructor()
    {
        super(
            "everlasting_moonglow",
            "不滅の月華",
            5,
            "Catalyst",
            608,
            "rateHP",
            0.496
        );
    }


    static addHeal = [0.10, 0.125, 0.15, 0.175, 0.20];
    static addDmgHP = [0.01, 0.015, 0.02, 0.025, 0.03];


    defineEffects = [
        {
            uiList: [],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.healingBonus,
                        value: (vm) => EverlastingMoonglow.addHeal[vm.rank()]
                    },
                    {
                        target: TypeDefs.DynamicStatusType.increaseDamage,
                        isDynamic: true,
                        condAttackProps: (props) => props.isNormal,
                        value: (vmdata, calc, props) => calc.hp(props).mul(EverlastingMoonglow.addDmgHP[vmdata.rank])
                    }
                ]
            }
        }
    ];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new EverlastingMoonglow(),
        "Anemo",
        {
            "vm": {
                "parent_id": "everlasting_moonglow",
                "level": "90",
                "rank": 0
            },
            "expected": {
                "normal_100": 397.49760000000003,
                "normal_elem_100": 397.49760000000003,
                "skill_100": 328.158,
                "burst_100": 328.158
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new EverlastingMoonglow().newViewModel()
    ));
});


// 神楽の真意
export class KagurasVerity extends Base.WeaponData
{
    constructor()
    {
        super(
            "kaguras_verity",
            "神楽の真意",
            5,
            "Catalyst",
            608,
            TypeDefs.StaticStatusType.crtDmg,
            0.662
        );
    }


    static addSkillDmg = [0.12, 0.15, 0.18, 0.21, 0.24];
    static addElemDmg = [0.12, 0.15, 0.18, 0.21, 0.24];


    defineEffects = [
        {
            uiList: [
                {
                    type: "select",
                    name: "numOfStacks",
                    init: 3,
                    options: (vm) => [
                        ...iota(0, 3).map(e => {
                            return {value: e, label: `スキルダメージ+${textPercentageFix(e * KagurasVerity.addSkillDmg[vm.rank()] , 0)}` }; }),
                        {value: 3, label: `スキルダメージ+${textPercentageFix(3 * KagurasVerity.addSkillDmg[vm.rank()] , 0)}, 元素ダメージ+${textPercentageFix(KagurasVerity.addElemDmg[vm.rank()] , 0)}`}
                    ]
                },
            ],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.skillDmg,
                        value: (vm) => KagurasVerity.addSkillDmg[vm.rank()] * vm.numOfStacks(),
                    },
                    {
                        target: TypeDefs.StaticStatusType.anemoDmg,
                        value: (vm) => vm.numOfStacks() == 3 ? KagurasVerity.addElemDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.cryoDmg,
                        value: (vm) => vm.numOfStacks() == 3 ? KagurasVerity.addElemDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.dendroDmg,
                        value: (vm) => vm.numOfStacks() == 3 ? KagurasVerity.addElemDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.electroDmg,
                        value: (vm) => vm.numOfStacks() == 3 ? KagurasVerity.addElemDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.geoDmg,
                        value: (vm) => vm.numOfStacks() == 3 ? KagurasVerity.addElemDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.hydroDmg,
                        value: (vm) => vm.numOfStacks() == 3 ? KagurasVerity.addElemDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.pyroDmg,
                        value: (vm) => vm.numOfStacks() == 3 ? KagurasVerity.addElemDmg[vm.rank()] : 0
                    }
                ]
            }
        }
    ];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new KagurasVerity(),
        "Anemo",
        {
            "vm": {
                "parent_id": "kaguras_verity",
                "level": "90",
                "rank": 0,
                "numOfStacks": 3
            },
            "expected": {
                "normal_100": 338.70366,
                "normal_elem_100": 379.34809920000004,
                "skill_100": 501.2814168,
                "burst_100": 379.34809920000004
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new KagurasVerity().newViewModel()
    ));
});


// 西風秘典
export class FavoniusCodex extends Base.WeaponData
{
    constructor()
    {
        super(
            "favonius_codex",
            "西風秘典",
            4,
            "Catalyst",
            510,
            TypeDefs.StaticStatusType.recharge,
            0.459
        );
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new FavoniusCodex(),
        "Anemo",
        {
            "vm": {
                "parent_id": "favonius_codex",
                "level": "90",
                "rank": 0
            },
            "expected": {
                "normal_100": 282.735,
                "normal_elem_100": 282.735,
                "skill_100": 282.735,
                "burst_100": 282.735
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new FavoniusCodex().newViewModel()
    ));
});


// 祭礼の断片
export class SacrificialFragments extends Base.WeaponData
{
    constructor()
    {
        super(
            "sacrificial_fragments",
            "祭礼の断片",
            4,
            "Catalyst",
            454,
            TypeDefs.StaticStatusType.mastery,
            221
        );
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new SacrificialFragments(),
        "Anemo",
        {
            "vm": {
                "parent_id": "sacrificial_fragments",
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
        new SacrificialFragments().newViewModel()
    ));
});


// 昭心
export class EyeOfPerception extends Base.WeaponData
{
    constructor()
    {
        super(
            "eye_of_perception",
            "昭心",
            4,
            "Catalyst",
            454,
            TypeDefs.StaticStatusType.rateAtk,
            0.551
        );
    }


    static addAttackScale = [2.40, 2.70, 3.00, 3.30, 3.60];


    defineEffects = [
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useChainedAttack",
                    init: false,
                    label: (vm) => `通常/重撃の${textInteger(vm.perAttack())}回に1回${textPercentageFix(EyeOfPerception.addAttackScale[vm.rank()], 0)}の追加ダメージ x 4回`
                },
                {
                    type: "slider",
                    name: "perAttack",
                    init: 6,
                    min: 1,
                    max: 20,
                    step: 1,
                    label: (vm) => `発生頻度`
                }
            ],
            effect: {
                cond: (vm) => vm.useChainedAttack(),
                list: [{
                    target: "addChainedAttackInfo",
                    isDynamic: true,
                    condAttackProps: (props) => props.isNormal || props.isCharged,
                    value: (vmdata, calc, info) => new Array(4).fill(new Calc.AttackInfo(
                        EyeOfPerception.addAttackScale[vmdata.rank],
                        "atk",
                        {isPhysical: true, ...Calc.newAttackProps(info.props)},
                        1 / Number(vmdata.perAttack)))
                }]
            }
        }
    ];
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new EyeOfPerception(),
        "Anemo",
        {
            "vm": {
                "parent_id": "eye_of_perception",
                "level": "90",
                "rank": 0,
                "useChainedAttack": false,
                "perAttack": 6
            },
            "expected": {
                "normal_100": 398.2642290000001,
                "normal_elem_100": 398.2642290000001,
                "skill_100": 398.2642290000001,
                "burst_100": 398.2642290000001
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new EyeOfPerception().newViewModel()
    ));
});


// ダークアレイの酒と詩
export class WineAndSong extends Base.WeaponData
{
    constructor()
    {
        super(
            "wine_and_song",
            "ダークアレイの酒と詩",
            4,
            "Catalyst",
            565,
            TypeDefs.StaticStatusType.recharge,
            0.306
        );
    }


    static incRateAtk = [0.20, 0.25, 0.30, 0.35, 0.40];


    defineEffects = [
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useEffect",
                    init: true,
                    label: (vm) => `攻撃力+${textPercentageFix(WineAndSong.incRateAtk[vm.rank()], 0)}`
                }
            ],
            effect: {
                cond: (vm) => vm.useEffect(),
                list: [{
                    target: TypeDefs.StaticStatusType.rateAtk,
                    value: (vm) => WineAndSong.incRateAtk[vm.rank()],
                }]
            }
        }
    ];
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new WineAndSong(),
        "Anemo",
        {
            "vm": {
                "parent_id": "wine_and_song",
                "level": "90",
                "rank": 0,
                "useEffect": true
            },
            "expected": {
                "normal_100": 369.87300000000005,
                "normal_elem_100": 369.87300000000005,
                "skill_100": 369.87300000000005,
                "burst_100": 369.87300000000005
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new WineAndSong().newViewModel()
    ));
});


// 旧貴族秘法録
export class RoyalGrimoire extends Base.WeaponData
{
    constructor()
    {
        super(
            "royal_grimoire",
            "旧貴族秘法録",
            4,
            "Catalyst",
            565,
            "rateAtk",
            0.276
        );
    }


    newViewModel()
    {
        return new RoyalGrimoireViewModel(this);
    }


    static effectTable = [0.08, 0.10, 0.12, 0.14, 0.16];
}


// 旧貴族秘法録
export class RoyalGrimoireViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.selType = ko.observable("effective");  // effective | constant
        this.buffStacks = ko.observable(1);         // for this.selType() == "constant"
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.selType() == "constant") {
            calc.baseCrtRate.value += this.crtIncrease(this.buffStacks());
        } else {
            let incP = RoyalGrimoire.effectTable[this.rank()];

            calc = calc.applyExtension(Klass => class extends Klass {
                crtRate(attackProps)
                {
                    if(hasAnyProperties(attackProps, ["incCrtRateRoyalGrimoire"])) {
                        return super.crtRate(attackProps).add(attackProps.incCrtRateRoyalGrimoire);
                    } else {
                        return super.crtRate(attackProps);
                    }
                }

                modifyAttackInfo(attackInfo) {
                    return super.modifyAttackInfo(attackInfo).map(info => {
                        if(!hasAnyProperties(info.props, ["incCrtRateRoyalGrimoire"])) {
                            const cr = this.crtRate(info.props);
                            const inc = Calc.royalCriticalRate(cr, incP).sub(cr);

                            return new Calc.AttackInfo(info.scale, info.ref, {...info.props, incCrtRateRoyalGrimoire: inc}, info.prob);
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
        return RoyalGrimoire.effectTable[this.rank()] * Number(numStacks);
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(Widget.buildViewHTML(target, "集中",
            Widget.radioViewHTML("selType", [
                {value: "effective", label: "実質的な会心率の上昇量を利用"},
                {value: "constant", label: "固定の会心率の上昇量を利用"},
            ])
            +
            Widget.selectViewHTML("buffStacks", [
                {value: 0, label: `会心率+${textPercentageFix(this.crtIncrease(0), 0)}`},
                {value: 1, label: `会心率+${textPercentageFix(this.crtIncrease(1), 0)}`},
                {value: 2, label: `会心率+${textPercentageFix(this.crtIncrease(2), 0)}`},
                {value: 3, label: `会心率+${textPercentageFix(this.crtIncrease(3), 0)}`},
                {value: 4, label: `会心率+${textPercentageFix(this.crtIncrease(4), 0)}`},
                {value: 5, label: `会心率+${textPercentageFix(this.crtIncrease(5), 0)}`},
            ], undefined, {visible: "selType() == 'constant'"})
        ));

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.selType = this.selType();
        obj.buffStacks = this.buffStacks();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.selType(obj.selType);
        this.buffStacks(obj.buffStacks);
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new RoyalGrimoire(),
        "Anemo",
        {
            "vm": {
                "parent_id": "royal_grimoire",
                "level": "90",
                "rank": 0,
                "selType": "effective",
                "buffStacks": 1
            },
            "expected": {
                "normal_100": 432.28420916129016,
                "normal_elem_100": 432.28420916129016,
                "skill_100": 432.28420916129016,
                "burst_100": 432.28420916129016
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new RoyalGrimoire().newViewModel()
    ));
});


// 黒岩の緋玉
export class BlackcliffAgate extends Base.WeaponData
{
    constructor()
    {
        super(
            "blackcliff_agate",
            "黒岩の緋玉",
            4,
            "Catalyst",
            510,
            TypeDefs.StaticStatusType.crtDmg,
            0.551
        );
    }


    static incRateAtk = [0.12, 0.15, 0.18, 0.21, 0.24];


    defineEffects = [
        {
            uiList: [
                {
                    type: "select",
                    name: "numOfStacks",
                    init: 1,
                    options: (vm) => iota(0, 4).map(e => { return {value: e, label: `攻撃力+${textPercentageFix(e * BlackcliffAgate.incRateAtk[vm.rank()], 0)}` }; })
                }
            ],
            effect: {
                cond: (vm) => true,
                list: [{
                    target: TypeDefs.StaticStatusType.rateAtk,
                    value: (vm) => Number(vm.numOfStacks()) * BlackcliffAgate.incRateAtk[vm.rank()],
                }]
            }
        }
    ];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new BlackcliffAgate(),
        "Anemo",
        {
            "vm": {
                "parent_id": "blackcliff_agate",
                "level": "90",
                "rank": 0,
                "numOfStacks": 3
            },
            "expected": {
                "normal_100": 394.80456599999997,
                "normal_elem_100": 394.80456599999997,
                "skill_100": 394.80456599999997,
                "burst_100": 394.80456599999997
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new BlackcliffAgate().newViewModel()
    ));
});


// 流浪楽章
export class TheWidsith extends Base.WeaponData
{
    constructor()
    {
        super(
            "the_widsith",
            "流浪楽章",
            4,
            "Catalyst",
            510,
            "baseCrtDmg",
            0.551
        );
    }


    newViewModel()
    {
        return new TheWidsithViewModel(this);
    }


    static buffInc = [
        {atk: 0.60, dmg: 0.48, mry: 240},
        {atk: 0.75, dmg: 0.60, mry: 300},
        {atk: 0.90, dmg: 0.72, mry: 360},
        {atk: 1.05, dmg: 0.84, mry: 420},
        {atk: 1.20, dmg: 0.96, mry: 480},
    ];
}


// 流浪楽章, viewmodel
export class TheWidsithViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useAtkUp = ko.observable(true);
        this.useDmgUp = ko.observable(true);
        this.useMryUp = ko.observable(true);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let data = this.toJS();

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #dataWidsith = data;

            atk(attackProps) {
                if(attackProps.isWidsithAtkUp || false)
                    return super.atk(attackProps).add(this.baseAtk.mul( TheWidsith.buffInc[this.#dataWidsith.rank].atk ));
                else
                    return super.atk(attackProps);
            }

            allDmgBuff(attackProps) {
                if(attackProps.isWidsithDmgUp || false)
                    return super.allDmgBuff(attackProps).add(TheWidsith.buffInc[this.#dataWidsith.rank].dmg);
                else
                    return super.allDmgBuff(attackProps);
            }

            mastery(attackProps) {
                if(attackProps.isWidsithMryUp || false)
                    return super.mastery(attackProps).add(TheWidsith.buffInc[this.#dataWidsith.rank].mry);
                else
                    return super.mastery(attackProps);
            }

            modifyAttackInfo(attackInfo)
            {
                return super.modifyAttackInfo(attackInfo).map(info => {
                    if(info.props.isWidsithAtkUp || info.props.isWidsithDmgUp || info.props.isWidsithMryUp || false) {
                        return info;
                    }
    
                    let newprops = [];
    
                    if(this.#dataWidsith.useAtkUp) {
                        newprops.push({...info.props, isWidsithAtkUp: true});
                        // lbls.push('流浪楽章::攻撃力UP');
                    }
    
                    if(this.#dataWidsith.useDmgUp) {
                        newprops.push({...info.props, isWidsithDmgUp: true});
                        // lbls.push('流浪楽章::ダメージバフUP');
                    }
    
                    if(this.#dataWidsith.useMryUp) {
                        newprops.push({...info.props, isWidsithMryUp: true});
                        // lbls.push('流浪楽章::元素熟知UP');
                    }
    
                    if(newprops.length == 0) {
                        return info;
                    }
    
                    let prob = 1.0 / newprops.length;
    
                    return newprops.map(p => new Calc.AttackInfo(info.scale, info.ref, p, info.prob.mul(prob)));
                }).flat(10);
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    getBuffInc() { return TheWidsith.buffInc[this.rank()]; }

    countChecked() {
        return (this.useAtkUp() ? 1 : 0) + (this.useDmgUp() ? 1 : 0) + (this.useMryUp() ? 1 : 0)
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, `序曲（バフ選択）`,
                Widget.checkBoxViewHTML("useAtkUp", `攻撃力+${Widget.spanPercentageFix("getBuffInc().atk", 0)}（確率：${Widget.spanPercentageFix("useAtkUp() ? 1/countChecked() : 0", 0)}）`)
                +
                Widget.checkBoxViewHTML("useDmgUp", `ダメージ+${Widget.spanPercentageFix("getBuffInc().dmg", 0)}（確率：${Widget.spanPercentageFix("useDmgUp() ? 1/countChecked() : 0", 0)}）`)
                +
                Widget.checkBoxViewHTML("useMryUp", `元素熟知+${Widget.spanInteger("getBuffInc().mry")}（確率：${Widget.spanPercentageFix("useMryUp() ? 1/countChecked() : 0", 0)}）`)
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.useAtkUp = this.useAtkUp();
        obj.useDmgUp = this.useDmgUp();
        obj.useMryUp = this.useMryUp();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.useAtkUp(obj.useAtkUp);
        this.useDmgUp(obj.useDmgUp);
        this.useMryUp(obj.useMryUp);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new TheWidsith(),
        "Anemo",
        {
            "vm": {
                "parent_id": "the_widsith",
                "rank": 0,
                "useAtkUp": true,
                "useDmgUp": true,
                "useMryUp": true
            },
            "expected": {
                "normal_100": 394.80456599999997,
                "normal_elem_100": 394.80456599999997,
                "skill_100": 394.80456599999997,
                "burst_100": 394.80456599999997
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new TheWidsith().newViewModel()
    ));
});


// 金珀・試作
export class PrototypeAmber extends Base.WeaponData
{
    // TODO: 元素爆発後のHPやエネルギーの回復効果は未実装
    constructor()
    {
        super(
            "prototype_amber",
            "金珀・試作",
            4,
            "Catalyst",
            510,
            TypeDefs.StaticStatusType.rateHP,
            0.413
        );
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new PrototypeAmber(),
        "Anemo",
        {
            "vm": {
                "parent_id": "prototype_amber",
                "level": "90",
                "rank": 0
            },
            "expected": {
                "normal_100": 282.735,
                "normal_elem_100": 282.735,
                "skill_100": 282.735,
                "burst_100": 282.735
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new PrototypeAmber().newViewModel()
    ));
});


// 万国諸海の図譜
export class MappaMare extends Base.WeaponData
{
    constructor()
    {
        super(
            "mappa_mare",
            "万国諸海の図譜",
            4,
            "Catalyst",
            565,
            "baseMastery",
            110
        );
    }


    newViewModel()
    {
        return new MappaMareViewModel(this);
    }


    static buffInc = [0.08, 0.10, 0.12, 0.14, 0.16];
}


// 万国諸海の図譜
export class MappaMareViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.buffStacks = ko.observable(2);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let dmgbuff = MappaMare.buffInc[this.rank()] * Number(this.buffStacks());

        calc.baseAnemoDmg.value += dmgbuff;
        calc.baseGeoDmg.value += dmgbuff;
        calc.baseElectroDmg.value += dmgbuff;
        calc.basePyroDmg.value += dmgbuff;
        calc.baseHydroDmg.value += dmgbuff;
        calc.baseCryoDmg.value += dmgbuff;
        calc.baseDendroDmg.value += dmgbuff;

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        let rank_ = this.rank();
        dst.push(
            Widget.buildViewHTML(target, `注入の巻`,
                Widget.selectViewHTML("buffStacks", [
                    {value: 0, label: `元素ダメージ+${textPercentageFix(MappaMare.buffInc[rank_] * 0, 0)}`},
                    {value: 1, label: `元素ダメージ+${textPercentageFix(MappaMare.buffInc[rank_] * 1, 0)}`},
                    {value: 2, label: `元素ダメージ+${textPercentageFix(MappaMare.buffInc[rank_] * 2, 0)}`},
                ])
            )
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
        new MappaMare(),
        "Anemo",
        {
            "vm": {
                "parent_id": "mappa_mare",
                "rank": 0,
                "buffStacks": 2
            },
            "expected": {
                "normal_100": 308.2275,
                "normal_elem_100": 357.5439,
                "skill_100": 357.5439,
                "burst_100": 357.5439
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new MappaMare().newViewModel()
    ));
});


// 匣中日月
export class SolarPearl extends Base.WeaponData
{
    constructor()
    {
        super(
            "solar_pearl",
            "匣中日月",
            4,
            "Catalyst",
            510,
            TypeDefs.StaticStatusType.crtRate,
            0.276
        );
    }


    static addDmgInc = 	[0.20, 0.25, 0.30, 0.35, 0.40];


    defineEffects = [
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useSkillBurstUp",
                    init: true,
                    label: (vm) => `スキル/爆発ダメージ+${textPercentageFix(SolarPearl.addDmgInc[vm.rank()], 0)}`
                },
                {
                    type: "checkbox",
                    name: "useNormalUp",
                    init: true,
                    label: (vm) => `通常攻撃ダメージ+${textPercentageFix(SolarPearl.addDmgInc[vm.rank()], 0)}`
                }
            ],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.skillDmg,
                        value: (vm) => vm.useSkillBurstUp() ? SolarPearl.addDmgInc[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.burstDmg,
                        value: (vm) => vm.useSkillBurstUp() ? SolarPearl.addDmgInc[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.normalDmg,
                        value: (vm) => vm.useNormalUp() ? SolarPearl.addDmgInc[vm.rank()] : 0
                    },
                ]
            }
        }
    ];

}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new SolarPearl(),
        "Anemo",
        {
            "vm": {
                "parent_id": "solar_pearl",
                "level": "90",
                "rank": 0,
                "useSkillBurstUp": true,
                "useNormalUp": true
            },
            "expected": {
                "normal_100": 393.83064,
                "normal_elem_100": 393.83064,
                "skill_100": 393.83064,
                "burst_100": 393.83064
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new SolarPearl().newViewModel()
    ));
});


// 冬忍びの実
export class Frostbearer extends Base.WeaponData
{
    constructor()
    {
        super(
            "frostbearer",
            "冬忍びの実",
            4,
            "Catalyst",
            510,
            TypeDefs.StaticStatusType.rateAtk,
            0.413
        );
    }


    static dmgScale = [0.80, 0.95, 1.10, 1.25, 1.40];
    static dmgScaleCryo = [2.00, 2.40, 2.80, 3.20, 3.60];


    defineEffects = [
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useChainedAttack",
                    init: false,
                    label: (vm) => `通常/重撃の${textInteger(vm.perAttack())}回に1回追加ダメージ`
                },
                {
                    type: "slider",
                    name: "perAttack",
                    init: 15,
                    min: 1,
                    max: 30,
                    step: 1,
                    label: (vm) => `発生頻度`
                },
                {
                    type: "select",
                    name: "typeOfChainedAttack",
                    init: "normal",
                    options: (vm) => [
                        {value: "normal", label: `攻撃力の${textPercentageFix(Frostbearer.dmgScale[vm.rank()], 0)}のダメージ`},
                        {value: "cryo",   label: `攻撃力の${textPercentageFix(Frostbearer.dmgScaleCryo[vm.rank()], 0)}のダメージ（氷元素影響下）`}
                    ]
                }
            ],
            effect: {
                cond: (vm) => vm.useChainedAttack(),
                list: [{
                    target: "addChainedAttackInfo",
                    isDynamic: true,
                    condAttackProps: (props) => props.isNormal || props.isCharged,
                    value: (vmdata, calc, info) => new Calc.AttackInfo(
                        vmdata.typeOfChainedAttack === "normal" ? Frostbearer.dmgScale[vmdata.rank] : Frostbearer.dmgScaleCryo[vmdata.rank],
                        "atk",
                        {isPhysical: true, ...Calc.newAttackProps(info.props)},
                        1 / Number(vmdata.perAttack))
                }]
            }
        }
    ];
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new Frostbearer(),
        "Anemo",
        {
            "vm": {
                "parent_id": "frostbearer",
                "level": "90",
                "rank": 0,
                "useChainedAttack": false,
                "perAttack": 15,
                "typeOfChainedAttack": "normal"
            },
            "expected": {
                "normal_100": 399.50455500000004,
                "normal_elem_100": 399.50455500000004,
                "skill_100": 399.50455500000004,
                "burst_100": 399.50455500000004
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Frostbearer().newViewModel()
    ));
});


// ドドコの物語
export class DodocoTales extends Base.WeaponData
{
    constructor()
    {
        super(
            "dodoco_tales",
            "ドドコの物語",
            4,
            "Catalyst",
            454,
            TypeDefs.StaticStatusType.rateAtk,
            0.551
        );
    }


    static addChargedDmg = [0.16, 0.20, 0.24, 0.28, 0.32];
    static addRateAtk = [0.08, 0.10, 0.12, 0.14, 0.16];


    defineEffects = [
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useChargedUp",
                    init: true,
                    label: (vm) => `重撃ダメージ+${textPercentageFix(DodocoTales.addChargedDmg[vm.rank()], 0)}`
                },
                {
                    type: "checkbox",
                    name: "useAtkUp",
                    init: true,
                    label: (vm) => `攻撃力+${textPercentageFix(DodocoTales.addRateAtk[vm.rank()], 0)}`
                }
            ],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.chargedDmg,
                        value: (vm) => vm.useChargedUp() ? DodocoTales.addChargedDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.rateAtk,
                        value: (vm) => vm.useAtkUp() ? DodocoTales.addRateAtk[vm.rank()] : 0
                    },
                ]
            }
        }
    ];

}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new DodocoTales(),
        "Anemo",
        {
            "vm": {
                "parent_id": "dodoco_tales",
                "level": "90",
                "rank": 0,
                "useChargedUp": true,
                "useAtkUp": true
            },
            "expected": {
                "normal_100": 418.80654899999996,
                "normal_elem_100": 418.80654899999996,
                "skill_100": 418.80654899999996,
                "burst_100": 418.80654899999996
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new DodocoTales().newViewModel()
    ));
});


// 白辰の輪
export class HakushinRing extends Base.WeaponData
{
    constructor()
    {
        super(
            "hakushin_ring",
            "白辰の輪",
            4,
            "Catalyst",
            565,
            TypeDefs.StaticStatusType.recharge,
            0.306
        );
    }


    static addElementDmg = [0.10, 0.125, 0.15, 0.175, 0.20];


    defineEffects = [
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useAnemoDmgUp",
                    init: true,
                    label: (vm) => `風元素ダメージ+${textPercentageFix(HakushinRing.addElementDmg[vm.rank()], 0)}`
                },
                {
                    type: "checkbox",
                    name: "useCryoDmgUp",
                    init: true,
                    label: (vm) => `氷元素ダメージ+${textPercentageFix(HakushinRing.addElementDmg[vm.rank()], 0)}`
                },
                {
                    type: "checkbox",
                    name: "useDendroDmgUp",
                    init: true,
                    label: (vm) => `草元素ダメージ+${textPercentageFix(HakushinRing.addElementDmg[vm.rank()], 0)}`
                },
                {
                    type: "checkbox",
                    name: "useElectroDmgUp",
                    init: true,
                    label: (vm) => `雷元素ダメージ+${textPercentageFix(HakushinRing.addElementDmg[vm.rank()], 0)}`
                },
                {
                    type: "checkbox",
                    name: "useGeoDmgUp",
                    init: true,
                    label: (vm) => `岩元素ダメージ+${textPercentageFix(HakushinRing.addElementDmg[vm.rank()], 0)}`
                },
                {
                    type: "checkbox",
                    name: "useHydroDmgUp",
                    init: true,
                    label: (vm) => `水元素ダメージ+${textPercentageFix(HakushinRing.addElementDmg[vm.rank()], 0)}`
                },
                {
                    type: "checkbox",
                    name: "usePyroDmgUp",
                    init: true,
                    label: (vm) => `炎元素ダメージ+${textPercentageFix(HakushinRing.addElementDmg[vm.rank()], 0)}`
                },
            ],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.anemoDmg,
                        value: (vm) => vm.useAnemoDmgUp() ? HakushinRing.addElementDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.cryoDmg,
                        value: (vm) => vm.useCryoDmgUp() ? HakushinRing.addElementDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.dendroDmg,
                        value: (vm) => vm.useDendroDmgUp() ? HakushinRing.addElementDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.electroDmg,
                        value: (vm) => vm.useElectroDmgUp() ? HakushinRing.addElementDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.geoDmg,
                        value: (vm) => vm.useGeoDmgUp() ? HakushinRing.addElementDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.hydroDmg,
                        value: (vm) => vm.useHydroDmgUp() ? HakushinRing.addElementDmg[vm.rank()] : 0
                    },
                    {
                        target: TypeDefs.StaticStatusType.pyroDmg,
                        value: (vm) => vm.usePyroDmgUp() ? HakushinRing.addElementDmg[vm.rank()] : 0
                    },
                ]
            }
        }
    ];

}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new HakushinRing(),
        "Anemo",
        {
            "vm": {
                "parent_id": "hakushin_ring",
                "level": "90",
                "rank": 0,
                "useAnemoDmgUp": true,
                "useCryoDmgUp": true,
                "useDendroDmgUp": true,
                "useElectroDmgUp": true,
                "useGeoDmgUp": true,
                "useHydroDmgUp": true,
                "usePyroDmgUp": true
            },
            "expected": {
                "normal_100": 308.2275,
                "normal_elem_100": 339.05025000000006,
                "skill_100": 339.05025000000006,
                "burst_100": 339.05025000000006
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new HakushinRing().newViewModel()
    ));
});


// 誓いの明瞳
export class OathswornEye extends Base.WeaponData
{
    constructor()
    {
        super(
            "oathsworn_eye",
            "誓いの明瞳",
            4,
            "Catalyst",
            565,
            TypeDefs.StaticStatusType.rateAtk,
            0.276
        );
    }


    static addRecharge = [0.24, 0.30, 0.36, 0.42, 0.48];


    defineEffects = [
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useEffect",
                    init: true,
                    label: (vm) => `元素チャージ効率+${textPercentageFix(OathswornEye.addRecharge[vm.rank()], 0)}`
                },
            ],
            effect: {
                cond: (vm) => vm.useEffect(),
                list: [
                    {
                        target: TypeDefs.StaticStatusType.recharge,
                        value: (vm) => OathswornEye.addRecharge[vm.rank()]
                    }
                ]
            }
        }
    ];

}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new OathswornEye(),
        "Anemo",
        {
            "vm": {
                "parent_id": "oathsworn_eye",
                "level": "90",
                "rank": 0,
                "useEffect": true
            },
            "expected": {
                "normal_100": 393.29828999999995,
                "normal_elem_100": 393.29828999999995,
                "skill_100": 393.29828999999995,
                "burst_100": 393.29828999999995
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new OathswornEye().newViewModel()
    ));
});


// 翡玉法珠
export class EmeraldOrb extends Base.WeaponData
{
    constructor()
    {
        super(
            "emerald_orb",
            "翡玉法珠",
            3,
            "Catalyst",
            448,
            TypeDefs.StaticStatusType.mastery,
            94
        );
    }


    static addAtk = [0.20, 0.25, 0.30, 0.35, 0.40];


    defineEffects = [
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useEffect",
                    init: true,
                    label: (vm) => `攻撃力+${textPercentageFix(EmeraldOrb.addAtk[vm.rank()], 0)}`
                },
            ],
            effect: {
                cond: (vm) => vm.useEffect(),
                list: [
                    {
                        target: TypeDefs.StaticStatusType.rateAtk,
                        value: (vm) => EmeraldOrb.addAtk[vm.rank()]
                    }
                ]
            }
        }
    ];

}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new EmeraldOrb(),
        "Anemo",
        {
            "vm": {
                "parent_id": "emerald_orb",
                "level": "90",
                "rank": 0,
                "useEffect": true
            },
            "expected": {
                "normal_100": 304.79760000000005,
                "normal_elem_100": 304.79760000000005,
                "skill_100": 304.79760000000005,
                "burst_100": 304.79760000000005
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new EmeraldOrb().newViewModel()
    ));
});


// 魔導緒論
export class MagicGuide extends Base.WeaponData
{
    constructor()
    {
        super(
            "magic_guide",
            "魔導緒論",
            3,
            "Catalyst",
            354,
            TypeDefs.StaticStatusType.mastery,
            187
        );
    }


    static addDmg = [0.12, 0.15, 0.18, 0.21, 0.24];


    defineEffects = [
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useEffect",
                    init: true,
                    label: (vm) => `ダメージ+${textPercentageFix(MagicGuide.addDmg[vm.rank()], 0)}（水/雷元素影響下）`
                },
            ],
            effect: {
                cond: (vm) => vm.useEffect(),
                list: [
                    {
                        target: TypeDefs.StaticStatusType.allDmg,
                        value: (vm) => MagicGuide.addDmg[vm.rank()]
                    }
                ]
            }
        }
    ];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new MagicGuide(),
        "Anemo",
        {
            "vm": {
                "parent_id": "magic_guide",
                "level": "90",
                "rank": 0,
                "useEffect": true
            },
            "expected": {
                "normal_100": 235.68048000000002,
                "normal_elem_100": 235.68048000000002,
                "skill_100": 235.68048000000002,
                "burst_100": 235.68048000000002
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new MagicGuide().newViewModel()
    ));
});


// 龍殺しの英傑譚
export class ThrillingTalesOfDragonSlayers extends Base.WeaponData
{
    // 攻撃力バフは他のキャラクターへのバフなので未実装
    constructor(isBuffer = false)
    {
        super(
            "thrilling_tales_of_dragon_slayers",
            "龍殺しの英傑譚",
            3,
            "Catalyst",
            401,
            TypeDefs.StaticStatusType.rateHP,
            0.352
        );

        this.isBuffer = isBuffer;

        if(this.isBuffer) {
            this.defineEffects = [
                {
                    uiList: [
                        {
                            type: "select",
                            name: "rank",
                            init: 5,
                            options: (vm) => iota(0, 5).map(e => { return {value: e, label: `精錬ランク${textInteger(e+1)}，攻撃力+${textPercentageFix(ThrillingTalesOfDragonSlayers.rateAtk[e], 0)}`}; })
                        },
                    ],
                    effect: {
                        cond: (vm) => vm.useEffect(),
                        list: [
                            {
                                target: TypeDefs.StaticStatusType.rateAtk,
                                value: (vm) => ThrillingTalesOfDragonSlayers.rateAtk[vm.rank()]
                            }
                        ]
                    }
                }
            ]
        } else {
            this.defineEffects = [];
        }
    }


    static rateAtk = [0.24, 0.30, 0.36, 0.42, 0.48];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new ThrillingTalesOfDragonSlayers(false),
        "Anemo",
        {
            "vm": {
                "parent_id": "thrilling_tales_of_dragon_slayers",
                "level": "90",
                "rank": 0
            },
            "expected": {
                "normal_100": 232.21349999999998,
                "normal_elem_100": 232.21349999999998,
                "skill_100": 232.21349999999998,
                "burst_100": 232.21349999999998
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new ThrillingTalesOfDragonSlayers(false).newViewModel()
    ));
});


// 異世界旅行記
export class OtherworldlyStory extends Base.WeaponData
{
    constructor()
    {
        super(
            "otherworldly_story",
            "異世界旅行記",
            3,
            "Catalyst",
            401,
            TypeDefs.StaticStatusType.recharge,
            0.390
        );
    }


    defineEffects = [];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new OtherworldlyStory(),
        "Anemo",
        {
            "vm": {
                "parent_id": "otherworldly_story",
                "level": "90",
                "rank": 0
            },
            "expected": {
                "normal_100": 232.21349999999998,
                "normal_elem_100": 232.21349999999998,
                "skill_100": 232.21349999999998,
                "burst_100": 232.21349999999998
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new OtherworldlyStory().newViewModel()
    ));
});


// 特級の宝玉
export class TwinNephrite extends Base.WeaponData
{
    // 攻撃力バフは他のキャラクターへのバフなので未実装
    constructor()
    {
        super(
            "twin_nephrite",
            "特級の宝玉",
            3,
            "Catalyst",
            448,
            TypeDefs.StaticStatusType.crtRate,
            0.156
        );
    }


    static addAtk = [0.12, 0.14, 0.16, 0.18, 0.20];


    defineEffects = [
        {
            uiList: [
                {
                    type: "checkbox",
                    name: "useEffect",
                    init: true,
                    label: (vm) => `攻撃力+${textPercentageFix(TwinNephrite.addAtk[vm.rank()], 0)}`
                },
            ],
            effect: {
                cond: (vm) => vm.useEffect(),
                list: [
                    {
                        target: TypeDefs.StaticStatusType.rateAtk,
                        value: (vm) => TwinNephrite.addAtk[vm.rank()]
                    }
                ]
            }
        }
    ];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new TwinNephrite(),
        "Anemo",
        {
            "vm": {
                "parent_id": "twin_nephrite",
                "level": "90",
                "rank": 0,
                "useEffect": true
            },
            "expected": {
                "normal_100": 310.32933120000007,
                "normal_elem_100": 310.32933120000007,
                "skill_100": 310.32933120000007,
                "burst_100": 310.32933120000007
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new TwinNephrite().newViewModel()
    ));
});
