import * as Base from '/js/modules/characters/base.mjs';
import * as Widget from '/js/modules/widget.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Utils from '/js/modules/utils.mjs';


// 甘雨
export class Ganyu extends Base.CharacterData
{
    constructor()
    {
        super(
            "ganyu",
            "甘雨",
            5,
            "Cryo",
            "Bow",
            335,            /* bAtk */
            630,            /* bDef */
            9797,          /* bHP */
            "baseCrtDmg",   /* bBonusType */
            0.384           /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new GanyuViewModel(this);
    }

    static normalTalentTable = [
    //  0:1段,     1:2段     2:3段     3:4段     4:5段      5:6段     6:狙撃    7:1段チャージ 8: 霜華 9:満開 10:落下 11:低空 12:高空
        [31.7/100, 35.6/100, 45.5/100, 45.5/100, 48.2/100, 57.6/100, 43.9/100, 124/100, 128/100, 218/100, 56.8/100, 114/100, 142/100],
        [34.3/100, 38.5/100, 49.2/100, 49.2/100, 52.2/100, 62.3/100, 47.4/100, 133/100, 138/100, 234/100, 61.5/100, 123/100, 153/100],
        [36.9/100, 41.4/100, 52.9/100, 52.9/100, 56.1/100, 67.0/100, 51.0/100, 143/100, 147/100, 250/100, 66.1/100, 132/100, 165/100],
        [40.6/100, 45.5/100, 58.2/100, 58.2/100, 61.7/100, 73.7/100, 56.1/100, 155/100, 160/100, 272/100, 72.7/100, 145/100, 182/100],
        [43.2/100, 48.4/100, 61.9/100, 61.9/100, 65.6/100, 78.4/100, 59.7/100, 164/100, 170/100, 288/100, 77.3/100, 155/100, 193/100],
        [46.1/100, 51.8/100, 66.1/100, 66.1/100, 70.1/100, 83.8/100, 63.8/100, 174/100, 179/100, 305/100, 82.6/100, 165/100, 206/100],
        [50.2/100, 56.3/100, 71.9/100, 71.9/100, 76.3/100, 91.1/100, 69.4/100, 186/100, 192/100, 326/100, 89.9/100, 180/100, 224/100],
        [54.2/100, 60.9/100, 77.8/100, 77.8/100, 82.5/100, 98.5/100, 75.0/100, 198/100, 205/100, 348/100, 97.1/100, 194/100, 243/100],
        [58.3/100, 65.4/100, 83.6/100, 83.6/100, 88.6/100, 105.9/100, 80.6/100, 211/100, 218/100, 370/100, 104.4/100, 209/100, 261/100],
        [62.7/100, 70.4/100, 89.9/100, 89.9/100, 95.4/100, 113.9/100, 86.7/100, 223/100, 230/100, 392/100, 112.3/100, 225/100, 281/100],
        [67.8/100, 76.1/100, 97.2/100, 97.2/100, 103.1/100, 123.1/100, 92.8/100, 236/100, 243/100, 413/100, 120.3/100, 240/100, 300/100],
    ];

    static skillTalentTable = [
    //  0:HP継承, 1:ダメージ
        [1.20, 1.32],
        [1.29, 1.42],
        [1.38, 1.52],
        [1.50, 1.65],
        [1.59, 1.75],
        [1.68, 1.85],
        [1.80, 1.98],
        [1.92, 2.11],
        [2.04, 2.24],
        [2.16, 2.38],
        [2.28, 2.51],
        [2.40, 2.64],
        [2.55, 2.81],
    ];

    static burstTalentTable = [
        0.70,
        0.76,
        0.81,
        0.88,
        0.93,
        0.98,
        1.05,
        1.12,
        1.19,
        1.26,
        1.34,
        1.41,
        1.49,
        1.58,
    ];


    static presetAttacks = [
        {
            id: "charged2",
            label: "霜華の矢",
            dmgScale(vm){ return Ganyu.normalTalentTable[vm.normalRank()-1][8]; },
            attackProps: { isCharged: true, isCryo: true, isGanyu2ndCharged: true }
        },
        {
            id: "charged2_flower",
            label: "霜華満開",
            dmgScale(vm){ return Ganyu.normalTalentTable[vm.normalRank()-1][9]; },
            attackProps: { isCharged: true, isCryo: true, isGanyu2ndCharged: true }
        },
        {
            id: "skill_dmg",
            label: "スキルダメージ",
            dmgScale(vm){ return Ganyu.skillTalentTable[vm.skillRank()-1][1]; },
            attackProps: { isSkill: true, isCryo: true }
        },
        {
            id: "burst_dmg",
            label: "爆発氷柱ダメージ",
            dmgScale(vm){ return Ganyu.burstTalentTable[vm.burstRank()-1]; },
            attackProps: { isBurst: true, isCryo: true }
        }
    ];
}

// 甘雨
export class GanyuViewModel extends Base.CharacterViewModel
{
    constructor(ch)
    {
        super(ch);
        this.useCryoDmgInc = ko.observable(false);  // 元素爆発エリア内で氷ダメージ+20%
        this.useC1Effect = ko.observable(true);     // 1凸効果，氷耐性-15%
        this.stacksC4Effect = ko.observable(0);     // 4凸効果，元素爆発エリア内の敵に+5%/スタックのダメージバフ，最大5スタックで+25% 
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useCryoDmgInc()) {
            calc.baseCryoDmg.value += 0.2;
        }

