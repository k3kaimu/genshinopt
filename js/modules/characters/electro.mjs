import * as Base from '/js/modules/characters/base.mjs';
import * as Widget from '/js/modules/widget.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Utils from '/js/modules/utils.mjs';


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
            337,        /* bAtk */
            789,        /* bDef */
            12907,      /* bHP */
            "baseRecharge",  /* bBonusType */
            0.32        /* bBonusValue */
        )
    }


    newViewModel()
    {
        return new RaidenShogunViewModel(this);
    }


    static normalTalentTable = [
    //  0:1段,      1:2段,   2:3段,     3:4段,                4:5段,     5:重撃,   6:落下期間,7:低空,  8:高空
        [39.6/100, 39.7/100, 49.9/100, Array(2).fill(0.290), 65.4/100, 99.6/100, 63.9/100, 128/100, 160/100],
        [42.9/100, 43.0/100, 53.9/100, Array(2).fill(0.313), 70.8/100, 107.7/100, 69.1/100, 138/100, 173/100],
        [46.1/100, 46.2/100, 58.0/100, Array(2).fill(0.337), 76.1/100, 115.8/100, 74.3/100, 149/100, 186/100],
        [50.7/100, 50.8/100, 63.8/100, Array(2).fill(0.371), 83.7/100, 127.4/100, 81.8/100, 164/100, 204/100],
        [53.9/100, 54.1/100, 67.9/100, Array(2).fill(0.394), 89.0/100, 135.5/100, 87.0/100, 174/100, 217/100],
        [57.6/100, 57.8/100, 72.5/100, Array(2).fill(0.421), 95.1/100, 144.8/100, 92.9/100, 186/100, 232/100],
        [62.7/100, 62.8/100, 78.9/100, Array(2).fill(0.458), 103.5/100, 157.5/100, 101.1/100, 202/100, 253/100],
        [67.8/100, 67.9/100, 85.3/100, Array(2).fill(0.495), 111.9/100, 170.2/100, 109.3/100, 219/100, 273/100],
        [72.8/100, 73.0/100, 91.6/100, Array(2).fill(0.532), 120.2/100, 183.0/100, 117.5/100, 235/100, 293/100],
        [78.4/100, 78.5/100, 98.6/100, Array(2).fill(0.573), 129.4/100, 196.9/100, 126.4/100, 253/100, 316/100],
        [84.7/100, 84.9/100, 106.6/100, Array(2).fill(61.9/100), 139.8/100, 212.8/100, 135.3/100, 271/100, 338/100],
    ];


    static skillTalentTable = [
    //  0:スキルダメージ, 1: 連携ダメージ, 2: 元素爆発ダメバフ
        [117.2/100, 42.0/100, 0.22/100],
        [126.0/100, 45.2/100, 0.23/100],
        [134.8/100, 48.3/100, 0.24/100],
        [146.5/100, 52.5/100, 0.25/100],
        [155.3/100, 55.7/100, 0.26/100],
        [164.1/100, 58.8/100, 0.27/100],
        [175.8/100, 63.0/100, 0.28/100],
        [187.5/100, 67.2/100, 0.29/100],
        [199.2/100, 71.4/100, 0.30/100],
        [211.0/100, 75.6/100, 0.30/100],
        [222.7/100, 79.8/100, 0.30/100],
        [234.4/100, 84.0/100, 0.30/100],
        [249.1/100, 89.3/100, 0.30/100],
    ];


    static burstTalentTable = [
    //  0:一太刀,  1:願力アップ一太刀, 2:願力アップ一心, 3:蓄積願力層数, 4:1段, 5:2段, 6:3段, 7:4段, 8:5段, 9:重撃, 10:落下, 11:低空, 12:高空, 13:一心エネルギー回復
        [401/100, 3.89/100, 0.73/100, 0.15, 44.7/100, 44.0/100, 53.8/100, [30.9/100, 31.0/100], 73.9/100, [61.6/100, 74.4/100], 63.9/100, 128/100, 160/100, 1.6],
        [431/100, 4.18/100, 0.78/100, 0.16, 47.8/100, 47.0/100, 57.5/100, [33.0/100, 33.1/100], 79.0/100, [65.8/100, 79.4/100], 69.1/100, 138/100, 173/100, 1.7],
        [461/100, 4.47/100, 0.84/100, 0.16, 50.8/100, 50.0/100, 61.2/100, [35.1/100, 35.2/100], 84.0/100, [70.0/100, 84.5/100], 74.3/100, 149/100, 186/100, 1.8],
        [501/100, 4.86/100, 0.91/100, 0.17, 54.9/100, 53.9/100, 66.1/100, [37.9/100, 38.0/100], 90.7/100, [75.6/100, 91.3/100], 81.8/100, 164/100, 204/100, 1.9],
        [531/100, 5.15/100, 0.96/100, 0.17, 558.0/100, 56.9/100, 69.7/100, [40.0/100, 40.1/100], 95.8/100, [79.8/100, 96.3/100], 87.0/100, 174/100, 217/100, 2.0],
        [561/100, 5.44/100, 1.02/100, 0.18, 61.5/100, 60.4/100, 74.0/100, [42.5/100, 42.6/100], 101.7/100, [84.7/100, 102.2/100], 92.9/100, 186/100, 232/100, 2.1],
        [601/100, 5.83/100, 1.09/100, 0.18, 66.1/100, 64.9/100, 79.5/100, [45.6/100, 45.8/100], 109.2/100, [91.0/100, 109.9/100], 101.1/100, 202/100, 253/100, 2.2],
        [641/100, 6.22/100, 1.16/100, 0.19, 70.7/100, 69.4/100, 85.0/100, [48.8/100, 48.9/100], 116.8/100, [97.3/100, 117.5/100], 109.3/100, 219/100, 273/100, 2.3],
        [681/100, 6.61/100, 1.23/100, 0.19, 75.2/100, 73.9/100, 90.5/100, [51.9/100, 52.1/100], 124.4/100, [103.6/100, 125.1/100], 117.5/100, 235/100, 293/100, 2.4],
        [721/100, 7.00/100, 1.31/100, 0.20, 79.8/100, 78.4/100, 96.0/100, [55.1/100, 55.3/100], 131.9/100, [109.9/100, 132.7/100], 126.4/100, 253/100, 316/100, 2.5],
        [761/100, 7.39/100, 1.38/100, 0.20, 84.4/100, 82.9/100, 101.5/100, [58.3/100, 58.4/100], 139.5/100, [116.2/100, 140.3/100], 135.3/100, 271/100, 338/100, 2.5],
        [802/100, 7.78/100, 1.45/100, 0.20, 89.0/100, 87.4/100, 107.0/100, [61.4/100, 61.7/100], 147.0/100, [122.5/100, 147.9/100], 144.2/100, 288/100, 360/100, 2.5],
        [852/100, 8.26/100, 1.54/100, 0.20, 93.5/100, 91.9/100, 112.5/100, [64.6/100, 64.8/100], 154.6/100, [128.8/100, 155.5/100], 153.1/100, 306/100, 382/100, 2.5],
    ];


    static presetAttacks = [
        {
            id: "normal_1",
            label: "通常1段目",
            dmgScale(vm){ return RaidenShogun.normalTalentTable[vm.normalRank()-1][0]; },
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "charged_1",
            label: "通常重撃",
            dmgScale(vm){ return RaidenShogun.normalTalentTable[vm.normalRank()-1][5]; },
            attackProps: { isCharged: true, isPhysical: true }
        },
        {
            id: "skill_dmg",
            label: "スキルダメージ",
            dmgScale(vm){ return RaidenShogun.skillTalentTable[vm.skillRank()-1][0]; },
            attackProps: { isSkill: true, isElectro: true }
        },
        {
            id: "burst_dmg",
            label: "夢想の一太刀",
            dmgScale(vm){ return [RaidenShogun.burstTalentTable[vm.burstRank()-1][0]].flat().map(x => x + RaidenShogun.burstTalentTable[vm.burstRank()-1][1] * vm.chakraStacks()); },
            attackProps: { isBurst: true, isElectro:true }
        },
        {
            id: "burst_normal_1",
            label: "夢想の一心1段目",
            dmgScale(vm){ return [RaidenShogun.burstTalentTable[vm.burstRank()-1][4]].flat().map(x => x + RaidenShogun.burstTalentTable[vm.burstRank()-1][2] * vm.chakraStacks()); },
            attackProps: { isBurst: true, isElectro:true }
        },
        {
            id: "burst_charged",
            label: "夢想の一心重撃",
            dmgScale(vm){ return [RaidenShogun.burstTalentTable[vm.burstRank()-1][9]].flat().map(x => x + RaidenShogun.burstTalentTable[vm.burstRank()-1][2] * vm.chakraStacks()); },
            attackProps: { isBurst: true, isElectro:true }
        },
    ];
}


