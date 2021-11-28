import * as Base from '/js/modules/weapons/base.mjs'


// 匣中滅龍
export class DragonsBane extends Base.WeaponData
{
    constructor()
    {
        super(
            "dragons_bane",
            "匣中滅龍",
            4,
            "Polearm",
            454,
            "baseMastery",
            221
        );
    }


    newViewModel()
    {
        return new DragonsBaneViewModel(this);
    }


    static dmgBuff = [0.2, 0.24, 0.28, 0.32, 0.36];
}


export class DragonsBaneViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useEffect = ko.observable(true);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        if(this.useEffect()) {
            calc.baseAllDmg.value += DragonsBane.dmgBuff[this.rank()];
        }

        return calc;
    }


    textDmgBuff() {
        return textPercentage(DragonsBane.dmgBuff[this.rank()], 3);
    }


    viewHTMLList(target)
    {
        return [
            `
            <div class="card">
                <div class="card-header p-2">炎と水の破滅</div>
                <div class="card-body p-2">
                    <div class="form-group m-0">
                        <div class="form-check" data-bind="with: ` + target + `">
                            <label class="form-check-label">
                                <input class="form-check-input" type="checkbox" data-bind="checked: useEffect" checked>
                                水/炎の影響を受けた敵へのダメージ+<span data-bind="text: textDmgBuff()"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            `
        ];
    }


    toJS() {
        let obj = super.toJS();
        obj.useEffect = this.useEffect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.useEffect(obj.useEffect);
    }
}



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


    static scaleHPtoATKh = [0.008, 0.01, 0.012, 0.014, 0.016];
    static scaleHPtoATKl = [0.01, 0.012, 0.014, 0.016, 0.018];
    static addRateHP = [0.2, 0.25, 0.3, 0.35, 0.4]; 
}


// 護摩の杖, ViewModel
export class StaffOfHomaViewModel extends Base.WeaponViewModel
{
    constructor(data)
    {
        super(data);
        this.selLowHighHP = ko.observable("lowHP");
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        let r = this.rank();
        calc.rateHP.value += StaffOfHoma.addRateHP[r];

        let scale = StaffOfHoma.scaleHPtoATKh[r];
        if(this.selLowHighHP() == "lowHP")
            scale += StaffOfHoma.scaleHPtoATKl[r];

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            staffOfHomaScale = scale;

            atk(attackProps){
                return super.atk(attackProps).add(this.hp(attackProps).mul(this.staffOfHomaScale));
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    textHPtoAtkh() { return textPercentage(StaffOfHoma.scaleHPtoATKh[this.rank()], 2) }
    textHPtoAtkl() { return textPercentage(StaffOfHoma.scaleHPtoATKh[this.rank()] + StaffOfHoma.scaleHPtoATKl[this.rank()], 2) }


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
                        HP上限の<span data-bind="text: textHPtoAtkh()"></span>分攻撃力上昇
                    </label>
                    </div>
                    <div class="form-check">
                    <label class="form-check-label">
                        <input class="form-check-input" type="radio" name="`+target+uid+`" value="lowHP" data-bind="checked: selLowHighHP">
                        HP上限の<span data-bind="text: textHPtoAtkl()"></span>分攻撃力上昇
                    </label>
                    </div>
                </div>
                </div>
            </div>
            `
        ];
    }


    toJS() {
        let obj = super.toJS();
        obj.selLowHighHP = this.selLowHighHP();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.selLowHighHP(obj.selLowHighHP);
    }
}
