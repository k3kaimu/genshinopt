import * as Base from './base.mjs';
import * as Widget from '../widget.mjs';
import * as Calc from '../dmg-calc.mjs';
import * as Utils from '../utils.mjs';
import * as TypeDefs from '../typedefs.mjs';


export class ElectroCharacterViewModel extends Base.CharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.reactionProb = ko.observable(0);
    }


    viewHTMLList(target){
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "超激化",
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
                        if("isAggravate" in info.props) {
                            // 冪等性を保つために，info.propsにすでにisAggravateが存在するときには
                            // 元素反応の計算をせずにそのまま返す
                            return info;
                        }
                        else if(info.props.isElectro || false)
                        {
                            // 冪等性を保つために，必ず"isAggravate": falseも入れる
                            return [
                                new Calc.AttackInfo(info.scale, info.ref, {...info.props, isAggravate: false}, info.prob.mul(1 - prob)),
                                new Calc.AttackInfo(info.scale, info.ref, {...info.props, isAggravate: true}, info.prob.mul(prob))
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
        this.reactionProb(obj.reactionProb ?? 0);
    }
}


// 旅人（雷）
export class TravelerElectro extends Base.CharacterData
{
    constructor()
    {
        super(
            "traveler_anemo",
            "旅人(雷)",
            5,
            "Electro",
            "Sword",
            213,        /* bAtk */
            682,        /* bDef */
            10875,      /* bHP */
            "rateAtk",  /* bBonusType */
            0.24        /* bBonusValue */
            );
    }
}



// 雷電将軍
export class RaidenShogun extends Base.CharacterData
{
    constructor()
    {
        super(
            "raiden_shogun",
            "雷電将軍",
            5,
            "Electro",
            "Polearm",
            [26, 68, 136, 175, 219, 258, 297, 337],                 /* bAtk */
            [61, 159, 317, 408, 512, 604, 696, 789],                /* bDef */
            [1005, 2606, 5189, 6675, 8373, 9875, 11388, 12907],     /* bHP */
            "baseRecharge", /* bBonusType */
            0.32        /* bBonusValue */
        )
    }


    newViewModel()
    {
        return new RaidenShogunViewModel(this);
    }


    static normalTalentTable = [
    //  0:1段,      1:2段,   2:3段,     3:4段,                4:5段,     5:重撃,   6:落下期間,7-0:低空,  7-1:高空
        [0.396, 0.397, 0.499, [0.290, 0.290], 0.654, 0.996, 0.639, [1.280, 1.600]],
        [0.429, 0.430, 0.539, [0.313, 0.313], 0.708, 1.077, 0.691, [1.380, 1.730]],
        [0.461, 0.462, 0.580, [0.337, 0.337], 0.761, 1.158, 0.743, [1.490, 1.860]],
        [0.507, 0.508, 0.638, [0.371, 0.371], 0.837, 1.274, 0.818, [1.640, 2.040]],
        [0.539, 0.541, 0.679, [0.394, 0.394], 0.890, 1.355, 0.870, [1.740, 2.170]],
        [0.576, 0.578, 0.725, [0.421, 0.421], 0.951, 1.448, 0.929, [1.860, 2.320]],
        [0.627, 0.628, 0.789, [0.458, 0.458], 1.035, 1.575, 1.011, [2.020, 2.530]],
        [0.678, 0.679, 0.853, [0.495, 0.495], 1.119, 1.702, 1.093, [2.190, 2.730]],
        [0.728, 0.730, 0.916, [0.532, 0.532], 1.202, 1.830, 1.175, [2.350, 2.930]],
        [0.784, 0.785, 0.986, [0.573, 0.573], 1.294, 1.969, 1.264, [2.530, 3.160]],
        [0.847, 0.849, 1.066, [0.619, 0.619], 1.398, 2.128, 1.353, [2.710, 3.380]]
    ];


    static skillTalentTable = [
    //  0:スキルダメージ, 1: 連携ダメージ, 2: 元素爆発ダメバフ
        [1.172, 0.420, 0.0022],
        [1.260, 0.452, 0.0023],
        [1.348, 0.483, 0.0024],
        [1.465, 0.525, 0.0025],
        [1.553, 0.557, 0.0026],
        [1.641, 0.588, 0.0027],
        [1.758, 0.630, 0.0028],
        [1.875, 0.672, 0.0029],
        [1.992, 0.714, 0.003],
        [2.110, 0.756, 0.003],
        [2.227, 0.798, 0.003],
        [2.344, 0.840, 0.003],
        [2.491, 0.893, 0.003]
    ];


    static burstTalentTable = [
    //  0:一太刀,  1-0:願力アップ一太刀, 1-1:願力アップ一心, 2:蓄積願力層数, 3:1段, 4:2段, 5:3段, 6:4段, 7:5段, 8:重撃, 9:落下, 10-0:低空, 10-1:高空, 11:一心エネルギー回復
        [4.010, [0.0389, 0.0073], 0.15, 0.447, 0.440, 0.538, [0.309, 0.310], 0.739, [0.616, 0.744], 0.639, [1.280, 1.600], 1.6],
        [4.310, [0.0418, 0.0078], 0.16, 0.478, 0.470, 0.575, [0.330, 0.331], 0.790, [0.658, 0.794], 0.691, [1.380, 1.730], 1.7],
        [4.610, [0.0447, 0.0084], 0.16, 0.508, 0.500, 0.612, [0.351, 0.352], 0.840, [0.700, 0.845], 0.743, [1.490, 1.860], 1.8],
        [5.010, [0.0486, 0.0091], 0.17, 0.549, 0.539, 0.661, [0.379, 0.380], 0.907, [0.756, 0.913], 0.818, [1.640, 2.040], 1.9],
        [5.310, [0.0515, 0.0096], 0.17, 0.580, 0.569, 0.697, [0.400, 0.401], 0.958, [0.798, 0.963], 0.870, [1.740, 2.170], 2.0],
        [5.610, [0.0544, 0.0102], 0.18, 0.615, 0.604, 0.740, [0.425, 0.426], 1.017, [0.847, 1.022], 0.929, [1.860, 2.320], 2.1],
        [6.010, [0.0583, 0.0109], 0.18, 0.661, 0.649, 0.795, [0.456, 0.458], 1.092, [0.910, 1.099], 1.011, [2.020, 2.530], 2.2],
        [6.410, [0.0622, 0.0116], 0.19, 0.707, 0.694, 0.850, [0.488, 0.489], 1.168, [0.973, 1.175], 1.093, [2.190, 2.730], 2.3],
        [6.810, [0.0661, 0.0123], 0.19, 0.752, 0.739, 0.905, [0.519, 0.521], 1.244, [1.036, 1.251], 1.175, [2.350, 2.930], 2.4],
        [7.210, [0.0700, 0.0131], 0.20, 0.798, 0.784, 0.960, [0.551, 0.553], 1.319, [1.099, 1.327], 1.264, [2.530, 3.160], 2.5],
        [7.610, [0.0739, 0.0138], 0.20, 0.844, 0.829, 1.015, [0.583, 0.584], 1.395, [1.162, 1.403], 1.353, [2.710, 3.380], 2.5],
        [8.020, [0.0778, 0.0145], 0.20, 0.890, 0.874, 1.070, [0.614, 0.617], 1.470, [1.225, 1.479], 1.442, [2.880, 3.600], 2.5],
        [8.520, [0.0826, 0.0154], 0.20, 0.935, 0.919, 1.125, [0.646, 0.648], 1.546, [1.288, 1.555], 1.531, [3.060, 3.820], 2.5]
    ];


    static presetAttacks = [
        // {
        //     id: "normal_1",
        //     label: "通常1段目",
        //     dmgScale(vm){ return RaidenShogun.normalTalentTable[vm.normalRank()-1][0]; },
        //     attackProps: { isNormal: true, isPhysical: true }
        // },
        // {
        //     id: "charged_1",
        //     label: "通常重撃",
        //     dmgScale(vm){ return RaidenShogun.normalTalentTable[vm.normalRank()-1][5]; },
        //     attackProps: { isCharged: true, isPhysical: true }
        // },
        ...Base.makeNormalPresetAttacks(TypeDefs.Element.Electro, TypeDefs.WeaponType.Polearm, 5),
        Base.makeSkillPresetAttack("skill_dmg", "スキルダメージ", 0, { isSkill: true, isElectro: true }),
        {
            id: "burst_dmg",
            label: "夢想の一太刀",
            dmgScale(vm){ return [RaidenShogun.burstTalentTable[vm.burstRank()-1][0]].flat(10).map(x => x + RaidenShogun.burstTalentTable[vm.burstRank()-1][1][0] * vm.chakraStacks()); },
            attackProps: { isBurst: true, isElectro:true }
        },
        ...new Array(5).fill(0).map((_,n_) => {
            let n = n_;
            return {
                id: `burst_normal_${n+1}`,
                label: `夢想の一心：通常${n+1}段目`,
                dmgScale(vm){ return [RaidenShogun.burstTalentTable[vm.burstRank()-1][n+3]].flat(10).map(x => x + RaidenShogun.burstTalentTable[vm.burstRank()-1][1][1] * vm.chakraStacks()); },
                attackProps: { isBurst: true, isElectro:true }
            };
        }),
        {
            id: "burst_charged",
            label: "夢想の一心：重撃",
            dmgScale(vm){ return [RaidenShogun.burstTalentTable[vm.burstRank()-1][8]].flat(10).map(x => x + RaidenShogun.burstTalentTable[vm.burstRank()-1][1][1] * vm.chakraStacks()); },
            attackProps: { isBurst: true, isElectro:true }
        },
        {
            id: "burst_plunge_during",
            label: "夢想の一心：落下期間",
            dmgScale(vm){ return [RaidenShogun.burstTalentTable[vm.burstRank()-1][9]].flat(10).map(x => x + RaidenShogun.burstTalentTable[vm.burstRank()-1][1][1] * vm.chakraStacks()); },
            attackProps: { isBurst: true, isElectro:true }
        },
        {
            id: "burst_plunge_low",
            label: "夢想の一心：低空落下",
            dmgScale(vm){ return [RaidenShogun.burstTalentTable[vm.burstRank()-1][10][0]].flat(10).map(x => x + RaidenShogun.burstTalentTable[vm.burstRank()-1][1][1] * vm.chakraStacks()); },
            attackProps: { isBurst: true, isElectro:true }
        },
        {
            id: "burst_plunge_high",
            label: "夢想の一心：高空落下",
            dmgScale(vm){ return [RaidenShogun.burstTalentTable[vm.burstRank()-1][10][1]].flat(10).map(x => x + RaidenShogun.burstTalentTable[vm.burstRank()-1][1][1] * vm.chakraStacks()); },
            attackProps: { isBurst: true, isElectro:true }
        },
    ];
}


// 雷電将軍
export class RaidenShogunViewModel extends ElectroCharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.chakraStacks = ko.observable(60);      // 願力の層数
        this.useSkillEffect = ko.observable(true);  // 元素スキルのダメージ増加効果
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);


        // スキルによる元素ダメージバフ
        if(this.useSkillEffect()) {
            calc.baseBurstDmg.value += RaidenShogun.skillTalentTable[this.skillRank()-1][2] * 90;
        }

        let data = this.toJS();
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #raidenData = data;

            // 2凸効果
            ignoreEnemyDef(attackProps) {
                if(this.#raidenData.constell >= 2 && (attackProps.isBurst || false))
                    return super.ignoreEnemyDef(attackProps).add(0.6);
                else
                    return super.ignoreEnemyDef(attackProps);
            }


            // 固有天賦：殊勝な御体
            electroDmgBuff(attackProps) {
                let val = super.electroDmgBuff(attackProps);

                let recharge_ = this.recharge(attackProps);

                if(recharge_.value >= 1) {
                    return val.add(recharge_.sub(1).mul(0.004 * 100));
                } else {
                    return val;
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);

        return calc;
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        ret.push(
            Widget.buildViewHTML(target, "諸願百目の輪：層数",
                Widget.sliderViewHTML("chakraStacks", 0, 60, 10, 
                Widget.spanInteger("chakraStacks()") + "層")
            )
        );

        ret.push(
            Widget.buildViewHTML(target, "神変・悪曜開眼（スキル）",
                Widget.checkBoxViewHTML("useSkillEffect", `元素爆発ダメージ+${Widget.spanPercentageFix(RaidenShogun.skillTalentTable[this.skillRank()-1][2] * 90)}`)
            )
        );

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.chakraStacks = this.chakraStacks();
        obj.useSkillEffect = this.useSkillEffect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);

        this.chakraStacks(obj.chakraStacks);
        this.useSkillEffect(obj.useSkillEffect);
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new RaidenShogun(),
        {
            "vm": {
                "level": "90",
                "parent_id": "raiden_shogun",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "chakraStacks": 60,
                "useSkillEffect": true,
                "reactionProb": 0,
            },
            "expected": {
                "normal_1": 189.11529,
                "normal_2": 189.63483749999997,
                "normal_3": 237.95275500000002,
                "normal_4": 276.39927,
                "normal_5": 312.2480474999999,
                "normal_total": 1205.3501999999999,
                "normal_charged": 475.38596250000006,
                "normal_plunge_during": 305.23415625,
                "normal_plunge_low": 610.4683125,
                "normal_plunge_high": 761.1370875000001,
                "skill_dmg": 583.70538168,
                "burst_dmg": 5590.645797342856,
                "burst_normal_1": 773.0198810357142,
                "burst_normal_2": 766.2754122749999,
                "burst_normal_3": 852.3970902964287,
                "burst_normal_4": 1305.314107842857,
                "burst_normal_5": 1028.2720833642857,
                "burst_charged": 1952.2643035821427,
                "burst_plunge_during": 992.4745184035714,
                "burst_plunge_low": 1602.0707333142855,
                "burst_plunge_high": 1902.9778010999999,
                "__elemReact_Superconduct__": 650.7,
                "__elemReact_ElectroCharged__": 1562.4,
                "__elemReact_Overloaded__": 2603.7000000000003
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new RaidenShogun().newViewModel()
    ));
});


