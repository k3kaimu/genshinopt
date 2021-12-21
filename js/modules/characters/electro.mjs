import * as Base from '/js/modules/characters/base.mjs';
import * as Widget from '/js/modules/widget.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';


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
    //  0:1段,      1:2段,   2:3段,     3:4段,            4:5段,     5:重撃,   6:落下期間,7:低空,  8:高空
        [39.6/100, 39.7/100, 49.9/100, 29.0/100+29.0/100, 65.4/100, 99.6/100, 63.9/100, 128/100, 160/100],
        [42.9/100, 43.0/100, 53.9/100, 31.3/100+31.3/100, 70.8/100, 107.7/100, 69.1/100, 138/100, 173/100],
        [46.1/100, 46.2/100, 58.0/100, 33.7/100+33.7/100, 76.1/100, 115.8/100, 74.3/100, 149/100, 186/100],
        [50.7/100, 50.8/100, 63.8/100, 37.1/100+37.1/100, 83.7/100, 127.4/100, 81.8/100, 164/100, 204/100],
        [53.9/100, 54.1/100, 67.9/100, 39.4/100+39.4/100, 89.0/100, 135.5/100, 87.0/100, 174/100, 217/100],
        [57.6/100, 57.8/100, 72.5/100, 42.1/100+42.1/100, 95.1/100, 144.8/100, 92.9/100, 186/100, 232/100],
        [62.7/100, 62.8/100, 78.9/100, 45.8/100+45.8/100, 103.5/100, 157.5/100, 101.1/100, 202/100, 253/100],
        [67.8/100, 67.9/100, 85.3/100, 49.5/100+49.5/100, 111.9/100, 170.2/100, 109.3/100, 219/100, 273/100],
        [72.8/100, 73.0/100, 91.6/100, 53.2/100+53.2/100, 120.2/100, 183.0/100, 117.5/100, 235/100, 293/100],
        [78.4/100, 78.5/100, 98.6/100, 57.3/100+57.3/100, 129.4/100, 196.9/100, 126.4/100, 253/100, 316/100],
        [84.7/100, 84.9/100, 106.6/100, 61.9/100+61.9/100, 139.8/100, 212.8/100, 135.3/100, 271/100, 338/100],
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
        [401/100, 3.89/100, 0.73/100, 0.15, 44.7/100, 44.0/100, 53.8/100, 30.9/100+31.0/100, 73.9/100, 61.6/100+74.4/100, 63.9/100, 128/100, 160/100, 1.6],
        [431/100, 4.18/100, 0.78/100, 0.16, 47.8/100, 47.0/100, 57.5/100, 33.0/100+33.1/100, 79.0/100, 65.8/100+79.4/100, 69.1/100, 138/100, 173/100, 1.7],
        [461/100, 4.47/100, 0.84/100, 0.16, 50.8/100, 50.0/100, 61.2/100, 35.1/100+35.2/100, 84.0/100, 70.0/100+84.5/100, 74.3/100, 149/100, 186/100, 1.8],
        [501/100, 4.86/100, 0.91/100, 0.17, 54.9/100, 53.9/100, 66.1/100, 37.9/100+38.0/100, 90.7/100, 75.6/100+91.3/100, 81.8/100, 164/100, 204/100, 1.9],
        [531/100, 5.15/100, 0.96/100, 0.17, 558.0/100, 56.9/100, 69.7/100, 40.0/100+40.1/100, 95.8/100, 79.8/100+96.3/100, 87.0/100, 174/100, 217/100, 2.0],
        [561/100, 5.44/100, 1.02/100, 0.18, 61.5/100, 60.4/100, 74.0/100, 42.5/100+42.6/100, 101.7/100, 84.7/100+102.2/100, 92.9/100, 186/100, 232/100, 2.1],
        [601/100, 5.83/100, 1.09/100, 0.18, 66.1/100, 64.9/100, 79.5/100, 45.6/100+45.8/100, 109.2/100, 91.0/100+109.9/100, 101.1/100, 202/100, 253/100, 2.2],
        [641/100, 6.22/100, 1.16/100, 0.19, 70.7/100, 69.4/100, 85.0/100, 48.8/100+48.9/100, 116.8/100, 97.3/100+117.5/100, 109.3/100, 219/100, 273/100, 2.3],
        [681/100, 6.61/100, 1.23/100, 0.19, 75.2/100, 73.9/100, 90.5/100, 51.9/100+52.1/100, 124.4/100, 103.6/100+125.1/100, 117.5/100, 235/100, 293/100, 2.4],
        [721/100, 7.00/100, 1.31/100, 0.20, 79.8/100, 78.4/100, 96.0/100, 55.1/100+55.3/100, 131.9/100, 109.9/100+132.7/100, 126.4/100, 253/100, 316/100, 2.5],
        [761/100, 7.39/100, 1.38/100, 0.20, 84.4/100, 82.9/100, 101.5/100, 58.3/100+58.4/100, 139.5/100, 116.2/100+140.3/100, 135.3/100, 271/100, 338/100, 2.5],
        [802/100, 7.78/100, 1.45/100, 0.20, 89.0/100, 87.4/100, 107.0/100, 61.4/100+61.7/100, 147.0/100, 122.5/100+147.9/100, 144.2/100, 288/100, 360/100, 2.5],
        [852/100, 8.26/100, 1.54/100, 0.20, 93.5/100, 91.9/100, 112.5/100, 64.6/100+64.8/100, 154.6/100, 128.8/100+155.5/100, 153.1/100, 306/100, 382/100, 2.5],
    ];


    static presetAttacks = [
        {
            id: "normal_1",
            label: "通常1段目",
            dmgScale(vm){ return RaidenShogun.normalTalentTable[vm.normalRank()-1][0]; },
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "normal_1",
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
            dmgScale(vm){ return RaidenShogun.burstTalentTable[vm.burstRank()-1][0] + RaidenShogun.burstTalentTable[vm.burstRank()-1][1] * vm.chakraStacks(); },
            attackProps: { isBurst: true, isElectro:true }
        },
        {
            id: "burst_dmg",
            label: "夢想の一心1段目",
            dmgScale(vm){ return RaidenShogun.burstTalentTable[vm.burstRank()-1][4] + RaidenShogun.burstTalentTable[vm.burstRank()-1][2] * vm.chakraStacks(); },
            attackProps: { isBurst: true, isElectro:true }
        },
        {
            id: "burst_dmg",
            label: "夢想の一心重撃",
            dmgScale(vm){ return RaidenShogun.burstTalentTable[vm.burstRank()-1][9] + RaidenShogun.burstTalentTable[vm.burstRank()-1][2] * vm.chakraStacks()*2; },
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


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);


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

        obj.chakraStacks = this.chakraStacks();
        obj.useSkillEffect = this.useSkillEffect();
    }
}
