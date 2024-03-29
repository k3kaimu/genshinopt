import * as Base from './base.mjs';
import * as Calc from '../dmg-calc.mjs';
import * as Widget from '../widget.mjs';
import * as Utils from '../utils.mjs';
import * as TypeDefs from '../typedefs.mjs';

// 磐岩結緑
export class PrimordialJadeCutter extends Base.WeaponData
{
    constructor()
    {
        super(
            "primordial_jade_cutter",
            "磐岩結緑",
            5,
            "Sword",
            542,
            "baseCrtRate",
            0.441
        );
    }


    newViewModel()
    {
        return new PrimordialJadeCutterViewModel(this);
    }


    static hpInc = [0.20, 0.25, 0.30, 0.35, 0.40];
    static atkInc = [0.012, 0.015, 0.018, 0.021, 0.024];
}


// 磐岩結緑
export class PrimordialJadeCutterViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let data = this.toJS();
        data.atkInc = PrimordialJadeCutter.atkInc[data.rank];
        calc.rateHP.value += PrimordialJadeCutter.hpInc[data.rank];

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            priJadeCutData = data;

            atk(attackProps) {
                return super.atk(attackProps).add(this.hp(attackProps).mul(this.priJadeCutData.atkInc));
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new PrimordialJadeCutter(),
        "Anemo",
        {
            "vm": {
                "parent_id": "primordial_jade_cutter",
                "rank": 0
            },
            "expected": {
                "normal_100": 457.90002000000004,
                "normal_elem_100": 457.90002000000004,
                "skill_100": 457.90002000000004,
                "burst_100": 457.90002000000004
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new PrimordialJadeCutter().newViewModel()
    ));
});


// 波乱月白経津
export class HaranGeppakuFutsu extends Base.WeaponData
{
    constructor()
    {
        super(
            "haran_geppaku_futsu",
            "波乱月白経津",
            5,
            "Sword",
            608,
            TypeDefs.StaticStatusType.crtRate,
            0.331
        );
    }


    static addElemDmg = [0.12, 0.15, 0.18, 0.21, 0.24];
    static addNormalDmg = [0.20, 0.25, 0.30, 0.35, 0.40];


    defineEffects = [
        {
            uiList: [
                {
                    type: "select",
                    name: "numStacks",
                    init: 2,
                    options: (vm) => { return iota(0, 3).map(e => { return {value: e, label: `通常攻撃ダメージ+${textPercentageFix(HaranGeppakuFutsu.addNormalDmg[vm.rank()] * e)}`} }) }
                },
            ],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.normalDmg,
                        value: (vm) => HaranGeppakuFutsu.addNormalDmg[vm.rank()] * vm.numStacks()
                    },
                    {
                        target: TypeDefs.StaticStatusType.anemoDmg,
                        value: (vm) => HaranGeppakuFutsu.addElemDmg[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.cryoDmg,
                        value: (vm) => HaranGeppakuFutsu.addElemDmg[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.dendroDmg,
                        value: (vm) => HaranGeppakuFutsu.addElemDmg[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.electroDmg,
                        value: (vm) => HaranGeppakuFutsu.addElemDmg[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.geoDmg,
                        value: (vm) => HaranGeppakuFutsu.addElemDmg[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.hydroDmg,
                        value: (vm) => HaranGeppakuFutsu.addElemDmg[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.pyroDmg,
                        value: (vm) => HaranGeppakuFutsu.addElemDmg[vm.rank()]
                    }
                ]
            }
        }
    ];

}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new HaranGeppakuFutsu(),
        "Anemo",
        {
            "vm": {
                "parent_id": "haran_geppaku_futsu",
                "level": "90",
                "rank": 0,
                "numStacks": 2
            },
            "expected": {
                "normal_100": 548.004744,
                "normal_elem_100": 594.9765792000001,
                "skill_100": 438.40379520000005,
                "burst_100": 438.40379520000005
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new HaranGeppakuFutsu().newViewModel()
    ));
});


// 祭礼の剣
export class SacrificialSword extends Base.WeaponData
{
    constructor()
    {
        super(
            "sacrificial_sword",
            "祭礼の剣",
            4,
            "Sword",
            454,
            "baseRecharge",
            0.613
        );
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new SacrificialSword(),
        "Anemo",
        {
            "vm": {
                "parent_id": "sacrificial_sword",
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
        new SacrificialSword().newViewModel()
    ));
});


// 黒剣
export class TheBlackSword extends Base.WeaponData
{
    constructor()
    {
        super(
            "the_black_sword",
            "黒剣",
            4,
            "Sword",
            510,
            TypeDefs.StaticStatusType.crtRate,
            0.276
        );
    }