// 八重神子
export class YaeMiko extends Base.CharacterData
{
    constructor()
    {
        super(
            "yae_miko",
            "八重神子",
            5,
            "Electro",
            "Catalyst",
            [26, 68, 136, 175, 220, 259, 299, 340],             /* bAtk */
            [44, 115, 229, 294, 369, 435, 502, 569],            /* bDef */
            [807, 2095, 4170, 5364, 6729, 7936, 9151, 10372],   /* bHP */
            TypeDefs.StaticStatusType.crtRate,                  /* bBonusType */
            0.192                                               /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new YaeMikoViewModel(this);
    }


    static normalTalentTable = [
    //  0-2:通常3段，3:重撃，4:落下，5:低空/高空
        [0.397, 0.385, 0.569, 1.429, 0.568, [1.140, 1.420]],
        [0.426, 0.414, 0.612, 1.536, 0.615, [1.230, 1.530]],
        [0.456, 0.443, 0.654, 1.643, 0.661, [1.320, 1.650]],
        [0.496, 0.481, 0.711, 1.786, 0.722, [1.450, 1.820]],
        [0.525, 0.510, 0.754, 1.893, 0.773, [1.550, 1.930]],
        [0.555, 0.539, 0.796, 2.001, 0.826, [1.650, 2.060]],
        [0.595, 0.578, 0.853, 2.143, 0.899, [1.800, 2.240]],
        [0.635, 0.616, 0.910, 2.286, 0.971, [1.940, 2.430]],
        [0.674, 0.655, 0.967, 2.429, 1.040, [2.090, 2.610]],
        [0.714, 0.693, 1.024, 2.572, 1.120, [2.250, 2.810]],
        [0.754, 0.732, 1.081, 2.715, 1.200, [2.400, 3.000]]
    ];


    static skillTalentTable = [
    //  0:ダメージ階位1, 1:ダメージ階位2, 2:1: ダメージ階位3, 3: ダメージ階位4
        [0.607, 0.758, 0.948, 1.185],
        [0.652, 0.815, 1.019, 1.274],
        [0.698, 0.872, 1.090, 1.363],
        [0.758, 0.948, 1.185, 1.481],
        [0.804, 1.005, 1.256, 1.570],
        [0.849, 1.062, 1.327, 1.659],
        [0.910, 1.138, 1.422, 1.778],
        [0.971, 1.213, 1.517, 1.896],
        [1.031, 1.289, 1.612, 2.015],
        [1.092, 1.365, 1.706, 2.133],
        [1.153, 1.441, 1.801, 2.252],
        [1.213, 1.517, 1.896, 2.370],
        [1.289, 1.612, 2.015, 2.518]
    ];


    static burstTalentTable = [
    // 0:ダメージ，1:天狐雷霆ダメージ
        [2.600, 3.340],
        [2.800, 3.590],
        [2.990, 3.840],
        [3.250, 4.170],
        [3.450, 4.420],
        [3.640, 4.670],
        [3.900, 5.010],
        [4.160, 5.340],
        [4.420, 5.670],
        [4.680, 6.010],
        [4.940, 6.340],
        [5.200, 6.680],
        [5.530, 7.090]
    ];


    static presetAttacks = [
        {
            id: "normal_total",
            label: "通常3段累計",
            dmgScale(vm){ return vm.normalTalentRow().slice(0, 3).flat(10); },
            attackProps: { isNormal: true, isElectro: true }
        },
        {
            id: "charged_1",
            label: "重撃",
            dmgScale(vm){ return vm.normalTalentRow()[3]; },
            attackProps: { isCharged: true, isElectro: true }
        },
        {
            id: "skill_dmg",
            label: "スキルダメージ",
            dmgScale(vm){
                if(vm.constell() >= 2)
                    return vm.skillTalentRow()[Number(vm.skillStacks())];
                else
                    return vm.skillTalentRow()[Number(vm.skillStacks())-1];
            },
            attackProps: { isSkill: true, isElectro: true }
        },
        {
            id: "burst_dmg",
            label: "元素爆発累計ダメージ",
            dmgScale(vm){ 
                let rs = vm.burstTalentRow();
                return [rs[0], ...new Array(Number(vm.skillStacks())).fill(rs[1])];
            },
            attackProps: { isBurst: true, isElectro: true }
        },
    ];
}


// 八重神子
export class YaeMikoViewModel extends ElectroCharacterViewModel
{
    constructor(parent)
    {
        super(parent);

        // スキルの株の数
        this.registerTalent({
            type: "Skill",
            requiredC: 0,
            uiList: [{
                type: "select",
                name: "skillStacks",
                init: 3,
                options: (vm) => {
                    let ks = ["", "壱", "弐", "参", "肆"];
                    if(vm.constell() < 2)
                        return iota(1, 4).map(e => { return {value: e, label: `殺生櫻${e}本（階位${ks[e]}）` }; });
                    else
                        return iota(1, 4).map(e => { return {value: e, label: `殺生櫻${e}本（階位${ks[e+1]}）` }; });
                }
            }],
            effect: undefined
        });


        // 熟知をスキルダメージへ変換
        this.registerTalent({
            type: "Skill",
            requiredC: 0,
            uiList: [],
            effect: {
                cond: (vm) => true,
                list: [{
                    target: TypeDefs.DynamicStatusType.skillDmg,
                    isDynamic: true,
                    condAttackProps: (props) => true,
                    value: (vmdata, calc, props) => calc.mastery(props).mul(0.0015)
                }]
            }
        });

        // 4凸効果
        this.registerTalent({
            type: "Skill",
            requiredC: 4,
            uiList: [{
                type: "checkbox",
                name: "useC4Effect",
                init: true,
                label: (vm) => `雷元素ダメージ+20%`
            }],
            effect: {
                cond: (vm) => vm.useC4Effect(),
                list: [{target: TypeDefs.StaticStatusType.electroDmg, value: (vm) => 0.20}]
            }
        });

        // 6凸効果
        this.registerTalent({
            type: "Skill",
            requiredC: 6,
            uiList: [],
            effect: {
                cond: (vm) => true,
                list: [{
                    target: TypeDefs.DynamicStatusType.ignoreEnemyDef,
                    isDynamic: true,
                    condAttackProps: (props) => props.isSkill,
                    value: (vmdata, calc, props) => 0.6
                }]
            }
        });
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new YaeMiko(),
        {
            "vm": {
                "level": "90",
                "parent_id": "yae_miko",
                "constell": 6,
                "normalRank": 8,
                "skillRank": 8,
                "burstRank": 8,
                "skillStacks": 3,
                "useC4Effect": true,
                "reactionProb": 0,
            },
            "expected": {
                "normal_total": 737.9028396,
                "charged_1": 780.5857896,
                "skill_dmg": 924.8785508571427,
                "burst_dmg": 6890.735448,
                "__elemReact_Superconduct__": 650.7,
                "__elemReact_ElectroCharged__": 1562.4,
                "__elemReact_Overloaded__": 2603.7000000000003
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new YaeMiko().newViewModel()
    ));
});


// 北斗
export class Beidou extends Base.CharacterData
{
    constructor()
    {
        super(
            "beidou",
            "北斗",
            4,
            "Electro",
            "Claymore",
            225,        /* bAtk */
            648,        /* bDef */
            13050,      /* bHP */
            "baseElectroDmg",  /* bBonusType */
            0.24        /* bBonusValue */
        )
    }


