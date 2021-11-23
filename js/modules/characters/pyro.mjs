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


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        if(this.lowHP()) {
            calc.basePyroDmg.value += 0.33;
        }

        if(this.useC6Effect()) {
            calc.baseCrtRate.value += 1;
        }

        if(! this.useSkill())
            return calc;

        let skillRank_ = this.skillRank();

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            hutaoSkillScale = HuTao.skillScaleTable[skillRank_-1];

            atk() {
                return super.atk().add(this.hp().mul(this.hutaoSkillScale).min_number(4 * this.baseAtk.value));
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    viewHTMLList(target)
    {
        return [
            `
            <div class="card">
                <div class="card-header p-2">蝶導来世（元素スキル）</div>
                <div class="card-body p-2">
                    <div class="form-group m-0">
                        <div class="form-check" data-bind="with: ` + target + `">
                            <label class="form-check-label">
                                <input class="form-check-input" type="checkbox" data-bind="checked: useSkill" checked>
                                HP上限の<div data-bind="text: skillScaleText()">分だけ攻撃力上昇
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
                                +33%炎ダメ（HP50%以下）
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            `,
            `
            <div data-bind="if: $root.selConstellation() >= 6">
                <div class="card">
                    <div class="card-header p-2">冥蝶の抱擁（6凸効果）</div>
                        <div class="card-body p-2">
                            <div class="form-group m-0">
                                <div class="form-check" data-bind="with: ` + target + `">
                                    <label class="form-check-label">
                                        <input class="form-check-input" type="checkbox" data-bind="checked: useC6Effect" checked>
                                        会心率+100%
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `
        ];
    }
}


