import * as Base from './base.mjs';
import * as Widget from '../widget.mjs';
import * as Calc from '../dmg-calc.mjs';
import * as Utils from '../utils.mjs';
import * as TypeDefs from '../typedefs.mjs';


export class HydroCharacterViewModel extends Base.CharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.reactionProb = ko.observable(0);
    }


    viewHTMLList(target){
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "蒸発反応",
                Widget.sliderViewHTML("reactionProb", 0, 1, 0.1,
                    `反応確率：` + Widget.spanPercentage("reactionProb()", 2))
            )
        );

        return dst;
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let prob = Number(this.reactionProb());
        if(prob == 0)
            return calc;

        calc = calc.applyExtension(Klass => class extends Klass {
            modifyAttackInfo(attackInfo) {
                return super.modifyAttackInfo(attackInfo)
                    .map(info => {
                        if("isVaporize" in info.props || "isMelt" in info.props) {
                            // 冪等性を保つために，info.propsにすでにisVaporizeやisMeltが存在するときには
                            // 元素反応の計算をせずにそのまま返す
                            return info;
                        } else if(info.props.isHydro || false)
                        {
                            // 冪等性を保つために，必ず[type]: falseも入れる
                            return [
                                new Calc.AttackInfo(info.scale, info.ref, {...info.props, isVaporize: false}, info.prob.mul(1 - prob)),
                                new Calc.AttackInfo(info.scale, info.ref, {...info.props, isVaporize: true}, info.prob.mul(prob))
                            ];
                        } else {
                            return info;
                        }
                    }).flat(10);
            }
        });

        return calc;
    }


    toJS() {
        let obj = super.toJS();
        obj.reactionProb = this.reactionProb();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.reactionProb(obj.reactionProb || 0);
    }
}


// モナ
export class Mona extends Base.CharacterData
{
    constructor()
    {
        super(
            "mona",
            "モナ",
            5,
            "Hydro",
            "Catalyst",
            [22, 58, 115, 148, 186, 219, 253, 287],             /* bAtk */
            [51, 132, 263, 338, 424, 500, 576, 653],            /* bDef */
            [810, 2102, 4185, 5383, 6752, 7964, 9184, 10409],   /* bHP */
            "baseRecharge",  /* bBonusType */
            0.320       /* bBonusValue */
        )
    }


    
    newViewModel()
    {
        return new (MonaViewModel(HydroCharacterViewModel))(this, false);
    }


    static normalTalentTable = [
    //  0-3:通常4段, 4:重撃, 5:落下, 6:低空, 7:高空
        [0.376, 0.360, 0.448, 0.562, 1.500, 0.568, 1.140, 1.420],
        [0.404, 0.387, 0.482, 0.604, 1.610, 0.615, 1.230, 1.530],
        [0.432, 0.414, 0.515, 0.646, 1.720, 0.661, 1.320, 1.650],
        [0.470, 0.450, 0.560, 0.702, 1.870, 0.727, 1.450, 1.820],
        [0.498, 0.477, 0.594, 0.744, 1.980, 0.773, 1.550, 1.930],
        [0.526, 0.504, 0.627, 0.786, 2.100, 0.826, 1.650, 2.060],
        [0.564, 0.540, 0.672, 0.842, 2.250, 0.899, 1.800, 2.240],
        [0.602, 0.576, 0.717, 0.899, 2.400, 0.971, 1.940, 2.430],
        [0.639, 0.612, 0.762, 0.955, 2.550, 1.040, 2.090, 2.610],
        [0.677, 0.648, 0.806, 1.010, 2.690, 1.120, 2.250, 2.810],
        [0.714, 0.684, 0.851, 1.070, 2.850, 1.200, 2.400, 3.000]
    ];


    static skillTalentTable = [
    // 0:継続, 1:爆裂
        [0.320, 1.330],
        [0.344, 1.430],
        [0.368, 1.530],
        [0.400, 1.660],
        [0.424, 1.760],
        [0.448, 1.860],
        [0.480, 1.990],
        [0.512, 2.120],
        [0.544, 2.260],
        [0.576, 2.390],
        [0.608, 2.520],
        [0.640, 2.660],
        [0.680, 2.820]
    ];