    newViewModel()
    {
        return new BeidouViewModel(this);
    }


    static normalTalentTable = [
    //  0~4: 通常攻撃1~5段, 5:連続重撃, 6:重撃終了, 7:落下, 8:低空, 9:高空
        [71.1/100, 70.9/100, 88.3/100, 86.5/100, 112/100, 56.2/100, 102/100, 74.6/100, 149/100, 186/100],
        [76.9/100, 76.6/100, 95.5/100, 93.6/100, 121/100, 60.8/100, 110/100, 80.7/100, 161/100, 201/100],
        [82.7/100, 82.4/100, 103/100, 101/100, 130/100, 65.4/100, 118/100, 86.7/100, 173/100, 217/100],
        [91.0/100, 90.6/100, 113/100, 111/100, 143/100, 71.9/100, 130/100, 95.4/100, 191/100, 238/100],
        [96.8/100, 96.4/100, 120/100, 118/100, 153/100, 76.5/100, 139/100, 101/100, 203/100, 253/100],
        [103/100, 103/100, 128/100, 126/100, 163/100, 81.8/100, 148/100, 108.4/100, 217/100, 271/100],
        [112/100, 112/100, 140/100, 137/100, 177/100, 88.9/100, 161/100, 118.0/100, 236/100, 295/100],
        [122/100, 121/100, 151/100, 148/100, 192/100, 96.1/100, 174/100, 127/100, 255/100, 318/100],
        [131/100, 130/100, 162/100, 159/100, 206/100, 103/100, 187/100, 137/100, 274/100, 342/100],
        [141/100, 140/100, 175/100, 171/100, 222/100, 111/100, 201/100, 147.4/100, 295/100, 368/100],
        [152/100, 151/100, 189/100, 185/100, 240/100, 120/100, 218/100, 157.8/100, 316/100, 394/100],
    ];

