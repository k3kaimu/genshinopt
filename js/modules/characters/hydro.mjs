import * as Base from './base.mjs';
import * as Widget from '../widget.mjs';
import * as Calc from '../dmg-calc.mjs';
import * as Utils from '../utils.mjs';



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

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            reactionProb = prob;

            calculate(dmgScale, attackProps) {
                if(attackProps.isHydro || false) {
                    let newProps = Object.assign({}, attackProps);
        
                    // 元素反応なし
                    let dmg1 = super.calculate(dmgScale, newProps);

                    // 元素反応あり
                    newProps.isVaporize = true;
                    let dmg2 = super.calculate(dmgScale, newProps);

                    let txtReact = "蒸発";
        
                    return Calc.Attacks.expect([1 - this.reactionProb, this.reactionProb], [dmg1, dmg2], [`${txtReact}反応なし`, `${txtReact}反応あり`]);
                } else {
                    // 攻撃が水ではないので，元素反応なし
                    return super.calculate(dmgScale, attackProps);
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);
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
            dmgScale: vm => Tartaglia.skillDmgTable[vm.skillRank()-1].slice(1, 7).flat(),
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