    static addNormalDmg = [0.20, 0.25, 0.30, 0.35, 0.40];


    defineEffects = [
        {
            uiList: [],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.normalDmg,
                        value: (vm) => TheBlackSword.addNormalDmg[vm.rank()]
                    },
                    {
                        target: TypeDefs.StaticStatusType.chargedDmg,
                        value: (vm) => TheBlackSword.addNormalDmg[vm.rank()]
                    },
                ]
            }
        }
    ];
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new TheBlackSword(),
        "Anemo",
        {
            "vm": {
                "parent_id": "the_black_sword",
                "level": "90",
                "rank": 0
            },
            "expected": {
                "normal_100": 393.83064,
                "normal_elem_100": 393.83064,
                "skill_100": 328.1922,
                "burst_100": 328.1922
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new TheBlackSword().newViewModel()
    ));
});



// シナバースピンドル
export class CinnabarSpindle extends Base.WeaponData
{
    constructor()
    {
        super(
            "cinnabar_spindle",
            "シナバースピンドル",
            4,
            "Sword",
            454,
            "rateDef",
            0.69
        );
    }


    newViewModel()
    {
        return new CinnabarSpindleViewModel(this);
    }


    static effectTable = [0.40, 0.50, 0.60, 0.70, 0.80];
}


// シナバースピンドル
export class CinnabarSpindleViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let ctx = Calc.VGData.context;
        let rateDefEff = CinnabarSpindle.effectTable[this.rank()];
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #dCinnabarRate = rateDefEff;

            increaseDamage(attackProps) {
                if(attackProps.isSkill) {
                    return super.increaseDamage(attackProps).add( this.def(attackProps).mul(this.#dCinnabarRate).as(ctx) );
                } else {
                    return super.increaseDamage(attackProps);
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new CinnabarSpindle(),
        "Anemo",
        {
            "vm": {
                "parent_id": "cinnabar_spindle",
                "rank": 0
            },
            "expected": {
                "normal_100": 256.779,
                "normal_elem_100": 256.779,
                "skill_100": 319.4442,
                "burst_100": 256.779
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new CinnabarSpindle().newViewModel()
    ));
});


// 斬岩・試作
export class PrototypeRancour extends Base.WeaponData
{
    constructor()
    {
        super(
            "prototype_rancour",
            "斬岩・試作",
            4,
            TypeDefs.WeaponType.Sword,
            565,
            TypeDefs.StaticStatusType.physicalDmg,
            0.345
        );
    }


    static atkDefInc = [0.04, 0.05, 0.06, 0.07, 0.08];


    static incRateAtkDef(rank, numStacks)
    {
        return Number(numStacks) * PrototypeRancour.atkDefInc[rank];
    }


    defineEffects = [
        {
            uiList: [
                {
                    type: "select",
                    name: "effectStacks",
                    init: 4,
                    options: (vm) => { return [
                        {value: 0, label: `攻撃力と防御力+${textPercentageFix(PrototypeRancour.incRateAtkDef(vm.rank(), 0), 0)}`},
                        {value: 1, label: `攻撃力と防御力+${textPercentageFix(PrototypeRancour.incRateAtkDef(vm.rank(), 1), 0)}`},
                        {value: 2, label: `攻撃力と防御力+${textPercentageFix(PrototypeRancour.incRateAtkDef(vm.rank(), 2), 0)}`},
                        {value: 3, label: `攻撃力と防御力+${textPercentageFix(PrototypeRancour.incRateAtkDef(vm.rank(), 3), 0)}`},
                        {value: 4, label: `攻撃力と防御力+${textPercentageFix(PrototypeRancour.incRateAtkDef(vm.rank(), 4), 0)}`}
                    ];}
                }
            ],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.StaticStatusType.rateAtk,
                        value: (vm) => PrototypeRancour.incRateAtkDef(vm.rank(), vm.effectStacks())
                    },
                    {
                        target: TypeDefs.StaticStatusType.rateDef,
                        value: (vm) => PrototypeRancour.incRateAtkDef(vm.rank(), vm.effectStacks())
                    },
                ]
            }
        }
    ]
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new PrototypeRancour(),
        "Anemo",
        {
            "vm": {
                "parent_id": "prototype_rancour",
                "level": "90",
                "rank": 0,
                "effectStacks": 4
            },
            "expected": {
                "normal_100": 480.89654550000006,
                "normal_elem_100": 357.5439,
                "skill_100": 357.5439,
                "burst_100": 357.5439
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new PrototypeRancour().newViewModel()
    ));
});