    static skillTalentTable = [
    //  0:シールドHP比, 1:シールド加算, 2:基礎ダメージ, 3:加算ダメージ
        [0.144, 1386, 1.22, 1.60],
        [0.155, 1525, 1.31, 1.72],
        [0.166, 1675, 1.40, 1.84],
        [0.180, 1837, 1.52, 2.00],
        [0.191, 2010, 1.61, 2.12],
        [0.202, 2195, 1.70, 2.24],
        [0.216, 2392, 1.82, 2.40],
        [0.230, 2600, 1.95, 2.56],
        [0.245, 2819, 2.07, 2.72],
        [0.259, 3050, 2.19, 2.88],
        [0.274, 3293, 2.31, 3.04],
        [0.288, 3547, 2.43, 3.20],
        [0.306, 3813, 2.58, 3.40],
    ];

    static burstTalentTable = [
    //  0:爆発ダメージ，1:稲妻ダメージ, 2:ダメージ軽減
        [1.22, 0.960, 0.20],
        [1.31, 1.03, 0.21],
        [1.40, 1.10, 0.22],
        [1.52, 1.20, 0.24],
        [1.61, 1.27, 0.25],
        [1.70, 1.34, 0.26],
        [1.82, 1.44, 0.28],
        [1.95, 1.54, 0.30],
        [2.07, 1.63, 0.32],
        [2.19, 1.73, 0.34],
        [2.31, 1.82, 0.35],
        [2.43, 1.92, 0.36],
        [2.58, 2.04, 0.37],
        [2.74, 2.14, 0.38],
    ];


