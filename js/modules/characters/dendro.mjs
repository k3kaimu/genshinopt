import * as Base from './base.mjs';


export class DendroCharacterViewModel extends Base.CharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.reactionProb = ko.observable(0);
    }


    viewHTMLList(target){
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "草激化",
                Widget.sliderViewHTML("reactionProb", 0, 1, 0.1,
                    `反応確率：` + Widget.spanPercentage("reactionProb()", 2))
            )
        );

        return dst;
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let prob = Number(this.reactionProb());
        if(prob == 0)
            return calc;

        calc = calc.applyExtension(Klass => class extends Klass {
            modifyAttackInfo(attackInfo) {
                return super.modifyAttackInfo(attackInfo)
                    .map(info => {
                        if("isSpread" in info.props) {
                            // 冪等性を保つために，info.propsにすでにisSpreadが存在するときには
                            // 元素反応の計算をせずにそのまま返す
                            return info;
                        }
                        else if(info.props.isElectro || false)
                        {
                            // 冪等性を保つために，必ず"isSpread": falseも入れる
                            return [
                                new Calc.AttackInfo(info.scale, info.ref, {...info.props, isSpread: false}, info.prob.mul(1 - prob)),
                                new Calc.AttackInfo(info.scale, info.ref, {...info.props, isSpread: true}, info.prob.mul(prob))
                            ];
                        } else {
                            return info;
                        }
                    }).flat(10);
            }
        });

        return calc;
    }


    toJS() {
        let obj = super.toJS();
        obj.reactionProb = this.reactionProb();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.reactionProb(obj.reactionProb ?? 0);
    }
}
