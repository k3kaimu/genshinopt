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


// 草薙の稲光
export class EngulfingLightning extends Base.WeaponData
{
    constructor()
    {
        super(
            "engulfing_lightning",
            "草薙の稲光",
            5,
            "Polearm",
            608,
            "baseRecharge",
            0.551
        );
    }


    newViewModel()
    {
        return new EngulfingLightningViewModel(this);
    }


    static effectTable = [
    //  0:攻撃力変換, 1:最大攻撃力, 2:元素ダメージ効率
        [0.28, 0.8, 0.30],
        [0.35, 0.9, 0.35],
        [0.42, 1.0, 0.40],
        [0.49, 1.1, 0.45],
        [0.56, 1.2, 0.50],
    ];
}


// 草薙の稲光
export class EngulfingLightningViewModel extends Base.WeaponViewModel
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
            calc.baseRecharge.value += EngulfingLightning.effectTable[this.rank()][2];
        }

        let data = this.toJS();
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #dataEngLight = data;

            atk(attackProps){
                let incAtk = this.recharge(attackProps).sub(1)
                        .mul(EngulfingLightning.effectTable[this.#dataEngLight.rank][0]);

                incAtk = incAtk.min_number(EngulfingLightning.effectTable[this.#dataEngLight.rank][1]);

                return super.atk(attackProps).add(incAtk.mul(this.baseAtk));
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "非時の夢・常世竈食",
                Widget.checkBoxViewHTML("useEffect", 
                    `元素チャージ効率+${textPercentageFix(EngulfingLightning.effectTable[this.rank()][2], 0)}`)
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



// 西風長槍
export class FavoniusLance extends Base.WeaponData
{
    constructor()
    {
        super(
            "favonius_lance",
            "西風長槍",
            4,
            "Polearm",
            565,
            "baseRecharge",
            0.306
        );
    }
}


//「漁獲」
export class TheCatch extends Base.WeaponData
{
    constructor()
    {
        super(
            "the_catch",
            "漁獲",
            4,
            "Polearm",
            510,
            "baseRecharge",
            0.459
        );
    }


    newViewModel()
    {
        return new TheCatchViewModel(this);
    }


    static effectTable = [
        [0.16, 0.060],
        [0.20, 0.075],
        [0.24, 0.090],
        [0.28, 0.105],
        [0.32, 0.120],
    ];
}


//「漁獲」
export class TheCatchViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseBurstDmg.value += TheCatch.effectTable[this.rank()][0];

        let data = this.toJS();
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #dataTheCatch = data;

            crtRate(attackProps) {
                if(attackProps.isBurst || false) {
                    return super.crtRate(attackProps).add(TheCatch.effectTable[this.#dataTheCatch.rank][1]);
                } else {
                    return super.crtRate(attackProps);
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }
}


