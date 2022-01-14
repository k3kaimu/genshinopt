import * as Widget from './widget.mjs';
import * as Calc from './dmg-calc.mjs';


export class BufferEffect
{
    constructor(id, label, type)
    {
        this.id = id;
        this.label = label;
        this.type = type;       // "C": キャラ, "W": 武器, "A": 聖遺物, "F": 食料, "E": 元素共鳴
    }


    newViewModel() {
        return new BufferEffectViewModel(this);
    }
}


export class BufferEffectViewModel
{
    constructor(parent) {
        this.parent = parent;
    }


    applyDmgCalcImpl(calc)
    {
        return calc;
    }


    applyDmgCalc(calc)
    {
        return this.applyDmgCalcImpl(calc);
    }


    viewHTMLList(target)
    {
        return [];
    }


    toJS() {
        return {
            parent_id: this.parent.id,
        };
    }


    fromJS(obj) {

    }
}


export class ConstantBufferEffect extends BufferEffect
{
    constructor(id, label, type, targetAndValues)
    {
        super(id, label, type);
        this.buffStatus = targetAndValues;
    }


    newViewModel() {
        return new ConstantBufferEffectViewModel(this);
    }
}


export class ConstantBufferEffectViewModel extends BufferEffectViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        Object.keys(this.parent.buffStatus).forEach(k => {
            calc[k].value += this.parent.buffStatus[k];
        });

        return calc;
    }
}


export class BufferEffectViewModelFactory extends BufferEffect
{
    constructor(id, label, type, fn)
    {
        super(id, label, type);
        this.fn = fn;
    }


    newViewModel()
    {
        return this.fn(this);
    }
}


export class CharacterBufferEffectViewModel extends BufferEffectViewModel
{
    constructor(parent)
    {
        super(parent);
        this.constell = ko.observable(6);           // 凸数, 無凸==0
        this.normalRank = ko.observable(9);         // 通常天賦
        this.skillRank = ko.observable(9);          // スキル天賦
        this.burstRank = ko.observable(9);          // 爆発天賦
    }


    maxNormalTalentRank() { return 11; }
    maxSkillTalentRank() { return 10; }
    maxBurstTalentRank() { return 10; }


    toJS() {
        let obj = super.toJS();
        obj.constell   = this.constell();
        obj.normalRank = this.normalRank();
        obj.skillRank  = this.skillRank();
        obj.burstRank  = this.burstRank();
        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.constell(obj.constell);
        this.normalRank(obj.normalRank);
        this.skillRank(obj.skillRank);
        this.burstRank(obj.burstRank);
    }
}


// 蒸発・溶解ダメージ
export class VaporizeMeltEffectViewModel extends BufferEffectViewModel
{
    constructor(parent)
    {
        super(parent);
        this.reactionType = ko.observable("isVaporize");
        this.reactionProb = ko.observable(0);
    }


    viewHTMLList(target){
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "蒸発/溶解",
                Widget.selectViewHTML("reactionType", [
                    {label: "蒸発", value: "isVaporize"},
                    {label: "溶解", value: "isMelt"}
                ], "元素反応")
                +
                Widget.sliderViewHTML("reactionProb", 0, 1, 0.1,
                    `反応確率：` + Widget.spanPercentage("reactionProb()", 2))
                +
                `<span>この設定を有効にした場合，<b>キャラクター設定での蒸発・溶解の発生確率は0にしてください</b>．0以外では効果が重複して乗算されてしまいます．</span>`
            )
        );

        return dst;
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let prob = Number(this.reactionProb());
        let type = this.reactionType();

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            calculate(dmgScale, attackProps) {
                if(attackProps.isPyro
                    || (attackProps.isCryo &&   type == "isMelt")
                    || (attackProps.isHydro &&  type == "isVaporize")) {
                    let newProps = Object.assign({}, attackProps);
        
                    // 元素反応なし
                    let dmg1 = super.calculate(dmgScale, newProps);

                    // 元素反応あり
                    newProps[type] = true;
                    let dmg2 = super.calculate(dmgScale, newProps);

                    let txtReact = (type == "isVaporize") ? "蒸発" : "溶解";
        
                    return Calc.Attacks.expect([1 - prob, prob], [dmg1, dmg2], [`${txtReact}反応なし`, `${txtReact}反応あり`]);
                } else {
                    // 攻撃が炎ではないので，元素反応なし
                    return super.calculate(dmgScale, attackProps);
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    toJS() {
        let obj = super.toJS();
        obj.reactionType = this.reactionType();
        obj.reactionProb = this.reactionProb();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.reactionType(obj.reactionType || "isVaporize");
        this.reactionProb(obj.reactionProb || 0);
    }
}
