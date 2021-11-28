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