    static presetAttacks = [
        {
            id: "normal_1",
            label: "通常1〜5段累計",
            dmgScale(vm){ return Beidou.normalTalentTable[vm.normalRank()-1].slice(0, 5); },
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "charged_cont",
            label: "重撃（継続）",
            dmgScale(vm){ return Beidou.normalTalentTable[vm.normalRank()-1][5]; },
            attackProps: { isCharged: true, isPhysical: true }
        },
        {
            id: "charged_last",
            label: "重撃（終了）",
            dmgScale(vm){ return Beidou.normalTalentTable[vm.normalRank()-1][6]; },
            attackProps: { isCharged: true, isPhysical: true }
        },
        {
            id: "skill_3",
            label: "元素スキル（最大）",
            dmgScale(vm){ return Beidou.skillTalentTable[vm.skillRank()-1][2] + Beidou.skillTalentTable[vm.skillRank()-1][3]*2; },
            attackProps: { isSkill: true, isElectro: true }
        },
        {
            id: "burst_dmg",
            label: "元素爆発",
            dmgScale(vm){ return Beidou.burstTalentTable[vm.burstRank()-1][0]; },
            attackProps: { isBurst: true, isElectro: true }
        },
        {
            id: "burst_dmg_add",
            label: "元素爆発・雷追撃ダメージ",
            dmgScale(vm){ return Beidou.burstTalentTable[vm.burstRank()-1][1]; },
            attackProps: { isBurst: true, isElectro: true }
        },
    ];
}


// 北斗
export class BeidouViewModel extends ElectroCharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useC4Effect = ko.observable(true);
        this.useC6Effect = ko.observable(true);
        this.useDmgUpEffect = ko.observable(true);
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useDmgUpEffect()) {
            calc.baseNormalDmg.value += 0.15;
            calc.baseChargedDmg.value += 0.15;
        }

        if(this.useC4Effect() && this.constell() >= 4) {
            calc = calc.applyExtension(Klass => class extends Klass {
                chainedAttackInfos(parentAttackInfo)
                {
                    let list = super.chainedAttackInfos(parentAttackInfo);

                    if(parentAttackInfo.props.isNormal || false) {
                        let newProps = {...parentAttackInfo.props};
                        // 元々の攻撃の属性や攻撃種類を削除する
                        newProps = Calc.deleteAllElementFromAttackProps(newProps);
                        newProps = Calc.deleteAllAttackTypeFromAttackProps(newProps);
    
                        newProps.isElectro = true;      // 雷攻撃
                        newProps.isChainable = false;   // この攻撃では追撃は発生しない
                        list.push(new Calc.AttackInfo(0.2, "atk", newProps, parentAttackInfo.prob));
                    }

                    return list;
                }
            });
        }

        if(this.useC6Effect() && this.constell() >= 6) {
            calc.baseElectroResis.value -= 0.15;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        ret.push(
            Widget.buildViewHTML(target, "満天の霹靂（固有天賦）",
                Widget.checkBoxViewHTML("useDmgUpEffect", `通常攻撃/重撃ダメージ+15%`)
            )
        );

        if(this.constell() >= 4) {
            ret.push(
                Widget.buildViewHTML(target, "星に導かれた岸線（4凸）",
                    Widget.checkBoxViewHTML("useC4Effect", `通常攻撃に20%の雷ダメージを追加`)
                )
            );
        }


        if(this.constell() >= 6) {
            ret.push(
                Widget.buildViewHTML(target, "北斗の祓い（6凸）",
                    Widget.checkBoxViewHTML("useC6Effect", `雷元素耐性-15%`)
                )
            );
        }

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.useC4Effect = this.useC4Effect();
        obj.useC6Effect = this.useC6Effect();
        obj.useDmgUpEffect = this.useDmgUpEffect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);

        this.useC4Effect(obj.useC4Effect);
        this.useC6Effect(obj.useC6Effect);
        this.useDmgUpEffect(obj.useDmgUpEffect);
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Beidou(),
        {
            "vm": {
                "parent_id": "beidou",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "useC4Effect": true,
                "useC6Effect": true,
                "useDmgUpEffect": true,
                "reactionProb": 0,
            },
            "expected": {
                "normal_1": 2153.434625,
                "charged_cont": 243.52579687499994,
                "charged_last": 442.1293593749999,
                "skill_3": 2180.4839093749997,
                "burst_dmg": 601.0122093749999,
                "burst_dmg_add": 473.260821875
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Beidou().newViewModel()
    ));
});