    static burstTalentTable = [
    // 0:破裂, 1:ダメバフ
        [4.420, 0.420],
        [4.760, 0.440],
        [5.090, 0.460],
        [5.530, 0.480],
        [5.860, 0.500],
        [6.190, 0.520],
        [6.640, 0.540],
        [7.080, 0.560],
        [7.520, 0.580],
        [7.960, 0.600],
        [8.410, 0.600],
        [8.850, 0.600],
        [9.400, 0.600],
        [9.940, 0.600]
    ];


    static presetAttacks = [
        {
            id: "normal_total",
            label: "通常4段累計",
            dmgScale(vm){ return vm.normalTalentRow().slice(0, 4); },
            attackProps: { isNormal: true, isHydro: true }
        },
        {
            id: "charged",
            label: "重撃",
            dmgScale(vm){ return vm.normalTalentRow()[4]; },
            attackProps: { isCharged: true, isHydro: true }
        },
        {
            id: "skill_cont",
            label: "スキル継続ダメージ",
            dmgScale(vm){ return vm.skillTalentRow()[0]; },
            attackProps: { isSkill: true, isHydro: true }
        },
        {
            id: "skill_last",
            label: "スキル爆裂ダメージ",
            dmgScale(vm){ return vm.skillTalentRow()[1]; },
            attackProps: { isSkill: true, isHydro: true }
        },
        {
            id: "burst_dmg",
            label: "元素爆発爆裂ダメージ",
            dmgScale(vm){ return vm.burstTalentRow()[0]; },
            attackProps: { isBurst: true, isHydro: true }
        },
    ];
}


// モナ
export let MonaViewModel = (Klass) => class extends Klass
{
    constructor(parent, isBuffer)
    {
        super(parent);

        // チャージ効率の20%を水バフへ変換
        if(!isBuffer) {
            this.registerTalent({
                type: "Other",
                requiredC: 0,
                uiList: [],
                effect: {
                    cond: (vm) => true,
                    list: [{
                        target: TypeDefs.DynamicStatusType.hydroDmg,
                        isDynamic: true,
                        condAttackProps: (attackProps) => true,
                        value: (vmdata, calc, props) => calc.recharge(props).mul(0.2)
                    }]
                }
            });
        }

        // 爆発によるダメージ増加
        this.registerTalent({
            type: "Burst",
            requiredC: 0,
            uiList: [{
                type: "checkbox",
                name: "useBurstDmgUp",
                init: true,
                label: (vm) => `ダメージ${textPercentageFix(vm.burstTalentRow()[1], 0)}上昇`,
            }],
            effect: {
                cond: (vm) => vm.useBurstDmgUp(),
                list: [{
                    target: TypeDefs.StaticStatusType.allDmg,
                    value: (vm) => vm.burstTalentRow()[1],
                }]
            }
        });


        // 1凸効果
        this.registerTalent({
            type: "Burst",
            requiredC: 1,
            uiList: [{
                type: "checkbox",
                name: "useC1Effect",
                init: true,
                label: (vm) => `感電+15%/蒸発+15%/水拡散+15%（1凸）`
            }],
            effect: {
                cond: (vm) => vm.useC1Effect(),
                list: [
                    {
                        target: TypeDefs.StaticStatusType.electroChargedBonus,
                        value: (vm) => 0.15
                    },
                    {
                        target: TypeDefs.StaticStatusType.vaporizeBonus,
                        value: (vm) => 0.15
                    },
                    {
                        target: TypeDefs.StaticStatusType.swirlBonus,
                        isDynamic: true,
                        condAttackProps: (props) => props.isHydro,
                        value: (vmdata, calc, props) => 0.15
                    }
                ]
            }
        });


        // 4凸効果
        this.registerTalent({
            type: "Burst",
            requiredC: 4,
            uiList: [{
                type: "checkbox",
                name: "useC4Effect",
                init: true,
                label: (vm) => `会心率+15%（4凸）`
            }],
            effect: {
                cond: (vm) => vm.useC4Effect(),
                list: [
                    {
                        target: TypeDefs.StaticStatusType.crtRate,
                        value: (vm) => 0.15
                    }
                ]
            }
        });


        // 6凸効果
        if(!isBuffer) {
            this.registerTalent({
                type: "Burst",
                requiredC: 6,
                uiList: [{
                    type: "select",
                    name: "stacksOfC6Effect",
                    init: 3,
                    options: (vm) => [0, 1, 2, 3].map(e => {return {label: `+${textPercentageFix(e*0.6, 0)}`, value: e};}),
                    label: (vm) => "重撃ダメージ増加(6凸)",
                }],
                effect: {
                    cond: (vm) => true,
                    list: [
                        {
                            target: TypeDefs.StaticStatusType.chargedDmg,
                            value: (vm) => 0.6 * Number(vm.stacksOfC6Effect()),
                        }
                    ]
                }
            });
        }
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Mona(),
        {
            "vm": {
                "level": "90",
                "parent_id": "mona",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "useBurstDmgUp": true,
                "useC1Effect": true,
                "useC4Effect": true,
                "stacksOfC6Effect": 3,
                "reactionProb": 0
            },
            "expected": {
                "normal_total": 1379.3171263199997,
                "charged": 2341.8434744999995,
                "skill_cont": 252.81284255999995,
                "skill_last": 1050.2886473999997,
                "burst_dmg": 3494.765764799999
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Mona().newViewModel()
    ));
});


