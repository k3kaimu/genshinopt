import * as Base from '/js/modules/weapons/base.mjs';
import * as Widget from '/js/modules/widget.mjs';


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
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "炎と水の破滅",
                Widget.checkBoxViewHTML("useEffect", 
                    `水/炎の影響を受けた敵へのダメージ+` + Widget.spanText("textDmgBuff()") )
            )
        );

        return dst;
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
        let dst = super.viewHTMLList(target);

        var uid = genUniqueId();

        dst.push(
            Widget.buildViewHTML(target, "攻撃力上昇効果",
                Widget.radioViewHTML("selLowHighHP", [
                    {value: "highHP", label: `HP上限の${Widget.spanText("textHPtoAtkh()")}分攻撃力上昇`},
                    {value: "lowHP", label: `HP上限の${Widget.spanText("textHPtoAtkl()")}分攻撃力上昇`},
                ])
            )
        );

        return dst;
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
