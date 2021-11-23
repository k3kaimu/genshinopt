import * as Base from '/js/modules/weapons/base.mjs'


// 護摩の杖
export class StaffOfHoma extends Base.WeaponData
{
    constructor()
    {
        super(
            "staff_of_homa",
            "護摩の杖",
            5,
            "Polearm",
            608,
            "baseCrtDmg",
            0.662
        );
    }


    newViewModel()
    {
        return new StaffOfHomaViewModel(this);
    }
}


// 護摩の杖, ViewModel
export class StaffOfHomaViewModel extends Base.WeaponViewModel
{
    constructor(data)
    {
        super(data);
        this.selLowHighHP = ko.observable("lowHP");
        this.scaleHPtoATKh = [0.008, 0.01, 0.012, 0.014, 0.016];
        this.scaleHPtoATKl = [0.01, 0.012, 0.014, 0.016, 0.018];
        this.addRateHP = [0.2, 0.25, 0.3, 0.35, 0.4]; 
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        let r = this.rank();
        calc.rateHP.value += this.addRateHP[r];

        let scale = this.scaleHPtoATKh[r];
        if(this.selLowHighHP() == "lowHP")
            scale += this.scaleHPtoATKl[r];

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            staffOfHomaScale = scale;

            atk(){
                return super.atk().add(this.hp().mul(this.staffOfHomaScale));
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    viewHTMLList(target)
    {
        var uid = genUniqueId();

        return [
            `
            <div class="card">
                <div class="card-header p-2">攻撃力上昇効果</div>
                <div class="card-body p-2">
                <div class="form-group" data-bind="with: `+target+`">
                    <div class="form-check">
                    <label class="form-check-label">
                        <input class="form-check-input" type="radio" name="`+target+uid+`" value="highHP" data-bind="checked: selLowHighHP">
                        HP上限の<span data-bind="text: textPercentage(scaleHPtoATKh[rank()], 2)"></span>%分攻撃力上昇
                    </label>
                    </div>
                    <div class="form-check">
                    <label class="form-check-label">
                        <input class="form-check-input" type="radio" name="`+target+uid+`" value="lowHP" data-bind="checked: selLowHighHP">
                        HP上限の<span data-bind="text: textPercentage(scaleHPtoATKh[rank()] + scaleHPtoATKl[rank()], 2)"></span>%分攻撃力上昇
                    </label>
                    </div>
                </div>
                </div>
            </div>
            `
        ]
    }
}