// タルタリヤ
export class Tartaglia extends Base.CharacterData
{
    constructor()
    {
        super(
            "tartaglia",
            "タルタリヤ",
            5,
            "Hydro",
            "Bow",
            301,        /* bAtk */
            815,        /* bDef */
            13103,      /* bHP */
            "baseHydroDmg",  /* bBonusType */
            0.288        /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new TartagliaViewModel(this);
    }


    static normalDmgTable = [
        // 0:1段目, 1:2段目,  2:3段目,  3:4段目,   4:5段目,  5:6段目,  6:狙い撃ち,7:フルチャージ, 8:断流閃, 9:断流破, 10:落下中, 11:低空, 12:高空
        [41.3/100, 46.3/100, 55.4/100, 57.0/100, 60.9/100, 72.8/100, 43.9/100, 124/100, 12.4/100*3, 62.0/100, 63.9/100, 128/100, 160/100],          // lv. 1
        [44.6/100, 50.0/100, 59.9/100, 61.7/100, 65.8/100, 78.7/100, 47.4/100, 133/100, 13.3/100*3, 66.7/100, 69.1/100, 138/100, 173/100],
        [48.0/100, 53.8/100, 64.4/100, 66.3/100, 70.8/100, 84.6/100, 51.0/100, 143/100, 14.3/100*3, 71.3/100, 74.3/100, 149/100, 186/100],
        [52.8/100, 59.2/100, 70.8/100, 72.9/100, 77.9/100, 93.1/100, 56.1/100, 155/100, 15.5/100*3, 77.5/100, 81.8/100, 164/100, 204/100],
        [56.2/100, 62.9/100, 75.3/100, 77.6/100, 82.8/100, 99.0/100, 59.7/100, 164/100, 16.4/100*3, 82.2/100, 87.0/100, 174/100, 217/100],
        [60.0/100, 67.3/100, 80.5/100, 82.9/100, 88.5/100, 105.8/100, 63.8/100, 174/100, 17.4/100*3, 86.8/100, 92.9/100, 186/100, 232/100],
        [65.3/100, 73.2/100, 87.6/100, 90.2/100, 96.3/100, 115.1/100, 69.4/100, 186/100, 18.6/100*3, 93.0/100, 101.1/100, 202/100, 253/100],
        [70.6/100, 79.1/100, 94.7/100, 97.5/100, 104.1/100, 124.4/100, 75.0/100, 198/100, 19.8/100*3, 99.2/100, 109.3/100, 219/100, 273/100],
        [75.8/100, 85.0/100, 101.8/100, 104.8/100, 111.9/100, 133.7/100, 80.6/100, 211/100, 21.1/100*3, 105.4/100, 117.5/100, 235/100, 293/100],
        [81.6/100, 91.5/100, 109.5/100, 112.7/100, 120.4/100, 143.8/100, 86.7/100, 223/100, 22.3/100*3, 111.6/100, 126.4/100, 253/100, 316/100],
        [87.4/100, 97.9/100, 117.2/100, 120.7/100, 128.9/100, 154.0/100, 92.8/100, 236/100, 23.6/100*3, 117.8/100, 135.3/100, 271/100, 338/100]     // lv. 11
    ];

    static skillDmgTable = [
        // 0:切替時, 1:1段目, 2:2段目, 3:3段目,  4:4段目,  5:5段目,   6:6段目,           7:重撃,            8:断流斬
        [72/100, 38.9/100, 41.6/100, 56.3/100, 59.9/100, 55.3/100, [35.4/100, 37.7/100], [60.2/100, 72.0/100], 60/100],               // lv. 1
        [77/100, 42.0/100, 45.0/100, 60.9/100, 64.8/100, 59.8/100, [38.3/100, 40.7/100], [65.1/100, 77.8/100], 65/100],
        [83/100, 45.2/100, 48.4/100, 65.5/100, 69.7/100, 64.3/100, [41.2/100, 43.8/100], [70.0/100, 83.7/100], 70/100],
        [90/100, 49.7/100, 53.2/100, 72.1/100, 76.7/100, 70.7/100, [45.3/100, 48.2/100], [77.0/100, 92.1/100], 77/100],
        [95/100, 52.9/100, 56.6/100, 76.6/100, 81.5/100, 75.2/100, [48.2/100, 51.2/100], [81.9/100, 97.9/100], 82/100],
        [101/100, 56.5/100, 60.5/100, 81.9/100, 87.1/100, 80.4/100, [51.5/100, 54.8/100], [87.5/100, 104.6/100], 88/100],
        [108/100, 61.5/100, 65.8/100, 89.1/100, 94.8/100, 87.4/100, [56.0/100, 59.6/100], [95.2/100, 113.8/100], 95/100],
        [115/100, 66.4/100, 71.1/100, 96.3/100, 102.5/100, 94.5/100, [60.6/100, 64.4/100], [102.9/100, 123.0/100], 103/100],
        [122/100, 71.4/100, 76.5/100, 103.5/100, 110.1/100, 101.6/100, [65.1/100, 69.2/100], [110.6/100, 132.2/100], 111/100],
        [130/100, 76.8/100, 82.3/100, 111.4/100, 118.5/100, 109.3/100, [70/100, 74.5/100], [119/100, 142.3/100], 119/100],
        [137/100, 82.3/100, 88.1/100, 119.2/100, 126.9/100, 117/100, [75/100, 79.7/100], [127.4/100, 152.3/100], 127/100],
        [144/100, 87.7/100, 93.9/100, 127.1/100, 135.2/100, 124.7/100, [79.9/100, 85.0/100], [135.8/100, 162.4/100], 136/100],
        [153/100, 93.1/100, 99.7/100, 134.9/100, 143.6/100, 132.5/100, [84.9/100, 90.2/100], [144.2/100, 172.4/100], 144/100]         // lv. 13
    ];


    static burstScale = [
        // 0: 近接, 1:遠隔, 2:断流爆
        [464/100, 378/100, 120/100],    // lv. 1
        [499/100, 407/100, 129/100],
        [534/100, 435/100, 138/100],
        [580/100, 473/100, 150/100],
        [615/100, 501/100, 159/100],
        [650/100, 530/100, 168/100],
        [696/100, 568/100, 180/100],
        [742/100, 605/100, 192/100],
        [789/100, 643/100, 204/100],
        [835/100, 681/100, 216/100],
        [882/100, 719/100, 228/100],
        [928/100, 757/100, 240/100],
        [986/100, 804/100, 255/100],
        [1044/100, 851/100, 270/100],   // lv. 14
    ];


    static presetAttacks = [
        {
            id: "bow_total",
            label: "弓6段累計",
            dmgScale: vm => Tartaglia.normalDmgTable[vm.normalRank()-1].slice(0, 6),
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "bow_charged",
            label: "弓フルチャージ",
            dmgScale: vm => Tartaglia.normalDmgTable[vm.normalRank()-1][7],
            attackProps: { isCharged: true, isHydro: true }
        },
        {
            id: "sword_total",
            label: "双剣6段累計",
            dmgScale: vm => Tartaglia.skillDmgTable[vm.skillRank()-1].slice(1, 7).flat(10),
            attackProps: { isNormal: true, isHydro: true }
        },
        {
            id: "sword_charged",
            label: "双剣重撃",
            dmgScale: vm => Tartaglia.skillDmgTable[vm.skillRank()-1][7],
            attackProps: { isCharged: true, isHydro: true }
        },
        {
            id: "bow_burst",
            label: "元素爆発：遠隔",
            dmgScale: vm => Tartaglia.burstScale[vm.burstRank()-1][1],
            attackProps: { isBurst: true, isHydro: true }
        },
        {
            id: "sword_burst",
            label: "元素爆発中：近接",
            dmgScale: vm => Tartaglia.burstScale[vm.burstRank()-1][0],
            attackProps: { isBurst: true, isHydro: true }
        }
    ];
}


// タルタリヤ
export class TartagliaViewModel extends HydroCharacterViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Tartaglia(),
        {
            "vm": {
                "parent_id": "tartaglia",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "reactionProb": 0
            },
            "expected": {
                "bow_total": 1485.6591374999998,
                "bow_charged": 658.6535276999999,
                "sword_total": 1864.83231018,
                "sword_charged": 757.9197939599999,
                "bow_burst": 2007.1763901,
                "sword_burst": 2462.9271723
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Tartaglia().newViewModel()
    ));
});