// 雷電将軍
export class RaidenShogunViewModel extends Base.CharacterViewModel
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
            enemyRateDef(attackProps) {
                if(this.#raidenData.constell >= 2 && (attackProps.isBurst || false))
                    return super.enemyRateDef(attackProps).mul(1 - 0.6);
                else
                    return super.enemyRateDef(attackProps);
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
                "parent_id": "raiden_shogun",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "chakraStacks": 60,
                "useSkillEffect": true
            },
            "expected": {
                "normal_1": 189.11529,
                "charged_1": 475.38596250000006,
                "skill_dmg": 583.70538168,
                "burst_dmg": 5590.645797342856,
                "burst_normal_1": 773.0198810357142,
                "burst_charged": 1952.2643035821427
            }
        }
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
export class BeidouViewModel extends Base.CharacterViewModel
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
            let CalcType = Object.getPrototypeOf(calc).constructor;
            let NewCalc = class extends CalcType {
                chainedAttackDmg(attackProps) {
                    let superValue = super.chainedAttackDmg(attackProps);
    
                    if(attackProps.isNormal || false) {
                        let newProps = {...attackProps};
                        // 元々の攻撃の属性や攻撃種類を削除する
                        newProps = Calc.deleteAllElementFromAttackProps(newProps);
                        newProps = Calc.deleteAllAttackTypeFromAttackProps(newProps);
    
                        newProps.isElectro = true;      // 雷攻撃
                        newProps.isChainable = false;   // この攻撃では追撃は発生しない
                        return superValue.add(super.calculateNormalDmg(0.2, newProps));
                    } else {
                        // 通常攻撃ではないので，追撃は発生しない
                        return superValue;
                    }
                }
            };
    
            calc = Object.assign(new NewCalc(), calc);
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
                "useDmgUpEffect": true
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
