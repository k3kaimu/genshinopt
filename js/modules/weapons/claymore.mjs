import * as Calc from '../dmg-calc.mjs';
import * as Base from './base.mjs';
import * as Widget from '../widget.mjs';
import * as Utils from '../utils.mjs';


// 赤角石塵滅砕
export class RedhornStonethresher extends Base.WeaponData
{
    constructor()
    {
        super(
            "redhorn_stonethresher",
            "赤角石塵滅砕",
            5,
            "Claymore",
            542,
            "baseCrtDmg",
            0.882
        );
    }


    newViewModel()
    {
        return new RedhornStonethresherViewModel(this);
    }


    // 予測値
    static defInc = [0.28, 0.35, 0.42, 0.49, 0.56];
    static dmgInc = [0.40, 0.50, 0.60, 0.70, 0.80];
}


// 赤角石塵滅砕
export class RedhornStonethresherViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let data = this.toJS();
        calc.rateDef.value += RedhornStonethresher.defInc[data.rank];

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            redhornData = data;

            increaseDamage(attackProps) {
                let dmg = super.increaseDamage(attackProps);

                if(hasAnyPropertiesWithSameValue(attackProps, {isNormal: true, isCharged: true}))
                    dmg = dmg.add(this.def().mul(RedhornStonethresher.dmgInc[this.redhornData.rank]));

                return dmg;
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new RedhornStonethresher(),
        "Anemo",
        {
            "vm": {
                "parent_id": "redhorn_stonethresher",
                "rank": 0
            },
            "expected": {
                "normal_100": 359.80201800000003,
                "normal_elem_100": 359.80201800000003,
                "skill_100": 310.30749000000003,
                "burst_100": 310.30749000000003
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new RedhornStonethresher().newViewModel()
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);
        calc.rateAtk.value += Number(this.buffStacks()) * Whiteblind.buffInc[this.rank()];
        calc.rateDef.value += Number(this.buffStacks()) * Whiteblind.buffInc[this.rank()];
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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new Whiteblind(),
        "Anemo",
        {
            "vm": {
                "parent_id": "whiteblind",
                "rank": 0,
                "buffStacks": 4
            },
            "expected": {
                "normal_100": 350.5914,
                "normal_elem_100": 350.5914,
                "skill_100": 350.5914,
                "burst_100": 350.5914
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Whiteblind().newViewModel()
    ));
});


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
export class PrototypeArchaicViewModel extends Base.LikePrototypeArchaicViewModel
{
    constructor(parent)
    {
        super(
            parent,
            1,
            20,
            10,
            {isNormal: true, isCharged: true},
            "通常/重撃時追加ダメージ"
        );
    }


    chainedAttackProps(parentAttackProps)
    {
        return {isPhysical: true, isChainable: false};
    }


    chainedAttackScale(parentAttackProps)
    {
        return PrototypeArchaic.additionalScale[this.rank()];
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new PrototypeArchaic(),
        "Anemo",
        {
            "vm": {
                "parent_id": "prototype_archaic",
                "rank": 0,
                "perAttack": 10,
                "useEffect": false
            },
            "expected": {
                "normal_100": 393.29828999999995,
                "normal_elem_100": 393.29828999999995,
                "skill_100": 393.29828999999995,
                "burst_100": 393.29828999999995
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new PrototypeArchaic().newViewModel()
    ));
});


// 螭龍の剣
export class SerpentSpine extends Base.WeaponData
{
    constructor()
    {
        super(
            "serpent_spine",
            "螭龍の剣",
            4,
            "Claymore",
            510,
            "baseCrtRate",
            0.276
        );
    }


    newViewModel()
    {
        return new SerpentSpineViewModel(this);
    }


    static buffInc = [0.06, 0.07, 0.08, 0.09, 0.1];
}


// 螭龍の剣
export class SerpentSpineViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.buffStacks = ko.observable(5);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);
        calc.baseAllDmg.value +=  Number(this.buffStacks()) * SerpentSpine.buffInc[this.rank()];
        return calc;
    }


    getBuffInc() { return SerpentSpine.buffInc[this.rank()]; }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, `ダメージ+${Widget.spanPercentageFix("getBuffInc()", 1)}/スタック`,
                Widget.selectViewHTML("buffStacks", [
                    {value: 0, label: "0スタック"},
                    {value: 1, label: "1スタック"},
                    {value: 2, label: "2スタック"},
                    {value: 3, label: "3スタック"},
                    {value: 4, label: "4スタック"},
                    {value: 5, label: "5スタック"},
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
        new SerpentSpine(),
        "Anemo",
        {
            "vm": {
                "parent_id": "serpent_spine",
                "rank": 0,
                "buffStacks": 5
            },
            "expected": {
                "normal_100": 426.64986000000005,
                "normal_elem_100": 426.64986000000005,
                "skill_100": 426.64986000000005,
                "burst_100": 426.64986000000005
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new SerpentSpine().newViewModel()
    ));
});


// 銜玉の海皇
export class LuxuriousSeaLord extends Base.WeaponData
{
    constructor()
    {
        super(
            "luxurious_sea_lord",
            "銜玉の海皇",
            4,
            "Claymore",
            454,
            "rateAtk",
            0.551
        );
    }


    newViewModel()
    {
        return new LuxuriousSeaLordViewModel(this);
    }


    static effectTable = [
        [0.12, 0.15, 0.18, 0.21, 0.24],
        [1.00, 1.25, 1.50, 1.75, 2.00]
    ];
}


// 銜玉の海皇
export class LuxuriousSeaLordViewModel extends Base.LikePrototypeArchaicViewModel
{
    constructor(parent)
    {
        super(
            parent,
            1,
            20,
            1,
            {isBurst: true},
            "爆発時追加ダメージ"
        );
    }


    chainedAttackProps(parentAttackProps)
    {
        return {isPhysical: true, isChainable: false};
    }


    chainedAttackScale(parentAttackProps)
    {
        return LuxuriousSeaLord.effectTable[1][this.rank()];
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseBurstDmg.value += LuxuriousSeaLord.effectTable[0][this.rank()];

        return calc;
    }

}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new LuxuriousSeaLord(),
        "Anemo",
        {
            "vm": {
                "parent_id": "luxurious_sea_lord",
                "rank": 0,
                "perAttack": 1,
                "useEffect": false
            },
            "expected": {
                "normal_100": 398.2642290000001,
                "normal_elem_100": 398.2642290000001,
                "skill_100": 398.2642290000001,
                "burst_100": 446.0559364800001
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new LuxuriousSeaLord().newViewModel()
    ));
});
