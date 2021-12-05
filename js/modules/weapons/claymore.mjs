import { checkBoxViewHTML } from '../widget.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Base from '/js/modules/weapons/base.mjs';
import * as Widget from '/js/modules/widget.mjs';


// 白影の剣
export class Whiteblind extends Base.WeaponData
{
    constructor()
    {
        super(
            "whiteblind",
            "白影の剣",
            4,
            "Claymore",
            510,
            "rateDef",
            0.517
        );
    }


    newViewModel()
    {
        return new WhiteblindViewModel(this);
    }


    static buffInc = [0.06, 0.075, 0.09, 0.105, 0.12];
}


// 白影の剣, viewmodel
export class WhiteblindViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.buffStacks = ko.observable(4);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);
        calc.rateAtk.value += this.buffStacks() * Whiteblind.buffInc[this.rank()];
        calc.rateDef.value += this.buffStacks() * Whiteblind.buffInc[this.rank()];
        return calc;
    }


    getBuffInc() { return Whiteblind.buffInc[this.rank()]; }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, `攻撃力/防御力+${Widget.spanPercentageFix("getBuffInc()", 1)}/スタック`,
                Widget.selectViewHTML("buffStacks", [
                    {value: 0, label: "0スタック"},
                    {value: 1, label: "1スタック"},
                    {value: 2, label: "2スタック"},
                    {value: 3, label: "3スタック"},
                    {value: 4, label: "4スタック"},
                ])
            ) 
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.buffStacks = this.buffStacks();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.buffStacks(obj.buffStacks);
    }
}


// 古華・試作
export class PrototypeArchaic extends Base.WeaponData
{
    constructor()
    {
        super(
            "prototype_archaic",
            "古華・試作",
            4,
            "Claymore",
            565,
            "rateAtk",
            0.276
        );
    }


    newViewModel()
    {
        return new PrototypeArchaicViewModel(this);
    }


    static additionalScale = [2.4, 3.0, 3.6, 4.2, 4.8];
}



// 古華・試作, viewmodel
export class PrototypeArchaicViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useEffect = ko.observable(false);
        this.perAttack = ko.observable(10);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        if(! this.useEffect())
            return calc;

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let scale = PrototypeArchaic.additionalScale[this.rank()];
        let perAttack_ = Number(this.perAttack());

        let NewCalc = class extends CalcType {
            scaleOfPrototypeArchaic = scale;
            perAttackOfPrototypeArchaic = perAttack_;

            chainedAttackDmg(attackProps) {
                let superValue = super.chainedAttackDmg(attackProps);

                if(hasAnyPropertiesWithSameValue(attackProps, {isNormal: true, isCharged: true})) {
                    let newProps = shallowDup(attackProps);
                    // 元々の攻撃の属性や攻撃種類を削除する
                    newProps = Calc.deleteAllElementFromAttackProps(attackProps);
                    newProps = Calc.deleteAllAttackTypeFromAttackProps(attackProps);

                    newProps.isPhysical = true;   // 物理攻撃
                    newProps.isChainable = false; // この攻撃では追撃は発生しない
                    return superValue.add(super.calculateNormalDmg(this.scaleOfPrototypeArchaic, newProps).div(this.perAttackOfPrototypeArchaic));
                } else {
                    // 通常攻撃でも重撃でもないので，追撃は発生しない
                    return superValue;
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    addAttackPercentageText()
    {
        return textPercentageFix(PrototypeArchaic.additionalScale[this.rank()], 0);
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "通常/重撃時：追加ダメージ",
                Widget.checkBoxViewHTML("useEffect",
                    `${Widget.spanText("perAttack()")}回に1回${Widget.spanText("addAttackPercentageText()")}物理ダメージ`)
                +
                Widget.sliderViewHTML("perAttack", 1, 20, 1, `発生頻度`, {disable: "!useEffect()"})
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.perAttack = this.perAttack();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.perAttack(obj.perAttack);
    }
}