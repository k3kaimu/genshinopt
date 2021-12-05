import * as Base from '/js/modules/characters/base.mjs';
import * as Widget from '/js/modules/widget.mjs';


export class PyroCharacterViewModel extends Base.CharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.reactionType = ko.observable("isVaporize");
        this.reactionProb = ko.observable(0);
    }


    viewHTMLList(target){
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "蒸発/溶解",
                Widget.selectViewHTML("reactionType", [
                    {label: "蒸発", value: "isVaporize"},
                    {label: "溶解", value: "isMelt"}
                ], "元素反応")
                +
                Widget.sliderViewHTML("reactionProb", 0, 1, 0.1,
                    `反応確率：` + Widget.spanPercentage("reactionProb()", 2))
            )
        );

        return dst;
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        let prob = Number(this.reactionProb());
        let type = this.reactionType();

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            reactionProb = prob;
            reactionType = type;

            calculate(dmgScale, attackProps) {
                if(attackProps.isPyro || false) {
                    let newProps = Object.assign({}, attackProps);
        
                    // 元素反応なし
                    let dmg1 = super.calculate(dmgScale, newProps);

                    // 元素反応あり
                    newProps[this.reactionType] = true;
                    let dmg2 = super.calculate(dmgScale, newProps);
        
                    return dmg1.mul(1 - this.reactionProb).add(dmg2.mul(this.reactionProb));
                } else {
                    // 攻撃が炎ではないので，元素反応なし
                    return super.calculate(dmgScale, attackProps);
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    toJS() {
        let obj = super.toJS();
        obj.reactionType = this.reactionType();
        obj.reactionProb = this.reactionProb();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.reactionType(obj.reactionType);
        this.reactionProb(obj.reactionProb);
    }
}


// 胡桃
export class HuTao extends Base.CharacterData
{
    constructor()
    {
        super(
            "hu_tao",
            "胡桃",
            5,
            "Pyro",
            "Polearm",
            106,            /* bAtk */
            876,            /* bDef */
            15552,          /* bHP */
            "baseCrtDmg",   /* bBonusType */
            0.384           /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new HuTaoViewModel(this);
    }

    static chargedDmgScaleTable = [
        1.360,          // lv. 1
        1.452,
        1.545,
        1.669,
        1.761,
        1.869,
        2.009,
        2.148,
        2.287,
        2.426,
        2.565,          // lv. 11
    ];

    static skillScaleTable = [
        0.0384,         // lv. 1
        0.0407,
        0.0430,
        0.0460,
        0.0483,
        0.0506,
        0.0536,
        0.0566,
        0.0596,
        0.0626,
        0.0656,
        0.0685,
        0.0715,         // lv. 13
    ];

    static burstDmgScaleTable = [
        3.03,           // lv. 1
        3.21,
        3.40,
        3.63,
        3.81,
        4.00,
        4.23,
        4.47,
        4.70,
        4.94,
        5.18,
        5.41,
        5.65,           // lv. 13
    ];


    static presetAttacks = [
        {
            label: "重撃",
            dmgScale(vm){ return HuTao.chargedDmgScaleTable[vm.normalRank()-1] },
            attackProps: { isCharged: true, }
        },
        {
            label: "スキル中重撃",
            dmgScale(vm){ return HuTao.chargedDmgScaleTable[vm.normalRank()-1] },
            attackProps: { isPyro: true, isCharged: true, isNowHuTaoSkill: true }
        },
        {
            label: "爆発",
            dmgScale(vm){ return HuTao.burstDmgScaleTable[vm.burstRank()-1] },
            attackProps: { isPyro: true, isBurst: true }
        },
        {
            label: "スキル中爆発",
            dmgScale(vm){ return HuTao.burstDmgScaleTable[vm.burstRank()-1] },
            attackProps: { isPyro: true, isBurst: true, isNowHuTaoSkill: true }
        }
    ];
}


export class HuTaoViewModel extends PyroCharacterViewModel
{
    constructor(ch)
    {
        super(ch);
        this.lowHP = ko.observable(true);
        this.useC6Effect = ko.observable(false);
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        if(this.lowHP()) {
            calc.basePyroDmg.value += 0.33;
        }

        if(this.constell() >= 6 && this.useC6Effect()) {
            calc.baseCrtRate.value += 1;
        }

        let skillRank_ = this.skillRank();

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            hutaoSkillScale = HuTao.skillScaleTable[skillRank_-1];

            atk(attackProps) {
                let dst = undefined;
                if(attackProps.isNowHuTaoSkill || false)
                    dst = super.atk(attackProps).add(this.hp(attackProps).mul(this.hutaoSkillScale).min_number(4 * this.baseAtk.value));
                else
                    dst = super.atk(attackProps);

                return dst;
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    skillScaleText()
    {
        return textPercentage(HuTao.skillScaleTable[this.skillRank()-1], 3); 
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        ret.push(
            Widget.buildViewHTML(target, "血のかまど", Widget.checkBoxViewHTML("lowHP", "+33%炎ダメージ"))
        );
        
        if(this.constell() >= 6) {
            ret.push(Widget.buildViewHTML(target, "冥蝶の抱擁（6凸効果）", Widget.checkBoxViewHTML("useC6Effect", "会心率+100%")));
        }

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.lowHP = this.lowHP();
        obj.useC6Effect = this.useC6Effect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);

        this.lowHP(obj.lowHP);
        this.useC6Effect(obj.useC6Effect);
    }
}

runUnittest(function(){
    let vm1 = (new HuTao()).newViewModel();
    vm1.skillRank(1);
    vm1.lowHP(false);
    vm1.useC6Effect(true);
    vm1.constell(6);

    let vm2 = (new HuTao()).newViewModel();
    vm2.fromJS(vm1.toJS());

    console.assert(vm2.skillRank() == 1);
    console.assert(vm2.lowHP() == false);
    console.assert(vm2.useC6Effect() == true);
    console.assert(vm2.constell() == 6);
});
