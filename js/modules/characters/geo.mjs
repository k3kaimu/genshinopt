import * as Base from '/js/modules/characters/base.mjs';
import * as Widget from '/js/modules/widget.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';

// 旅人（岩）
export class TravelerGeo extends Base.CharacterData
{
    constructor()
    {
        super(
            "traveler_anemo",
            "旅人(岩)",
            5,
            "Geo",
            "Sword",
            213,        /* bAtk */
            682,        /* bDef */
            10875,      /* bHP */
            "rateAtk",  /* bBonusType */
            0.24        /* bBonusValue */
            );
    }
}


// 荒瀧一斗
export class AratakiItto extends Base.CharacterData
{
    constructor()
    {
        super(
            "arataki_itto",
            "荒瀧一斗",
            5,
            "Geo",
            "Claymore",
            227,        /* bAtk */
            959,        /* bDef */
            12858,      /* bHP */
            "baseCrtRate",  /* bBonusType */
            0.192       /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new AratakiIttoViewModel(this);
    }


    static normalTable = [
        // 0:通常1段, 1:2段, 2:3段,     3:4段,  4:逆袈裟連斬,5:逆袈裟とどめ,6:左一文字,7;落下期間,8:低空落下,9:高空落下     
        [79.2/100, 76.4/100, 91.6/100, 117.2/100, 91.2/100, 190.9/100, 90.5/100, 81.8/100, 164/100, 204/100],
        [85.7/100, 82.6/100, 99.1/100, 126.8/100, 98.6/100, 206.5/100, 97.8/100, 88.5/100, 177/100, 221/100],
        [92.1/100, 88.8/100, 106.6/100, 136.3/100, 106.0/100, 222/100, 105.2/100, 95.2/100, 190/100, 238/100],
        [101.3/100, 97.7/100, 117.2/100, 149.9/100, 116.6/100, 244.2/100, 115.7/100, 104.7/100, 209/100, 261/100],
        [107.8/100, 103.9/100, 124.7/100, 159.5/100, 124.0/100, 259.7/100, 123.0/100, 111.3/100, 223/100, 278/100],
        [115.2/100, 111.0/100, 133.2/100, 170.4/100, 132.5/100, 277.5/100, 131.5/100, 118.9/100, 238/100, 297/100],
        [125.3/100, 120.8/100, 144.9/100, 185.4/100, 144.2/100, 301.9/100, 143.1/100, 129.4/100, 259/100, 323/100],
        [135.4/100, 130.5/100, 156.6/100, 200.4/100, 155.8/100, 326.3/100, 154.6/100, 139.9/100, 280/100, 349/100],
        [145.6/100, 140.3/100, 168.4/100, 215.4/100, 167.5/100, 350.8/100, 166.2/100, 150.3/100, 301/100, 375/100],
        [156.6/100, 151.0/100, 181.2/100, 231.7/100, 180.2/100, 377.4/100, 178.8/100, 161.8/100, 323/100, 404/100],
        [169.3/100, 163.2/100, 195.8/100, 250.5/100, 194.8/100, 407.9/100, 193.3/100, 173.2/100, 346/100, 433/100],
    ];

    static skillTable = [
        3.07,
        3.30,
        3.53,
        3.84,
        4.07,
        4.30,
        4.61,
        4.92,
        5.22,
        5.53,
        5.84,
        6.14,
        6.53,
    ];

    static burstTable = [
        57.6/100,
        61.9/100,
        66.2/100,
        72/100,
        76.3/100,
        80.6/100,
        86.4/100,
        92.2/100,
        97.9/100,
        103.7/100,
        109.4/100,
        115.2/100,
        122.4/100,
    ];


    static presetAttacks = [
        {
            id: "normal_1",
            label: "通常1段目",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][0],
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "charged",
            label: "左一文字斬り（通常重撃）",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][6],
            attackProps: { isCharged: true, isPhysical: true }
        },
        {
            id: "sakagesa_cont",
            label: "荒瀧逆袈裟連撃",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][4],
            attackProps: { isCharged: true, isSakagesa: true, isPhysical: true }
        },
        {
            id: "sakagesa_last",
            label: "荒瀧逆袈裟とどめ",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][5],
            attackProps: { isCharged: true, isSakagesa: true, isPhysical: true }
        },
        {
            id: "skill",
            label: "スキル",
            dmgScale: vm => AratakiItto.skillTable[vm.skillRank()-1],
            attackProps: { isSkill: true, isGeo: true }
        },
        {
            id: "normal_1_burst",
            label: "元素爆発中：通常1段目",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][0],
            attackProps: { isGeo: true, isNowAratakiBurst: true, isNormal: true }
        },
        {
            id: "charged_burst",
            label: "元素爆発中：左一文字斬り（通常重撃）",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][6],
            attackProps: { isGeo: true, isNowAratakiBurst: true, isCharged: true }
        },
        {
            id: "sakagesa_cont_burst",
            label: "元素爆発中：荒瀧逆袈裟連撃",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][4],
            attackProps: { isGeo: true, isNowAratakiBurst: true, isCharged: true, isSakagesa: true }
        },
        {
            id: "sakagesa_last_burst",
            label: "元素爆発中：荒瀧逆袈裟とどめ",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][5],
            attackProps: { isGeo: true, isNowAratakiBurst: true, isCharged: true, isSakagesa: true }
        },
        {
            id: "skill_burst",
            label: "元素爆発中：スキル",
            dmgScale: vm => AratakiItto.skillTable[vm.skillRank()-1],
            attackProps: { isSkill: true, isGeo: true, isNowAratakiBurst: true, }
        },
    ];
}


