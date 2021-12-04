import * as Calc from '/js/modules/dmg-calc.mjs'
import * as Base from '/js/modules/weapons/base.mjs'


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


    textbuffInc() { return Whiteblind.buffInc[this.rank()]; }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(`
        <div class="card" data-bind="with: ${target}">
            <div class="card-header p-2">攻撃力/防御力+<span data-bind="text: textPercentageFix(textbuffInc(), 1)"></span>/スタック</div>
            <div class="card-body p-2">
                <div class="form-group m-0">
                    <select class="custom-select" data-bind="value: buffStacks">
                        <option value="0">0スタック</option>
                        <option value="1">1スタック</option>
                        <option value="2">2スタック</option>
                        <option value="3">3スタック</option>
                        <option selected value="4">4スタック</option>
                    </select>
                </div>
            </div>
        </div>
        `);

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
                    return superValue.add(super.calculateDmg(this.scaleOfPrototypeArchaic, newProps).div(this.perAttackOfPrototypeArchaic));
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

        dst.push(`
        <div class="card" data-bind="with: ${target}">
            <div class="card-header p-2">通常/重撃時：追加ダメージ</div>
            <div class="card-body p-2">
                <div class="form-check" data-bind="with: ` + target + `">
                    <label class="form-check-label">
                        <input class="form-check-input" type="checkbox" data-bind="checked: useEffect">
                        <span data-bind="text: perAttack"></span>回に1回<span data-bind="text: addAttackPercentageText()"></span>物理ダメージ
                    </label>
                </div>
                <div class="form-group row">
                    <label class="col-sm-5 col-form-label">発生頻度</label>
                    <div class="col-sm-7 mt-sm-2">
                    <input type="range" data-bind="value: perAttack, disable: !useEffect()" class="form-control-range" min="1" max="20" step="1">
                    </div>
                </div>
            </div>
        </div>
        `);

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