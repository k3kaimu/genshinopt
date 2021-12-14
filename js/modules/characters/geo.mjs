import * as Base from '/js/modules/characters/base.mjs';

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
            label: "通常1段目",
            dmgScale: vm => Noelle.normal1DmgScale[vm.normalRank()-1],
            attackProps: { isNormal: true }
        },
        {
            label: "重撃連続",
            dmgScale: vm => Noelle.chargedDmgScale[vm.normalRank()-1],
            attackProps: { isCharged: true }
        },
        {
            label: "元素爆発：衝撃波",
            dmgScale: vm => Noelle.burstScale[vm.burstRank()-1][0],
            attackProps: { isBurst: true, isGeo: true, isNowNoelleBurst: true }
        },
        {
            label: "元素爆発：初撃",
            dmgScale: vm => Noelle.burstScale[vm.burstRank()-1][1],
            attackProps: { isBurst: true, isGeo: true, isNowNoelleBurst: true }
        },
        {
            label: "元素爆発中：通常1段目",
            dmgScale: vm => Noelle.normal1DmgScale[vm.normalRank()-1],
            attackProps: { isNormal: true, isGeo: true, isNowNoelleBurst: true,  }
        },
        {
            label: "元素爆発中：重撃連続",
            dmgScale: vm => Noelle.chargedDmgScale[vm.normalRank()-1],
            attackProps: { isCharged: true, isGeo: true, isNowNoelleBurst: true }
        }
    ];
}



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
        // 0:通常1段,    1:通常2段,      2:通常3段,      3:通常4段,      4:逆袈裟連斬,    5:逆袈裟とどめ,  6:左一文字斬り,  7;落下期間,     8:低空落下,     9:高空落下     
        [79.2/100,      76.4/100,      91.6/100,      117.2/100,     91.2/100,      190.9/100,     90.5/100,      81.8/100,      164/100,       204/100],
    ];

    static skillTable = [
        307.2/100,      // lv. 1
    ];

    static burstTable = [
        57.6/100,       // lv. 1
    ];


    static presetAttacks = [
        {
            label: "通常1段目",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][0],
            attackProps: { isNormal: true }
        },
        {
            label: "左一文字斬り（通常重撃）",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][6],
            attackProps: { isCharged: true }
        },
        {
            label: "荒瀧逆袈裟連撃",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][4],
            attackProps: { isCharged: true, isSakagesa: true }
        },
        {
            label: "荒瀧逆袈裟とどめ",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][5],
            attackProps: { isCharged: true, isSakagesa: true }
        },
        {
            label: "元素爆発中：通常1段目",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][0],
            attackProps: { isGeo: true, isNowAratakiBurst: true, isNormal: true }
        },
        {
            label: "元素爆発中：左一文字斬り（通常1段目）",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][6],
            attackProps: { isGeo: true, isNowAratakiBurst: true, isCharged: true }
        },
        {
            label: "元素爆発中：荒瀧逆袈裟連撃",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][4],
            attackProps: { isGeo: true, isNowAratakiBurst: true, isCharged: true, isSakagesa: true }
        },
        {
            label: "元素爆発中：荒瀧逆袈裟とどめ",
            dmgScale: vm => AratakiItto.normalTable[vm.normalRank()-1][5],
            attackProps: { isGeo: true, isNowAratakiBurst: true, isCharged: true, isSakagesa: true }
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


    maxNormalTalentRank()   { return 1; }
    maxSkillTalentRank()    { return 1; }
    maxBurstTalentRank()    { return 1; }

    // maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    // maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


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