        if(this.useC1Effect() && this.constell() >= 1) {
            calc.baseCryoResis.value -= 0.15;
        }

        if(this.constell() >= 4) {
            calc.baseAllDmg.value += 0.05 * Number(this.stacksC4Effect());
        }

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            crtRate(attackProps) {
                if(attackProps.isGanyu2ndCharged || false) {
                    return super.crtRate(attackProps).add(0.2);
                } else {
                    return super.crtRate(attackProps);
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
            Widget.buildViewHTML(target, "天地安泰", Widget.checkBoxViewHTML("useCryoDmgInc", "氷元素ダメージ+20%"))
        );

        if(this.constell() >= 1) {
            ret.push(
                Widget.buildViewHTML(target, "飲露（1凸）", Widget.checkBoxViewHTML("useCryoDmgInc", "敵の氷元素耐性-15%"))
            );
        }

        if(this.constell() >= 4) {
            ret.push(
                Widget.buildViewHTML(target, "西狩（4凸）",
                    Widget.selectViewHTML("stacksC4Effect", [
                        {label: "ダメージ+0%", value: 0},
                        {label: "ダメージ+5%", value: 1},
                        {label: "ダメージ+10%", value: 2},
                        {label: "ダメージ+15%", value: 3},
                        {label: "ダメージ+20%", value: 4},
                        {label: "ダメージ+25%", value: 5},
                    ])
                )
            );
        }

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.useCryoDmgInc = this.useCryoDmgInc();
        obj.useC1Effect = this.useC1Effect();
        obj.stacksC4Effect = this.stacksC4Effect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);

        this.useCryoDmgInc(obj.useCryoDmgInc);
        this.useC1Effect(obj.useC1Effect);
        this.stacksC4Effect(obj.stacksC4Effect);
    }
}

runUnittest(function(){
    Utils.checkUnittestForCharacter(
        new Ganyu(),
        {
            "vm": {
                "parent_id": "ganyu",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "useCryoDmgInc": false,
                "useC1Effect": true,
                "stacksC4Effect": 0
            },
            "expected": {
                "charged2": 782.6660252500001,
                "charged2_flower": 1328.37811625,
                "skill_dmg": 695.620268,
                "burst_dmg": 369.54826737499997
            }
        }
    );
});