// 荒瀧一斗
export class AratakiIttoViewModel extends Base.CharacterViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        let data = this.toJS();
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            aratakiData = data;

            increaseDamage(attackProps) {
                let dmg = super.increaseDamage(attackProps);

                if(attackProps.isSakagesa || false)
                    dmg = dmg.add(this.def().mul(0.35));

                return dmg;
            }

            atk(attackProps) {
                let dst = undefined;
                if(attackProps.isNowAratakiBurst || false)
                    dst = super.atk(attackProps).add(this.def(attackProps).mul(AratakiItto.burstTable[this.aratakiData.burstRank-1]));
                else
                    dst = super.atk(attackProps);

                return dst;
            }

            crtDmg(attackProps) {
                if(this.aratakiData.constell >= 6 && (attackProps.isCharged || false))
                    return super.crtDmg(attackProps).add(0.7);
                else
                    return super.crtDmg(attackProps);
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }
}


// ノエル
export class Noelle extends Base.CharacterData
{
    constructor()
    {
        super(
            "noelle",
            "ノエル",
            4,
            "Geo",
            "Claymore",
            191,        /* bAtk */
            799,        /* bDef */
            12071,      /* bHP */
            "rateDef",  /* bBonusType */
            0.30        /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new NoelleViewModel(this);
    }


    static normal1DmgScale = [
        0.791,      // lv. 1
        0.856,
        0.920,
        1.01,
        1.08,
        1.15,
        1.25,
        1.35,
        1.45,
        1.56,
        1.67,       // lv. 11
    ];

    static chargedDmgScale = [
        0.507,      // lv. 1
        0.549,
        0.590,
        0.649,
        0.690,
        0.738,
        0.802,
        0.867,
        0.932,
        1.00,
        1.07,       // lv. 11
    ];


    static burstScale = [
        // 爆発ダメージ, スキルダメージ，攻撃力上昇
        [0.672,  0.928,  0.40],
        [0.722,  0.998,  0.43],
        [0.773,  1.07,   0.46],
        [0.840,  1.16,   0.50],
        [0.890,  1.23,   0.53],
        [0.941,  1.30,   0.56],
        [1.01,   1.39,   0.60],
        [1.08,   1.48,   0.64],
        [1.14,   1.58,   0.68],
        [1.21,   1.67,   0.72],
        [1.28,   1.76,   0.76],
        [1.34,   1.86,   0.80],
        [1.43,   1.97,   0.85],
        [1.51,   2.09,   0.90],
    ];


    static presetAttacks = [
        {
            id: "normal_1",
            label: "通常1段目",
            dmgScale: vm => Noelle.normal1DmgScale[vm.normalRank()-1],
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "charged",
            label: "重撃連続",
            dmgScale: vm => Noelle.chargedDmgScale[vm.normalRank()-1],
            attackProps: { isCharged: true, isPhysical: true }
        },
        {
            id: "burst_impact",
            label: "元素爆発：衝撃波",
            dmgScale: vm => Noelle.burstScale[vm.burstRank()-1][0],
            attackProps: { isBurst: true, isGeo: true, isNowNoelleBurst: true }
        },
        {
            id: "burst_first",
            label: "元素爆発：初撃",
            dmgScale: vm => Noelle.burstScale[vm.burstRank()-1][1],
            attackProps: { isBurst: true, isGeo: true, isNowNoelleBurst: true }
        },
        {
            id: "normal_1_burst",
            label: "元素爆発中：通常1段目",
            dmgScale: vm => Noelle.normal1DmgScale[vm.normalRank()-1],
            attackProps: { isNormal: true, isGeo: true, isNowNoelleBurst: true,  }
        },
        {
            id: "charged_burst",
            label: "元素爆発中：重撃連続",
            dmgScale: vm => Noelle.chargedDmgScale[vm.normalRank()-1],
            attackProps: { isCharged: true, isGeo: true, isNowNoelleBurst: true }
        }
    ];
}


// ノエル
export class NoelleViewModel extends Base.CharacterViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        if(this.constell() >= 2) {
            calc.baseChargedDmg.value += 0.15;
        }

        let burstRank_ = this.burstRank();