// 神里綾人
export class KamisatoAyato extends Base.CharacterData
{
    constructor()
    {
        super(
            "kamisato_ayato",
            "神里綾人",
            5,
            "Hydro",
            "Sword",
            [23, 60, 120, 154, 194, 228, 263, 299],                 /* bAtk */
            [60, 155, 309, 397, 499, 588, 678, 769],                /* bDef */
            [1068, 2770, 5514, 7092, 8897, 10494, 12101, 13715],    /* bHP */
            TypeDefs.StaticStatusType.crtDmg,                   /* bBonusType */
            0.384                                               /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new KamisatoAyatoViewModel(this);
    }


    static normalTalentTable = [
    //  0-4:通常5段，5:重撃，6:落下，7:低空/高空
        [0.450, 0.472, 0.586, [0.294, 0.294], 0.756, 1.295, 0.639, [1.280, 1.600]], // lv. 1
        [0.486, 0.510, 0.634, [0.318, 0.318], 0.818, 1.401, 0.691, [1.380, 1.730]],
        [0.523, 0.548, 0.682, [0.342, 0.342], 0.879, 1.506, 0.743, [1.490, 1.860]],
        [0.575, 0.603, 0.750, [0.377, 0.377], 0.967, 1.657, 0.818, [1.640, 2.040]],
        [0.612, 0.642, 0.797, [0.401, 0.401], 1.029, 1.762, 0.870, [1.740, 2.170]],
        [0.654, 0.685, 0.852, [0.428, 0.428], 1.099, 1.883, 0.929, [1.860, 2.320]],
        [0.711, 0.746, 0.927, [0.466, 0.466], 1.196, 2.048, 1.011, [2.020, 2.530]],
        [0.769, 0.806, 1.002, [0.503, 0.503], 1.292, 2.214, 1.093, [2.190, 2.730]],
        [0.826, 0.866, 1.077, [0.541, 0.541], 1.389, 2.380, 1.175, [2.350, 2.930]],
        [0.889, 0.932, 1.159, [0.582, 0.582], 1.495, 2.560, 1.264, [2.530, 3.160]],
        [0.952, 0.998, 1.240, [0.623, 0.623], 1.600, 2.741, 1.353, [2.710, 3.380]]  // lv. 11
    ];


    static skillTalentTable = [
        // 0:1段ダメージ, 1:2段ダメージ, 2:3段ダメージ, 3: HP参照ダメージ増加，4:幻影ダメージ
        [0.529, 0.589, 0.649, 0.56*0.01, 1.015],    // lv. 1
        [0.572, 0.637, 0.702, 0.61*0.01, 1.097],
        [0.615, 0.685, 0.755, 0.65*0.01, 1.180],
        [0.677, 0.754, 0.831, 0.72*0.01, 1.298],
        [0.720, 0.801, 0.883, 0.76*0.01, 1.381],
        [0.769, 0.856, 0.944, 0.82*0.01, 1.475],
        [0.836, 0.932, 1.027, 0.89*0.01, 1.605],
        [0.904, 1.007, 1.110, 0.96*0.01, 1.735],
        [0.972, 1.082, 1.193, 1.03*0.01, 1.864],
        [1.046, 1.165, 1.284, 1.11*0.01, 2.006]     // lv. 10
    ];


    static burstTalentTable = [
        // 0:ダメージ, 1:通常ダメバフ
        [0.665, 0.110],
        [0.714, 0.120],
        [0.764, 0.130],
        [0.831, 0.140],
        [0.881, 0.150],
        [0.930, 0.160],
        [0.997, 0.170],
        [1.063, 0.180],
        [1.130, 0.190],
        [1.196, 0.200]
    ];


    static presetAttacks = [
        {
            id: "normal_total",
            label: "通常5段累計",
            dmgScale(vm){ return vm.normalTalentRow().slice(0, 5).flat(10); },
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "charged_1",
            label: "重撃",
            dmgScale(vm){ return vm.normalTalentRow()[5]; },
            attackProps: { isCharged: true, isPhysical: true }
        },
        {
            id: "skill_dmg",
            label: "スキル3段累計",
            dmgScale(vm) { return vm.skillTalentRow().slice(0, 3).flat(10); },
            attackProps: { isNormal: true, isHydro: true, isAyatoShunsuiken: true }
        },
        {
            id: "skill_dmg_C6",
            label: "6凸効果：450%瞬水剣x2",
            dmgScale(vm) { return [4.5, 4.5]; },
            attackProps: { isNormal: true, isHydro: true, isAyatoShunsuiken: true, isAyatoShunsuikenC6: true, }
        },
        {
            id: "burst_dmg",
            label: "元素爆発ダメージ",
            dmgScale(vm) { return vm.burstTalentRow()[0]; },
            attackProps: { isBurst: true, isHydro: true }
        },
    ];
}


// 神里綾人
export class KamisatoAyatoViewModel extends HydroCharacterViewModel
{
    // TODO: 4凸効果は未実装

