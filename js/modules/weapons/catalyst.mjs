import * as Base from './base.mjs'
import * as Calc from '../dmg-calc.mjs'
import * as Widget from '../widget.mjs'
import * as Utils from '../utils.mjs';


// 浮世の錠
export class MemoryOfDust extends Base.WeaponData
{
    constructor()
    {
        super(
            "memory_of_dust",
            "浮世の錠",
            5,
            "Catalyst",
            608,
            "rateAtk",
            0.496
        );
    }


    newViewModel()
    {
        return new MemoryOfDustViewModel(this);
    }


    static effectTable = [
        [0.20, 0.25, 0.30, 0.35, 0.40], //シールド強化
        [0.04, 0.05, 0.06, 0.07, 0.08]  // 攻撃力%
    ];
}


// 浮世の錠
export class MemoryOfDustViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.isShielded = ko.observable(true);
        this.effectStacks = ko.observable(5);
    }


    rateAtkEffect(numStacks)
    {
        if(this.isShielded()) {
            return MemoryOfDust.effectTable[1][this.rank()] * Number(numStacks) * 2;
        } else {
            return MemoryOfDust.effectTable[1][this.rank()] * Number(numStacks);
        }
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseRateShieldStrength.value += MemoryOfDust.effectTable[0][this.rank()];
        calc.rateAtk.value += this.rateAtkEffect(this.effectStacks());

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "金璋君臨",
                Widget.checkBoxViewHTML("isShielded", "シールド状態")
                +
                Widget.selectViewHTML("effectStacks", [
                    {value: 0, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(0), 0)}`},
                    {value: 1, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(1), 0)}`},
                    {value: 2, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(2), 0)}`},
                    {value: 3, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(3), 0)}`},
                    {value: 4, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(4), 0)}`},
                    {value: 5, label: `攻撃力+${textPercentageFix(this.rateAtkEffect(5), 0)}`},
                ])
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.isShielded = this.isShielded();
        obj.effectStacks = this.effectStacks();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.isShielded(obj.isShielded);
        this.effectStacks(obj.effectStacks);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new MemoryOfDust(),
        "Anemo",
        {
            "vm": {
                "parent_id": "memory_of_dust",
                "rank": 0,
                "isShielded": true,
                "effectStacks": 5
            },
            "expected": {
                "normal_100": 622.187568,
                "normal_elem_100": 622.187568,
                "skill_100": 622.187568,
                "burst_100": 622.187568
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new MemoryOfDust().newViewModel()
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let data = this.toJS();

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #dataWidsith = data;

            atk(attackProps) {
                if(attackProps.isWidsithAtkUp || false)
                    return super.atk(attackProps).add(this.baseAtk.mul( TheWidsith.buffInc[this.#dataWidsith.rank].atk ));
                else
                    return super.atk(attackProps);
            }

            allDmgBuff(attackProps) {
                if(attackProps.isWidsithDmgUp || false)
                    return super.allDmgBuff(attackProps).add(TheWidsith.buffInc[this.#dataWidsith.rank].dmg);
                else
                    return super.allDmgBuff(attackProps);
            }

            mastery(attackProps) {
                if(attackProps.isWidsithMryUp || false)
                    return super.mastery(attackProps).add(TheWidsith.buffInc[this.#dataWidsith.rank].mry);
                else
                    return super.mastery(attackProps);
            }

            modifyAttackInfo(attackInfo)
            {
                return super.modifyAttackInfo(attackInfo).map(info => {
                    if(info.props.isWidsithAtkUp || info.props.isWidsithDmgUp || info.props.isWidsithMryUp || false) {
                        return info;
                    }
    
                    let newprops = [];
    
                    if(this.#dataWidsith.useAtkUp) {
                        newprops.push({...info.props, isWidsithAtkUp: true});
                        // lbls.push('流浪楽章::攻撃力UP');
                    }
    
                    if(this.#dataWidsith.useDmgUp) {
                        newprops.push({...info.props, isWidsithDmgUp: true});
                        // lbls.push('流浪楽章::ダメージバフUP');
                    }
    
                    if(this.#dataWidsith.useMryUp) {
                        newprops.push({...info.props, isWidsithMryUp: true});
                        // lbls.push('流浪楽章::元素熟知UP');
                    }
    
                    if(newprops.length == 0) {
                        return info;
                    }
    
                    let prob = 1.0 / newprops.length;
    
                    return newprops.map(p => new Calc.AttackInfo(info.scale, p, info.prob.mul(prob)));
                }).flat(10);
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
            Widget.buildViewHTML(target, `序曲（バフ選択）`,
                Widget.checkBoxViewHTML("useAtkUp", `攻撃力+${Widget.spanPercentageFix("getBuffInc().atk", 0)}（確率：${Widget.spanPercentageFix("useAtkUp() ? 1/countChecked() : 0", 0)}）`)
                +
                Widget.checkBoxViewHTML("useDmgUp", `ダメージ+${Widget.spanPercentageFix("getBuffInc().dmg", 0)}（確率：${Widget.spanPercentageFix("useDmgUp() ? 1/countChecked() : 0", 0)}）`)
                +
                Widget.checkBoxViewHTML("useMryUp", `元素熟知+${Widget.spanInteger("getBuffInc().mry")}（確率：${Widget.spanPercentageFix("useMryUp() ? 1/countChecked() : 0", 0)}）`)
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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new TheWidsith(),
        "Anemo",
        {
            "vm": {
                "parent_id": "the_widsith",
                "rank": 0,
                "useAtkUp": true,
                "useDmgUp": true,
                "useMryUp": true
            },
            "expected": {
                "normal_100": 394.80456599999997,
                "normal_elem_100": 394.80456599999997,
                "skill_100": 394.80456599999997,
                "burst_100": 394.80456599999997
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new TheWidsith().newViewModel()
    ));
});


// 万国諸海の図譜
export class MappaMare extends Base.WeaponData
{
    constructor()
    {
        super(
            "mappa_mare",
            "万国諸海の図譜",
            4,
            "Catalyst",
            565,
            "baseMastery",
            110
        );
    }


    newViewModel()
    {
        return new MappaMareViewModel(this);
    }


    static buffInc = [0.08, 0.10, 0.12, 0.14, 0.16];
}


// 万国諸海の図譜
export class MappaMareViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.buffStacks = ko.observable(2);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let dmgbuff = MappaMare.buffInc[this.rank()] * Number(this.buffStacks());

        calc.baseAnemoDmg.value += dmgbuff;
        calc.baseGeoDmg.value += dmgbuff;
        calc.baseElectroDmg.value += dmgbuff;
        calc.basePyroDmg.value += dmgbuff;
        calc.baseHydroDmg.value += dmgbuff;
        calc.baseCryoDmg.value += dmgbuff;
        calc.baseDendroDmg.value += dmgbuff;

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        let rank_ = this.rank();
        dst.push(
            Widget.buildViewHTML(target, `注入の巻`,
                Widget.selectViewHTML("buffStacks", [
                    {value: 0, label: `元素ダメージ+${textPercentageFix(MappaMare.buffInc[rank_] * 0, 0)}`},
                    {value: 1, label: `元素ダメージ+${textPercentageFix(MappaMare.buffInc[rank_] * 1, 0)}`},
                    {value: 2, label: `元素ダメージ+${textPercentageFix(MappaMare.buffInc[rank_] * 2, 0)}`},
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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new MappaMare(),
        "Anemo",
        {
            "vm": {
                "parent_id": "mappa_mare",
                "rank": 0,
                "buffStacks": 2
            },
            "expected": {
                "normal_100": 308.2275,
                "normal_elem_100": 357.5439,
                "skill_100": 357.5439,
                "burst_100": 357.5439
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new MappaMare().newViewModel()
    ));
});
