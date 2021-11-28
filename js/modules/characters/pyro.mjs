import { VaporizeMeltProbabilityViewModel } from './base.mjs';
import * as Base from '/js/modules/characters/base.mjs';


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
            attackProps: { isPyro: true, isCharged: true },
            makeViewModel(characterViewModel) {
                let normalRank = characterViewModel.normalRank();
                return new VaporizeMeltProbabilityViewModel(HuTao.chargedDmgScaleTable[normalRank-1], { isPyro: true, isCharged: true });
            },
        }
    ];
}


export class HuTaoViewModel extends Base.CharacterViewModel
{
    constructor(ch)
    {
        super(ch);
        this.useSkill = ko.observable(true);
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

        if(! this.useSkill())
            return calc;

        let skillRank_ = this.skillRank();

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            hutaoSkillScale = HuTao.skillScaleTable[skillRank_-1];

            atk(attackProps) {
                return super.atk(attackProps).add(this.hp(attackProps).mul(this.hutaoSkillScale).min_number(4 * this.baseAtk.value));
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
        let ret = [
            `
            <div class="card">
                <div class="card-header p-2">蝶導来世（元素スキル）</div>
                <div class="card-body p-2">
                    <div class="form-group m-0">
                        <div class="form-check" data-bind="with: ` + target + `">
                            <label class="form-check-label">
                                <input class="form-check-input" type="checkbox" data-bind="checked: useSkill" checked>
                                HP上限の<span data-bind="text: skillScaleText()"></span>分だけ攻撃力上昇
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            `,
            `
            <div class="card">
                <div class="card-header p-2">血のかまど</div>
                <div class="card-body p-2">
                    <div class="form-group m-0">
                        <div class="form-check" data-bind="with: ` + target + `">
                            <label class="form-check-label">
                                <input class="form-check-input" type="checkbox" data-bind="checked: lowHP" checked>
                                +33%炎ダメージ
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            `];
        
        if(this.constell() >= 6) {
            ret.push(`
            <div class="card" data-bind="with: ` + target + `">
                <div class="card-header p-2">冥蝶の抱擁（6凸効果）</div>
                    <div class="card-body p-2">
                        <div class="form-group m-0">
                            <div class="form-check">
                                <label class="form-check-label">
                                    <input class="form-check-input" type="checkbox" data-bind="checked: useC6Effect" checked>
                                    会心率+100%
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `);
        }

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.useSkill = this.useSkill();
        obj.lowHP = this.lowHP();
        obj.useC6Effect = this.useC6Effect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);

        this.useSkill(obj.useSkill);
        this.lowHP(obj.lowHP);
        this.useC6Effect(obj.useC6Effect);
    }
}

runUnittest(function(){
    let vm1 = (new HuTao()).newViewModel();
    vm1.skillRank(1);
    vm1.useSkill(false);
    vm1.lowHP(false);
    vm1.useC6Effect(true);
    vm1.constell(6);

    let vm2 = (new HuTao()).newViewModel();
    vm2.fromJS(vm1.toJS());

    console.assert(vm2.skillRank() == 1);
    console.assert(vm2.useSkill() == false);
    console.assert(vm2.lowHP() == false);
    console.assert(vm2.useC6Effect() == true);
    console.assert(vm2.constell() == 6);
});