        let defToAtkScale = Noelle.burstScale[burstRank_-1][2];
        if(this.constell() >= 6) {
            defToAtkScale += 0.5;
        }

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            noelleDefToAtkScale = defToAtkScale;

            atk(attackProps) {
                let dst = undefined;
                if(attackProps.isNowNoelleBurst || false)
                    dst = super.atk(attackProps).add(this.def(attackProps).mul(this.noelleDefToAtkScale));
                else
                    dst = super.atk(attackProps);

                return dst;
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }
}


// 凝光
export class Ningguang extends Base.CharacterData
{
    constructor()
    {
        super(
            "ningguang",
            "凝光",
            4,
            "Geo",
            "Catalyst",
            212,        /* bAtk */
            573,        /* bDef */
            9787,      /* bHP */
            "baseGeoDmg",  /* bBonusType */
            0.24        /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new NingguangViewModel(this);
    }


    static normalTalentTable = [
    //  0:通常,     1:重撃,  2:星璇,    3:落下,    4:低空,  5:高空
        [28.0/100, 174/100, 49.6/100, 56.8/100, 114/100, 142/100],
        [30.1/100, 187/100, 53.3/100, 61.5/100, 123/100, 153/100],
        [32.2/100, 200/100, 57.0/100, 66.1/100, 132/100, 165/100],
        [35.0/100, 218/100, 62.0/100, 72.7/100, 145/100, 182/100],
        [37.1/100, 231/100, 65.7/100, 77.3/100, 155/100, 193/100],
        [39.2/100, 244/100, 69.4/100, 82.6/100, 165/100, 206/100],
        [42.0/100, 261/100, 74.4/100, 89.9/100, 180/100, 224/100],
        [44.8/100, 279/100, 79.4/100, 97.1/100, 194/100, 243/100],
        [47.6/100, 296/100, 84.3/100, 104/100, 209/100, 261/100],
        [50.4/100, 313/100, 89.3/100, 112.3/100, 225/100, 281/100],
        [53.3/100, 331/100, 94.4/100, 120.3/100, 240/100, 300/100],
    ];

    static skillTalentTable = [
    // 0:HP,   1:ダメージ
        [0.501, 2.30],
        [0.531, 2.48],
        [0.561, 2.65],
        [0.600, 2.88],
        [0.630, 3.05],
        [0.660, 3.23],
        [0.699, 3.46],
        [0.738, 3.69],
        [0.777, 3.92],
        [0.816, 4.15],
        [0.855, 4.38],
        [0.894, 4.61],
        [0.933, 4.90],
    ];

    static burstTalentTable = [
        0.870,
        0.935,
        1.00,
        1.09,
        1.15,
        1.22,
        1.30,
        1.39,
        1.48,
        1.57,
        1.65,
        1.74,
        1.85,
        1.96,
    ];


    static presetAttacks = [
        {
            id: "normal_1",
            label: "通常1回",
            dmgScale: vm => Ningguang.normalTalentTable[vm.normalRank()-1][0],
            attackProps: { isNormal: true, isGeo: true },
        },
        {
            id: "charged_with_gems",
            label: "重撃+星璇",
            dmgScale: vm => [Ningguang.normalTalentTable[vm.normalRank()-1][1], new Array(Number(vm.gemStacks())).fill(Ningguang.normalTalentTable[vm.normalRank()-1][2]) ].flat() ,
            attackProps: { isCharged: true, isGeo: true },
        },
        {
            id: "skill",
            label: "元素スキル",
            dmgScale: vm => Ningguang.skillTalentTable[vm.skillRank()-1][1],
            attackProps: { isSkill: true, isGeo: true },
        },
        {
            id: "burst",
            label: "元素爆発（12発）",
            dmgScale: vm => new Array(12).fill(Ningguang.burstTalentTable[vm.burstRank()-1]),
            attackProps: { isBurst: true, isGeo: true },
        }
    ];
}


// 凝光
export class NingguangViewModel extends Base.CharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.gemStacks = ko.observable(3);
        this.useByobuBuff = ko.observable(true);
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        if(this.useByobuBuff()) {
            calc.baseGeoDmg.value += 0.12;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        let options = [
            {value: 0, label: "0個"},
            {value: 1, label: "1個"},
            {value: 2, label: "2個"},
            {value: 3, label: "3個"},
        ];

        // 6凸効果
        if(this.constell() >= 6) {
            options.push({value: 7, label: "7個"});
        }

        ret.push(
            Widget.buildViewHTML(target, "星璇スタック数",
                Widget.selectViewHTML("gemStacks", options))
        );

        ret.push(
            Widget.buildViewHTML(target, "備えあれば憂いなし",
                Widget.checkBoxViewHTML("useByobuBuff", "岩元素ダメージ+12%"))
        );

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.gemStacks = this.gemStacks();
        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.gemStacks(obj.gemStacks);
    }
}