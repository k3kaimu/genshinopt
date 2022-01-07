import * as Base from '/js/modules/characters/base.mjs';
import * as Widget from '/js/modules/widget.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Utils from '/js/modules/utils.mjs';

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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new AratakiItto(),
        {
            "vm": {
                "parent_id": "arataki_itto",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9
            },
            "expected": {
                "normal_1": 327.6111384,
                "charged": 450.41589431999995,
                "sakagesa_cont": 666.969345,
                "sakagesa_last": 1163.7276688799998,
                "skill": 1174.539933,
                "normal_1_burst": 1047.9421009512,
                "charged_burst": 1440.7623040557598,
                "sakagesa_cont_burst": 1665.0621466290002,
                "sakagesa_last_burst": 3254.0617274558394,
                "skill_burst": 3757.0451696190003
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new AratakiItto().newViewModel()
    ));
});


// アルベド
export class Albedo extends Base.CharacterData
{
    constructor()
    {
        super(
            "albedo",
            "アルベド",
            5,
            "Geo",
            "Sword",
            251,        /* bAtk */
            876,        /* bDef */
            13226,      /* bHP */
            "baseGeoDmg",  /* bBonusType */
            0.288       /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new AlbedoViewModel(this);
    }


    static normalTalentTable = [
    //  0:1段,     1:2段,     2:3段,    3:4段,     4:5段,    5:重撃,                6:落下,   7:低空,   8:高空
        [36.7/100, 36.7/100, 47.5/100, 49.8/100, 62.1/100, [47.3/100, 60.2/100], 63.9/100, 128/100, 160/100],
        [39.7/100, 39.7/100, 51.3/100, 53.8/100, 67.1/100, [51.2/100, 65.1/100], 69.1/100, 138/100, 173/100],
        [42.7/100, 42.7/100, 55.2/100, 57.9/100, 72.2/100, [55.0/100, 70.0/100], 74.3/100, 149/100, 186/100],
        [47.0/100, 47.0/100, 60.7/100, 63.6/100, 79.4/100, [60.5/100, 77.0/100], 81.8/100, 164/100, 204/100],
        [50.0/100, 50.0/100, 64.6/100, 67.7/100, 84.4/100, [64.4/100, 81.9/100], 87.0/100, 174/100, 217/100],
        [53.4/100, 53.4/100, 69.0/100, 72.3/100, 90.2/100, [68.8/100, 87.5/100], 92.9/100, 186/100, 232/100],
        [58.1/100, 58.1/100, 75.0/100, 78.7/100, 98.2/100, [74.8/100, 95.2/100], 101.1/100, 202/100, 253/100],
        [62.8/100, 62.8/100, 81.1/100, 85.0/100, 106.1/100, [80.9/100, 102.9/100], 109.3/100, 219/100, 273/100],
        [67.5/100, 67.5/100, 87.2/100, 91.4/100, 114.0/100, [86.9/100, 110.6/100], 117.5/100, 235/100, 293/100],
        [72.6/100, 72.6/100, 93.8/100, 98.3/100, 122.7/100, [93.5/100, 119.0/100], 126.4/100, 253/100, 316/100],
        [78.5/100, 78.5/100, 101.4/100, 106.3/100, 132.6/100, [101.1/100, 128.6/100], 135.3/100, 271/100, 338/100],
    ];


    static skillTalentTable = [
    //   0:スキルダメージ, 1:花ダメージ（防御参照）
        [1.30, 1.34],
        [1.40, 1.44],
        [1.50, 1.54],
        [1.63, 1.67],
        [1.73, 1.77],
        [1.83, 1.87],
        [1.96, 2.00],
        [2.09, 2.14],
        [2.22, 2.27],
        [2.35, 2.40],
        [2.48, 2.54],
        [2.61, 2.67],
        [2.77, 2.84],
    ];


    static burstTalentTable = [
    // 0:爆発ダメージ，1:生滅の花
        [3.67, 0.720],
        [3.95, 0.774],
        [4.22, 0.828],
        [4.59, 0.900],
        [4.87, 0.954],
        [5.14, 1.008],
        [5.51, 1.080],
        [5.88, 1.152],
        [6.24, 1.224],
        [6.61, 1.296],
        [6.98, 1.368],
        [7.34, 1.440],
        [7.80, 1.530],
        [8.26, 1.620],
    ];


    static presetAttacks = [
        {
            id: "normal_total",
            label: "通常1〜5段累計",
            dmgScale(vm){ return Albedo.normalTalentTable[vm.normalRank()-1].slice(0, 5); },
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "charged",
            label: "重撃",
            dmgScale(vm){ return Albedo.normalTalentTable[vm.normalRank()-1][5]; },
            attackProps: { isCharged: true, isPhysical: true }
        },
        {
            id: "skill_flower",
            label: "元素スキル：刹那の花",
            dmgScale(vm) { return 0; },     // increseDmgで計算する
            attackProps: { isSkill: true, isGeo: true, isAlbedoSkillFlower: true }
        },
        {
            id: "burst_total",
            label: "元素爆発（初撃+花x7）",
            dmgScale(vm) { return [Albedo.burstTalentTable[vm.burstRank()-1][0], ...new Array(7).fill(Albedo.burstTalentTable[vm.burstRank()-1][1])]; },
            attackProps: { isBurst: true, isGeo: true }
        }
    ];
}


// アルベド
export class AlbedoViewModel extends Base.CharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useDmgUpTalent = ko.observable(true);  // 白亜色の気迫
        this.useMryUpTalent = ko.observable(true);  // ホムンクルスの天智
        this.stackOfC2Effect = ko.observable(4);    // 2凸効果生滅カウント
        this.useC4Effect = ko.observable(true);     // 4凸効果
        this.useC6Effect = ko.observable(true);     // 6凸効果
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useMryUpTalent()) {
            calc.baseMastery.value += 125;
        }

        if(this.constell() >= 4 && this.useC4Effect()) {
            calc.basePlungeDmg.value += 0.30;
        }

        if(this.constell() >= 6 && this.useC6Effect()) {
            calc.baseAllDmg.value += 0.17;
        }

        let ctx = Calc.VGData.context;
        let data = this.toJS();
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #dAlbedo = data;

            allDmgBuff(attackProps) {
                if(attackProps.isAlbedoSkillFlower && this.#dAlbedo.useDmgUpTalent) {
                    return super.allDmgBuff(attackProps).add(Calc.VGData.constant(0.25).as(ctx));
                } else {
                    return super.allDmgBuff(attackProps);
                }
            }

            increaseDamage(attackProps) {

                if(attackProps.isSkill && attackProps.isAlbedoSkillFlower) {
                    // 刹那の花の防御参照ダメージ
                    return super.increaseDamage(attackProps).add(this.def(attackProps).mul(Albedo.skillTalentTable[this.#dAlbedo.skillRank-1][1]).as(ctx));
                } else if(attackProps.isBurst && this.#dAlbedo.constell >= 2) {
                    // 2凸効果の爆発ダメージ
                    return super.increaseDamage(attackProps).add(this.def(attackProps).mul(0.3 * Number(this.#dAlbedo.stackOfC2Effect)).as(ctx));
                } else {
                    return super.increaseDamage(attackProps);
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
            Widget.buildViewHTML(target, "白亜色の気迫",
                Widget.checkBoxViewHTML("useDmgUpTalent", "刹那の花ダメージ+25%"))
        );

        ret.push(
            Widget.buildViewHTML(target, "ホムンクルスの天智",
                Widget.checkBoxViewHTML("useMryUpTalent", "元素熟知+125"))
        );

        if(this.constell() >= 2) {
            ret.push(
                Widget.buildViewHTML(target, "生滅カウント（2凸効果）",
                    Widget.selectViewHTML("stackOfC2Effect", [
                        {value: 0, label: "0個（爆発ダメージ+0%防御力）"},
                        {value: 1, label: "1個（爆発ダメージ+30%防御力）"},
                        {value: 2, label: "2個（爆発ダメージ+60%防御力）"},
                        {value: 3, label: "3個（爆発ダメージ+90%防御力）"},
                        {value: 4, label: "4個（爆発ダメージ+120%防御力）"},
                    ])
                ));
        }

        if(this.constell() >= 4) {
            ret.push(Widget.buildViewHTML(target, "聖なる堕落（4凸効果）", 
                Widget.checkBoxViewHTML("useC4Effect", "落下攻撃ダメージ+30%")));
        }

        if(this.constell() >= 6) {
            ret.push(Widget.buildViewHTML(target, "無垢なる土（6凸効果）", 
                Widget.checkBoxViewHTML("useC6Effect", "ダメージ+17%")));
        }

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.useDmgUpTalent = this.useDmgUpTalent();
        obj.useMryUpTalent = this.useMryUpTalent();
        obj.stackOfC2Effect = this.stackOfC2Effect();
        obj.useC4Effect = this.useC4Effect();
        obj.useC6Effect = this.useC6Effect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);

        this.useDmgUpTalent(obj.useDmgUpTalent);
        this.useMryUpTalent(obj.useMryUpTalent);
        this.stackOfC2Effect(obj.stackOfC2Effect);
        this.useC4Effect(obj.useC4Effect);
        this.useC6Effect(obj.useC6Effect);
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Albedo(),
        {
            "vm": {
                "parent_id": "albedo",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "useDmgUpTalent": true,
                "useMryUpTalent": true,
                "stackOfC2Effect": 4,
                "useC4Effect": true,
                "useC6Effect": true
            },
            "expected": {
                "normal_total": 1091.49331005,
                "charged": 504.1392159374999,
                "skill_flower": 1643.0047074000001,
                "burst_total": 10641.68520246
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Albedo().newViewModel()
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Noelle(),
        {
            "vm": {
                "parent_id": "noelle",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9
            },
            "expected": {
                "normal_1": 274.26206249999996,
                "charged": 202.72695075,
                "burst_impact": 891.55088235,
                "burst_first": 1235.6582404500002,
                "normal_1_burst": 1133.990157375,
                "charged_burst": 838.2142418445001
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Noelle().newViewModel()
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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
        obj.useByobuBuff = this.useByobuBuff();
        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.gemStacks(obj.gemStacks);
        this.useByobuBuff(obj.useByobuBuff);
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Ningguang(),
        {
            "vm": {
                "parent_id": "ningguang",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "gemStacks": 3,
                "useByobuBuff": true,
            },
            "expected": {
                "normal_1": 129.0220848,
                "charged_with_gems": 1487.8197971999998,
                "skill": 1062.5348159999999,
                "burst": 4813.9332479999985
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Ningguang().newViewModel()
    ));
});



// 雲菫
export class YunJin extends Base.CharacterData
{
    constructor()
    {
        super(
            "yun_jin",
            "雲菫",
            4,
            "Geo",
            "Polearm",
            191,        /* bAtk */
            734,        /* bDef */
            10657,      /* bHP */
            "baseRecharge",  /* bBonusType */
            0.267       /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new YunJinViewModel(this);
    }


    static normalTalentTable = [
    //   0:1段,  1:2段, 2:3段,          3:4段,          4:5段,     5:重撃,    6:落下,    7:低空, 8:高空 
        [0.405, 0.402, [0.230, 0.275], [0.240, 0.288], 67.3/100, 121.7/100, 63.9/100, 1.28, 1.60],
        [0.438, 0.435, [0.248, 0.298], [0.259, 0.312], 72.8/100, 131.6/100, 69.1/100, 1.38, 1.73],
        [0.471, 0.468, [0.267, 0.320], [0.279, 0.335], 78.3/100, 141.5/100, 74.3/100, 1.49, 1.86],
        [0.518, 0.515, [0.294, 0.352], [0.307, 0.369], 86.1/100, 155.7/100, 81.8/100, 1.64, 2.04],
        [0.551, 0.548, [0.312, 0.374], [0.326, 0.392], 91.6/100, 165.6/100, 87.0/100, 1.74, 2.17],
        [0.589, 0.585, [0.334, 0.400], [0.349, 0.419], 97.9/100, 176.9/100, 92.9/100, 1.86, 2.32],
        [0.641, 0.637, [0.363, 0.435], [0.363, 0.435], 106.5/100, 192.4/100, 101.1/100, 2.02, 2.53],
        [0.692, 0.686, [0.392, 0.470], [0.410, 0.492], 115.1/100, 208.0/100, 109.3/100, 2.19, 2.73],
        [0.744, 0.739, [0.422, 0.506], [0.441, 0.529], 123.7/100, 223.6/100, 117.5/100, 2.35, 2.93],
        [0.800, 0.796, [0.454, 0.544], [0.474, 0.570], 133.1/100, 240.6/100, 126.4/100, 2.53, 3.16],
        [0.857, 0.852, [0.486, 0.582], [0.508, 0.610], 142.5/100, 260.0/100, 135.3/100, 2.71, 3.38],
    ];


    static skillTalentTable = [
    //  0:1回押し, 1:1段,  2:2段, 3:シールドHP%, 4:シールド加算値
        [1.491, 1.491, 1.491, 0.12, 1155],
        [1.603, 2.805, 4.008, 0.13, 1271],
        [1.715, 3.001, 4.287, 0.14, 1396],
        [1.864, 3.262, 4.660, 0.15, 1531],
        [1.976, 3.458, 4.940, 0.16, 1675],
        [2.088, 3.653, 5.219, 0.17, 1830],
        [2.237, 3.914, 5.592, 0.18, 1993],
        [2.386, 4.175, 5.965, 0.19, 2167],
        [2.535, 4.436, 6.338, 0.20, 2350],
        [2.684, 4.697, 6.710, 0.22, 2542],
        [2.833, 4.958, 7.083, 0.23, 2744],
        [2.982, 5.219, 7.456, 0.24, 2956],
        [3.169, 5.545, 7.922, 0.26, 3178],
    ];


    static burstTalentTable = [
    //   0:ダメージ, 1:ダメージ増加効果防御%
        [2.44, 0.32],
        [2.62, 0.35],
        [2.81, 0.37],
        [3.05, 0.40],
        [3.23, 0.43],
        [3.42, 0.45],
        [3.66, 0.48],
        [3.90, 0.51],
        [4.15, 0.55],
        [4.39, 0.58],
        [4.64, 0.61],
        [4.88, 0.64],
        [5.19, 0.68],
    ];


    static presetAttacks = [
        {
            id: "normal_1",
            label: "通常5段累計",
            dmgScale: vm => YunJin.normalTalentTable[vm.normalRank()-1].slice(0, 5).flat(),
            attackProps: { isNormal: true, isPhysical: true },
        },
        {
            id: "charged",
            label: "重撃",
            dmgScale: vm => YunJin.normalTalentTable[vm.normalRank()-1][5],
            attackProps: { isCharged: true, isPhysical: true },
        },
        {
            id: "skill_short",
            label: "元素スキル（短押し）",
            dmgScale: vm => 0,
            attackProps: { isSkill: true, isGeo: true, isYunJinSkillShort: true },
        },
        {
            id: "skill_long1",
            label: "元素スキル（長押し1段）",
            dmgScale: vm => 0,
            attackProps: { isSkill: true, isGeo: true, isYunJinSkillLong1: true },
        },
        {
            id: "skill_long2",
            label: "元素スキル（長押し2段）",
            dmgScale: vm => 0,
            attackProps: { isSkill: true, isGeo: true, isYunJinSkillLong2: true },
        },
        {
            id: "burst_dmg",
            label: "元素爆発ダメージ",
            dmgScale: vm => YunJin.burstTalentTable[vm.burstRank()-1][0],
            attackProps: { isBurst: true, isGeo: true },
        },
        {
            id: "burst_add",
            label: "爆発加算ダメージ（天賦倍率x防御力）",
            dmgScale: vm => 0,
            attackProps: { isYunJinBurstAddDmg: true, isChainable: false }
        }
    ];
}


// 雲菫
export class YunJinViewModel extends Base.CharacterViewModel
{
    // TODO: 6凸効果は未実装

    constructor(parent)
    {
        super(parent);
        this.numElems = ko.observable(4);           // チーム内の属性数
        this.useC2Effect = ko.observable(true);     // 2凸効果，通常攻撃+15%
        this.useC4Effect = ko.observable(true);     // 4凸効果，防御力+20%
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let ctx = Calc.VGData.context;
        let data = this.toJS();
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #dYunjin = data;

            calculate(dmgScale, attackProps)
            {
                if(attackProps.isYunJinBurstAddDmg) {
                    let scale = YunJin.burstTalentTable[this.#dYunjin.burstRank-1][1];
                    scale += ([2.5, 5.0, 7.5, 11.5][Number(this.#dYunjin.numElems) - 1]) / 100;

                    return new Calc.Attacks(this.def(attackProps).mul(scale).as(ctx));
                } else
                    return super.calculate(dmgScale, attackProps);
            }

            increaseDamage(attackProps) {
                // 雲菫スキルダメージ
                if(attackProps.isSkill && attackProps.isYunJinSkillShort) {
                    return super.increaseDamage(attackProps).add(this.def(attackProps).mul(YunJin.skillTalentTable[this.#dYunjin.skillRank-1][0]).as(ctx));
                } else if(attackProps.isSkill && attackProps.isYunJinSkillLong1) {
                    return super.increaseDamage(attackProps).add(this.def(attackProps).mul(YunJin.skillTalentTable[this.#dYunjin.skillRank-1][1]).as(ctx));
                } else if(attackProps.isSkill && attackProps.isYunJinSkillLong2) {
                    return super.increaseDamage(attackProps).add(this.def(attackProps).mul(YunJin.skillTalentTable[this.#dYunjin.skillRank-1][2]).as(ctx));
                } else {
                    return super.increaseDamage(attackProps);
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);

        if(this.constell() >= 2 && this.useC2Effect()) {
            calc.baseNormalDmg.value += 0.15;
        }

        if(this.constell() >= 4 && this.useC4Effect()) {
            calc.rateDef.value += 0.2;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        ret.push(
            Widget.buildViewHTML(target, "チーム内元素数",
                Widget.selectViewHTML("numElems", [
                {value: 1, label: "1種類"},
                {value: 2, label: "2種類"},
                {value: 3, label: "3種類"},
                {value: 4, label: "4種類"}]))
        );

        if(this.constell() >= 2) {
            ret.push(
                Widget.buildViewHTML(target, "諸般切末（2凸効果）",
                    Widget.checkBoxViewHTML("useC2Effect", "通常攻撃+15%"))
            );
        }

        if(this.constell() >= 4) {
            ret.push(
                Widget.buildViewHTML(target, "昇堂吊雲（4凸効果）",
                    Widget.checkBoxViewHTML("useC4Effect", "防御力+20%"))
            );
        }

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.numElems = this.numElems();
        obj.useC2Effect = this.useC2Effect();
        obj.useC4Effect = this.useC4Effect();
        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.numElems(obj.numElems);
        this.useC2Effect(obj.useC2Effect);
        this.useC4Effect(obj.useC4Effect);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new YunJin(),
        {
            "vm": {
                "parent_id": "yun_jin",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "numElems": 4,
                "useC2Effect": true,
                "useC4Effect": true
            },
            "expected": {
                "normal_1": 1004.498989875,
                "charged": 422.931015,
                "skill_short": 1080.130545,
                "skill_long1": 1890.121932,
                "skill_long2": 2700.539406,
                "burst_dmg": 784.9569375000001,
                "burst_add": 585.732
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new YunJin().newViewModel()
    ));
});
