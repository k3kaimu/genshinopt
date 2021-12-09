import * as Base from '/js/modules/weapons/base.mjs'
import * as Calc from '/js/modules/dmg-calc.mjs'
import * as Widget from '/js/modules/widget.mjs'


// 流浪楽章
export class TheWidsith extends Base.WeaponData
{
    constructor()
    {
        super(
            "the_widsith",
            "流浪楽章",
            4,
            "Catalyst",
            510,
            "baseCrtDmg",
            0.551
        );
    }


    newViewModel()
    {
        return new TheWidsithViewModel(this);
    }


    static buffInc = [
        {atk: 0.60, dmg: 0.48, mry: 240},
        {atk: 0.75, dmg: 0.60, mry: 300},
        {atk: 0.90, dmg: 0.72, mry: 360},
        {atk: 1.05, dmg: 0.84, mry: 420},
        {atk: 1.20, dmg: 0.96, mry: 480},
    ];
}


// 流浪楽章, viewmodel
export class TheWidsithViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useAtkUp = ko.observable(true);
        this.useDmgUp = ko.observable(true);
        this.useMryUp = ko.observable(true);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        let useAtkUp_ = this.useAtkUp();
        let useDmgUp_ = this.useDmgUp();
        let useMryUp_ = this.useMryUp();
        let rank_ = this.rank();

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #useAtkUpWidsith = useAtkUp_;
            #useDmgUpWidsith = useDmgUp_;
            #useMryUpWidsith = useMryUp_;
            #rankWidsith = rank_;
            #isNestedWidsith = false;

            calculate(dmgScale, attackProps)
            {
                if(this.#isNestedWidsith) {
                    return super.calculate(dmgScale, attackProps);
                }

                let dmgs = [];

                if(this.#useAtkUpWidsith) {
                    this.rateAtk.value += TheWidsith.buffInc[this.#rankWidsith].atk;
                    this.#isNestedWidsith = true;
                    dmgs.push(super.calculate(dmgScale, attackProps));
                    this.rateAtk.value -= TheWidsith.buffInc[this.#rankWidsith].atk;
                    this.#isNestedWidsith = false;
                }

                if(this.#useDmgUpWidsith) {
                    this.baseAllDmg.value += TheWidsith.buffInc[this.#rankWidsith].dmg;
                    this.#isNestedWidsith = true;
                    dmgs.push(super.calculate(dmgScale, attackProps));
                    this.baseAllDmg.value -= TheWidsith.buffInc[this.#rankWidsith].dmg;
                    this.#isNestedWidsith = false;
                }

                if(this.#useMryUpWidsith) {
                    this.baseMastery.value += TheWidsith.buffInc[this.#rankWidsith].mry;
                    this.#isNestedWidsith = true;
                    dmgs.push(super.calculate(dmgScale, attackProps));
                    this.baseMastery.value -= TheWidsith.buffInc[this.#rankWidsith].mry;
                    this.#isNestedWidsith = false;
                }

                if(dmgs.length == 0) {
                    return new Calc.Attacks(Calc.VGData.zero());
                }

                let probs = [];
                for(let i = 0; i < dmgs.length; ++i)
                    probs.push(1.0 / dmgs.length);

                return Calc.Attacks.expect(probs, dmgs);
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    getBuffInc() { return TheWidsith.buffInc[this.rank()]; }

    countChecked() {
        return (this.useAtkUp() ? 1 : 0) + (this.useDmgUp() ? 1 : 0) + (this.useMryUp() ? 1 : 0)
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, `<span data-bind="css: {'text-danger': countChecked() == 0 }">バフ選択（最低一つ選択）</span>`,
                Widget.checkBoxViewHTML("useAtkUp", `攻撃力+${Widget.spanPercentageFix("getBuffInc().atk", 0)}（確率：${Widget.spanPercentageFix("useAtkUp() ? 1/countChecked() : 0", 0)}）`)
                +
                Widget.checkBoxViewHTML("useDmgUp", `ダメージ+${Widget.spanPercentageFix("getBuffInc().dmg", 0)}（確率：${Widget.spanPercentageFix("useDmgUp() ? 1/countChecked() : 0", 0)}）`)
                +
                Widget.checkBoxViewHTML("useMryUp", `元素熟知+${Widget.spanInteger("getBuffInc().mry", 0)}（確率：${Widget.spanPercentageFix("useMryUp() ? 1/countChecked() : 0", 0)}）`)
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.useAtkUp = this.useAtkUp();
        obj.useDmgUp = this.useDmgUp();
        obj.useMryUp = this.useMryUp();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.useAtkUp(obj.useAtkUp);
        this.useDmgUp(obj.useDmgUp);
        this.useMryUp(obj.useMryUp);
    }
}