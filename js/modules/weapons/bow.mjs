import * as Base from '/js/modules/weapons/base.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Widget from '/js/modules/widget.mjs';



// 天空の翼
export class SkywardHarp extends Base.WeaponData
{
    constructor()
    {
        super(
            "skyward_harp",
            "天空の翼",
            5,
            "Bow",
            674,
            "baseCrtRate",
            0.221
        );
    }


    newViewModel()
    {
        return new SkywardHarpViewModel(this);
    }


    static addCrtDmg = [0.2, 0.25, 0.30, 0.35, 0.40];
}



// 天空の翼, viewmodel
export class SkywardHarpViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useEffect = ko.observable(false);
        this.perAttack = ko.observable(5);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseCrtDmg.value += SkywardHarp.addCrtDmg[this.rank()];

        if(! this.useEffect())
            return calc;

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let perAttack_ = Number(this.perAttack());

        let NewCalc = class extends CalcType {
            perAttackOfSkywardHarp = perAttack_;

            chainedAttackDmg(attackProps) {
                let superValue = super.chainedAttackDmg(attackProps);

                let newProps = shallowDup(attackProps);
                // 元々の攻撃の属性や攻撃種類を削除する
                newProps = Calc.deleteAllElementFromAttackProps(attackProps);
                newProps = Calc.deleteAllAttackTypeFromAttackProps(attackProps);

                newProps.isPhysical = true;   // 物理攻撃
                newProps.isChainable = false; // この攻撃では追撃は発生しない
                return superValue.add(super.calculateNormalDmg(1.25, newProps).div(this.perAttackOfSkywardHarp));
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "追加ダメージ",
                Widget.checkBoxViewHTML("useEffect",
                    `${Widget.spanText("perAttack()")}回に1回125%物理ダメージ`)
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



// 弓蔵
export class Rust extends Base.WeaponData
{
    constructor()
    {
        super(
            "rust",
            "弓蔵",
            4,
            "Bow",
            510,
            "rateAtk",
            0.413
        );
    }


    newViewModel()
    {
        return new RustViewModel(this);
    }


    static addNormalDmg = [0.4, 0.5, 0.6, 0.7, 0.8];
}


// 弓蔵
export class RustViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseNormalDmg.value += Rust.addNormalDmg[this.rank()];
        calc.baseChargedDmg.value -= 0.1;

        return calc;
    }
}