    constructor(parent)
    {
        super(parent);

        // スキル：浪閃によるダメージ増加
        this.registerTalent({
            type: "Skill",
            requiredC: 0,
            uiList: [{
                type: "select",
                name: "skillStacks",
                init: 4,
                options: (vm) => {
                    let maxS = 4;
                    if(vm.constell() >= 2)
                        maxS = 5;

                    return iota(0, maxS+1).map(e => { return {value: e, label: `浪閃${e}スタック`}; });
                },
            }],
            effect: {
                cond: (vm) => true,
                list: [
                    {
                        target: TypeDefs.DynamicStatusType.increaseDamage,
                        isDynamic: true,
                        condAttackProps: (props) => props.isAyatoShunsuiken && !(props.isAyatoShunsuikenC6),
                        value: (vmdata, calc, props) => calc.hp(props).mul(KamisatoAyato.skillTalentTable[vmdata.skillRank-1][3])
                    }
                ]
            }
        });

        // 爆発：通常ダメバフ
        this.registerTalent({
            type: "Burst",
            requiredC: 0,
            uiList: [{
                type: "checkbox",
                name: "useBurstNormalDmgUp",
                init: true,
                label: (vm) => "通常ダメージ増加（爆発エリア内）"
            }],
            effect: {
                cond: (vm) => vm.useBurstNormalDmgUp(),
                list: [{
                    target: TypeDefs.StaticStatusType.normalDmg,
                    value: (vm) => KamisatoAyato.burstTalentTable[vm.burstRank()-1][1]
                }]
            }
        });

        // 1凸効果
        this.registerTalent({
            type: "Skill",
            requiredC: 1,
            uiList: [{
                type: "checkbox",
                name: "useC1Effect",
                init: true,
                label: (vm) => "瞬水剣ダメージ+40%（1凸，HP50%以下の敵）"
            }],
            effect: {
                cond: (vm) => vm.useC1Effect(),
                list: [{
                    target: TypeDefs.DynamicStatusType.allDmg,
                    isDynamic: true,
                    condAttackProps: (props) => props.isAyatoShunsuiken,
                    value: (vmdata, calc, props) => 0.4,
                }]
            }
        });

        // 2凸効果
        this.registerTalent({
            type: "Skill",
            requiredC: 2,
            uiList: [],
            effect: {
                cond: (vm) => vm.skillStacks() >= 3,
                list: [{
                    target: TypeDefs.StaticStatusType.rateHP,
                    value: (vm) => 0.5,
                }]
            }
        });
    }

    
    // TODO: 10までのデータしかない
    maxNormalTalentRank() { return 11; }
    maxSkillTalentRank() { return 10; }
    maxBurstTalentRank() { return 10; }
}


// runUnittest(function(){
//     console.assert(Utils.checkUnittestForCharacter(
//         new KamisatoAyato(),
//         {
//             "vm": {
//                 "level": "90",
//                 "parent_id": "kamisato_ayato",
//                 "constell": 6,
//                 "normalRank": 9,
//                 "skillRank": 9,
//                 "burstRank": 9,
//                 "skillStacks": 4,
//                 "useBurstNormalDmgUp": true,
//                 "useC1Effect": true,
//                 "reactionProb": 0
//             },
//             "expected": {
//                 "normal_total": 1585.871027748,
//                 "charged_1": 605.2942853999999,
//                 "skill_dmg": 1828.1606880017252,
//                 "skill_dmg_C6": 3639.395472300001,
//                 "burst_dmg": 287.3876229,
//                 "__elemReact_ElectroCharged__": 1562.4
//             }
//         }
//     ));

//     console.assert(Utils.checkSerializationUnittest(
//         new KamisatoAyato().newViewModel()
//     ));
// });


// 行秋
export class Xingqiu extends Base.CharacterData
{
    constructor()
    {
        super(
            "xingqiu",
            "行秋",
            4,
            "Hydro",
            "Sword",
            201,        /* bAtk */
            758,        /* bDef */
            10222,      /* bHP */
            "rateAtk",  /* bBonusType */
            0.240        /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new (XingqiuViewModel(HydroCharacterViewModel))(this, false);
    }


    static normalTalentTable = [
        // 0-4: 通常5段, 5:重撃, 6:落下, 7:低空, 8:高空
        [0.466, 0.476, [0.286, 0.286], 0.560, [0.359, 0.359], [0.473, 0.562], 0.639, 1.280, 1.600],
        [0.504, 0.515, [0.309, 0.309], 0.605, [0.388, 0.388], [0.512, 0.607], 0.691, 1.380, 1.730],
        [0.542, 0.554, [0.332, 0.332], 0.651, [0.417, 0.417], [0.550, 0.653], 0.743, 1.490, 1.860],
        [0.596, 0.609, [0.365, 0.365], 0.716, [0.459, 0.459], [0.605, 0.718], 0.818, 1.640, 2.040],
        [0.634, 0.648, [0.388, 0.388], 0.762, [0.488, 0.488], [0.644, 0.764], 0.870, 1.740, 2.170],
        [0.678, 0.693, [0.415, 0.415], 0.814, [0.521, 0.521], [0.688, 0.816], 0.929, 1.860, 2.320],
        [0.737, 0.753, [0.452, 0.452], 0.885, [0.567, 0.567], [0.748, 0.888], 1.010, 2.020, 2.530],
        [0.797, 0.814, [0.488, 0.488], 0.957, [0.613, 0.613], [0.809, 0.960], 1.093, 2.190, 2.730],
        [0.856, 0.875, [0.525, 0.525], 1.030, [0.659, 0.659], [0.869, 1.030], 1.175, 2.350, 2.930],
        [0.921, 0.942, [0.564, 0.564], 1.110, [0.709, 0.709], [0.935, 1.110], 1.264, 2.530, 3.160],
        [0.996, 1.020, [0.610, 0.610], 1.200, [0.766, 0.766], [1.010, 1.200], 1.353, 2.710, 3.380],
    ];

    static skillTalentTable = [
        [1.680, 1.910],
        [1.810, 2.060],
        [1.930, 2.200],
        [2.100, 2.390],
        [2.230, 2.530],
        [2.350, 2.680],
        [2.520, 2.870],
        [2.690, 3.060],
        [2.860, 3.250],
        [3.020, 3.440],
        [3.190, 3.630],
        [3.360, 3.820],
        [3.570, 4.060]
    ];


    static burstTalentTable = [
        0.543,
        0.583,
        0.624,
        0.678,
        0.719,
        0.760,
        0.814,
        0.868,
        0.923,
        0.977,
        1.030,
        1.090,
        1.150,
        1.220,
    ];


    static presetAttacks = [
        {
            id: "normal_total",
            label: "通常5段累計",
            dmgScale: vm => Xingqiu.normalTalentTable[vm.normalRank()-1].slice(0, 5),
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "skill_2",
            label: "元素スキルx2",
            dmgScale(vm) {
                let c4Scale = 1;
                if(vm.constell() >= 4 && vm.useC4Effect())
                    c4Scale = 1.5;

                return Xingqiu.skillTalentTable[vm.skillRank()-1].map(e => e * c4Scale);
            },
            attackProps: { isSkill: true, isHydro: true }
        },
        {
            id: "burst_30",
            label: "元素爆発30本（0/1凸）",
            dmgScale: vm => new Array(30).fill(Xingqiu.burstTalentTable[vm.burstRank()-1]),
            attackProps: { isBurst: true, isHydro: true }
        },
        {
            id: "burst_38",
            label: "元素爆発38本（2/3/4/5凸）",
            dmgScale: vm => new Array(38).fill(Xingqiu.burstTalentTable[vm.burstRank()-1]),
            attackProps: { isBurst: true, isHydro: true }
        },
        {
            id: "burst_50",
            label: "元素爆発50本（6凸）",
            dmgScale: vm => new Array(50).fill(Xingqiu.burstTalentTable[vm.burstRank()-1]),
            attackProps: { isBurst: true, isHydro: true }
        },
    ];
}


// 行秋
export let XingqiuViewModel = (Base) => class extends Base {
    constructor(parent, isBuffer)
    {
        super(parent);
        this.isBuffer = isBuffer;

        if(!isBuffer) {
            // 固有天賦：虚実の筆
            this.registerTalent({
                type: "Other",
                requiredC: 0,
                uiList: undefined,
                effect: {
                    cond: (vm) => true,
                    list: [{
                        target: TypeDefs.StaticStatusType.hydroDmg,
                        value: (vm) => 0.20
                    }]
                }
            });
        }


        // 2凸効果での耐性ダウン
        this.registerTalent({
            type: "Burst",
            requiredC: 2,
            uiList: [{
                type: "checkbox",
                name: "useC2Effect",
                init: true,
                label: (vm) => "水元素耐性-15%（2凸）"
            }],
            effect: {
                cond: (vm) => vm.useC2Effect(),
                list: [{
                    target: TypeDefs.StaticStatusType.hydroResis,
                    value: (vm) => -0.15
                }]
            }
        });


        if(!isBuffer) {
            // 4凸効果でのスキルダメージ+50%
            this.registerTalent({
                type: "Burst",
                requiredC: 4,
                uiList: [{
                    type: "checkbox",
                    name: "useC4Effect",
                    init: true,
                    label: (vm) => "爆発中スキルダメージ1.5倍（4凸）"
                }],
                effect: undefined   // presetAttacksで実装
            });
        }
    }


    maxSkillTalentRank() { return this.constell() >= 5 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 3 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }
};



runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Xingqiu(),
        {
            "vm": {
                "parent_id": "xingqiu",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "useC2Effect": true,
                "useC4Effect": true,
                "reactionProb": 0
            },
            "expected": {
                "normal_total": 1233.7288906499998,
                "skill_2": 3012.8818911749995,
                "burst_30": 9102.749543549999,
                "burst_38": 11530.149421830003,
                "burst_50": 15171.24923925001
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Xingqiu().newViewModel()
    ));
});
