import * as Calc from '../dmg-calc.mjs';
import * as Base from './base.mjs';
import * as Widget from '../widget.mjs';
import * as Utils from '../utils.mjs';

// 和璞鳶
export class PrimordialJadeWingedSpear extends Base.WeaponData
{
    constructor()
    {
        super(
            "primordial_jade_winged_spear",
            "和璞鳶",
            5,
            "Polearm",
            674,
            "baseCrtRate",
            0.221
        );
    }


    newViewModel()
    {
        return new PrimordialJadeWingedSpearViewModel(this);
    }


    static effectTable = [
        [0.032, 0.039, 0.046, 0.053, 0.06], //攻撃力%
        [0.12, 0.15, 0.18, 0.21, 0.24]      //ダメバフ
    ]
}


// 和璞鳶
export class PrimordialJadeWingedSpearViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.effectStacks = ko.observable(7);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.rateAtk.value += PrimordialJadeWingedSpear.effectTable[0][this.rank()] * Number(this.effectStacks());
        
        if(Number(this.effectStacks()) == 7) {
            calc.baseAllDmg.value += PrimordialJadeWingedSpear.effectTable[1][this.rank()];
        }

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "正義を貫く鳶の槍",
                Widget.selectViewHTML("effectStacks", [
                    {value: 0, label: `攻撃力+${textPercentageFix(PrimordialJadeWingedSpear.effectTable[0][this.rank()] * 0 , 1)}`},
                    {value: 1, label: `攻撃力+${textPercentageFix(PrimordialJadeWingedSpear.effectTable[0][this.rank()] * 1 , 1)}`},
                    {value: 2, label: `攻撃力+${textPercentageFix(PrimordialJadeWingedSpear.effectTable[0][this.rank()] * 2 , 1)}`},
                    {value: 3, label: `攻撃力+${textPercentageFix(PrimordialJadeWingedSpear.effectTable[0][this.rank()] * 3 , 1)}`},
                    {value: 4, label: `攻撃力+${textPercentageFix(PrimordialJadeWingedSpear.effectTable[0][this.rank()] * 4 , 1)}`},
                    {value: 5, label: `攻撃力+${textPercentageFix(PrimordialJadeWingedSpear.effectTable[0][this.rank()] * 5 , 1)}`},
                    {value: 6, label: `攻撃力+${textPercentageFix(PrimordialJadeWingedSpear.effectTable[0][this.rank()] * 6 , 1)}`},
                    {value: 7, label: `攻撃力+${textPercentageFix(PrimordialJadeWingedSpear.effectTable[0][this.rank()] * 7 , 1)}，ダメージ+${textPercentageFix(PrimordialJadeWingedSpear.effectTable[1][this.rank()], 0)}`},
                ])
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.effectStacks = this.effectStacks();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.effectStacks(obj.effectStacks);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new PrimordialJadeWingedSpear(),
        "Anemo",
        {
            "vm": {
                "parent_id": "primordial_jade_winged_spear",
                "rank": 0,
                "effectStacks": 7
            },
            "expected": {
                "normal_100": 555.1153461504001,
                "normal_elem_100": 555.1153461504001,
                "skill_100": 555.1153461504001,
                "burst_100": 555.1153461504001
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new PrimordialJadeWingedSpear().newViewModel()
    ));
});


// 天空の脊
export class SkywardSpine extends Base.WeaponData
{
    constructor()
    {
        super(
            "skyward_spine",
            "天空の脊",
            5,
            "Polearm",
            674,
            "baseRecharge",
            0.368
        );
    }


    newViewModel()
    {
        return new SkywardSpineViewModel(this);
    }


    static effectTable = [
        [0.08, 0.10, 0.12, 0.14, 0.16], //会心率
        [0.40, 0.55, 0.70, 0.85, 1.00]  //範囲ダメージ
    ];
}


// 天空の脊
export class SkywardSpineViewModel extends Base.LikePrototypeArchaicViewModel
{
    constructor(parent)
    {
        super(
            parent,
            1,
            10,
            4,
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
        return SkywardSpine.effectTable[1][this.rank()];
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseCrtRate.value += SkywardSpine.effectTable[0][this.rank()];

        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new SkywardSpine(),
        "Anemo",
        {
            "vm": {
                "parent_id": "skyward_spine",
                "rank": 0,
                "perAttack": 4,
                "useEffect": false
            },
            "expected": {
                "normal_100": 375.46740000000005,
                "normal_elem_100": 375.46740000000005,
                "skill_100": 375.46740000000005,
                "burst_100": 375.46740000000005
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new SkywardSpine().newViewModel()
    ));
});


// 破天の槍
export class VortexVanquisher extends Base.WeaponData
{
    constructor()
    {
        super(
            "vortex_vanquisher",
            "破天の槍",
            5,
            "Polearm",
            608,
            "rateAtk",
            0.496
        );
    }


    newViewModel()
    {
        return new VortexVanquisherViewModel(this);
    }


    static effectTable = [
        [0.20, 0.25, 0.30, 0.35, 0.40], //シールド強化
        [0.04, 0.05, 0.06, 0.07, 0.08]  // 攻撃力%
    ];
}


// 破天の槍
export class VortexVanquisherViewModel extends Base.WeaponViewModel
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
            return VortexVanquisher.effectTable[1][this.rank()] * Number(numStacks) * 2;
        } else {
            return VortexVanquisher.effectTable[1][this.rank()] * Number(numStacks);
        }
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseRateShieldStrength.value += VortexVanquisher.effectTable[0][this.rank()];
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
        new VortexVanquisher(),
        "Anemo",
        {
            "vm": {
                "parent_id": "vortex_vanquisher",
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
        new VortexVanquisher().newViewModel()
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new StaffOfHoma(),
        "Anemo",
        {
            "vm": {
                "parent_id": "staff_of_homa",
                "rank": 0,
                "selLowHighHP": "lowHP"
            },
            "expected": {
                "normal_100": 442.03698,
                "normal_elem_100": 442.03698,
                "skill_100": 442.03698,
                "burst_100": 442.03698
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new StaffOfHoma().newViewModel()
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new EngulfingLightning(),
        "Anemo",
        {
            "vm": {
                "parent_id": "engulfing_lightning",
                "rank": 0,
                "useEffect": true
            },
            "expected": {
                "normal_100": 406.35148824000004,
                "normal_elem_100": 406.35148824000004,
                "skill_100": 406.35148824000004,
                "burst_100": 406.35148824000004
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new EngulfingLightning().newViewModel()
    ));
});


// 息災
export class CalamityQueller extends Base.WeaponData
{
    constructor()
    {
        super(
            "calamity_queller",
            "息災",
            5,
            "Polearm",
            741,
            "rateAtk",
            0.165
        );
    }


    newViewModel()
    {
        return new CalamityQuellerViewModel(this);
    }


    static effectTable = {
        dmg: [0.12, 0.15, 0.18, 0.21, 0.24],
        atk: [0.032, 0.040, 0.048, 0.056, 0.064]
    };
}


// 息災
export class CalamityQuellerViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.numOfStacks = ko.observable(6);
        this.isBack = ko.observable(false);
    }


    incRateAtk(numStacks)
    {
        let v = CalamityQueller.effectTable.atk[this.rank()] * Number(numStacks);

        if(this.isBack())
            return v * 2;
        else
            return v;
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.rateAtk.value += this.incRateAtk(this.numOfStacks());

        calc.baseAnemoDmg.value += CalamityQueller.effectTable.dmg[this.rank()];
        calc.baseGeoDmg.value += CalamityQueller.effectTable.dmg[this.rank()];
        calc.baseElectroDmg.value += CalamityQueller.effectTable.dmg[this.rank()];
        calc.basePyroDmg.value += CalamityQueller.effectTable.dmg[this.rank()];
        calc.baseHydroDmg.value += CalamityQueller.effectTable.dmg[this.rank()];
        calc.baseCryoDmg.value += CalamityQueller.effectTable.dmg[this.rank()];
        calc.baseDendroDmg.value += CalamityQueller.effectTable.dmg[this.rank()];

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "滅却の戒法",
                Widget.selectViewHTML("numOfStacks",
                    new Array(7).fill(0).map((e, i) => {return {value: i, label: `攻撃力+${textPercentageFix(this.incRateAtk(i), 1)}（${textInteger(i)}秒後）`};}))
                +
                Widget.checkBoxViewHTML("isBack", "攻撃力アップ効果2倍（待機中）")
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.numOfStacks = this.numOfStacks();
        obj.isBack = this.isBack();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.numOfStacks(obj.numOfStacks);
        this.isBack(obj.isBack);
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new CalamityQueller(),
        "Anemo",
        {
            "vm": {
                "parent_id": "calamity_queller",
                "rank": 0,
                "numOfStacks": 6,
                "isBack": false
            },
            "expected": {
                "normal_100": 528.9633495,
                "normal_elem_100": 592.4389514400001,
                "skill_100": 592.4389514400001,
                "burst_100": 592.4389514400001
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new CalamityQueller().newViewModel()
    ));
});




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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new FavoniusLance(),
        "Anemo",
        {
            "vm": {
                "parent_id": "favonius_lance",
                "rank": 0
            },
            "expected": {
                "normal_100": 308.2275,
                "normal_elem_100": 308.2275,
                "skill_100": 308.2275,
                "burst_100": 308.2275
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new FavoniusLance().newViewModel()
    ));
});


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


// 匣中滅龍
export class DragonsBaneViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useEffect = ko.observable(true);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new DragonsBane(),
        "Anemo",
        {
            "vm": {
                "parent_id": "dragons_bane",
                "rank": 0,
                "useEffect": true
            },
            "expected": {
                "normal_100": 308.13480000000004,
                "normal_elem_100": 308.13480000000004,
                "skill_100": 308.13480000000004,
                "burst_100": 308.13480000000004
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new DragonsBane().newViewModel()
    ));
});


// 千岩長槍
export class LithicSpear extends Base.WeaponData
{
    constructor()
    {
        super(
            "lithic_spear",
            "千岩長槍",
            4,
            "Polearm",
            565,
            "rateAtk",
            0.276
        );
    }


    newViewModel()
    {
        return new LithicSpearViewModel(this);
    }


    static effectTable = [
        [0.07, 0.08, 0.09, 0.10, 0.11],
        [0.03, 0.04, 0.05, 0.06, 0.07]
    ];
}


// 千岩長槍
export class LithicSpearViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.buffStacks = ko.observable(2);
    }


    buffEffect(numStacks)
    {
        numStacks = Number(numStacks);
        return [
            LithicSpear.effectTable[0][this.rank()] * numStacks,
            LithicSpear.effectTable[1][this.rank()] * numStacks
        ];
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let eff = this.buffEffect(this.buffStacks());
        calc.rateAtk.value += eff[0];
        calc.baseCrtRate.value += eff[1];

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(Widget.buildViewHTML(target, "千岩訣・同心",
            Widget.selectViewHTML("buffStacks", [
                {value: 0, label: `攻撃力+${textPercentageFix(this.buffEffect(0)[0], 0)}，会心率+${textPercentageFix(this.buffEffect(0)[1], 0)}`},
                {value: 1, label: `攻撃力+${textPercentageFix(this.buffEffect(1)[0], 0)}，会心率+${textPercentageFix(this.buffEffect(1)[1], 0)}`},
                {value: 2, label: `攻撃力+${textPercentageFix(this.buffEffect(2)[0], 0)}，会心率+${textPercentageFix(this.buffEffect(2)[1], 0)}`},
                {value: 3, label: `攻撃力+${textPercentageFix(this.buffEffect(3)[0], 0)}，会心率+${textPercentageFix(this.buffEffect(3)[1], 0)}`},
                {value: 4, label: `攻撃力+${textPercentageFix(this.buffEffect(4)[0], 0)}，会心率+${textPercentageFix(this.buffEffect(4)[1], 0)}`},
            ])
        ));

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
        new LithicSpear(),
        "Anemo",
        {
            "vm": {
                "parent_id": "lithic_spear",
                "rank": 0,
                "buffStacks": 2
            },
            "expected": {
                "normal_100": 451.70470800000004,
                "normal_elem_100": 451.70470800000004,
                "skill_100": 451.70470800000004,
                "burst_100": 451.70470800000004
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new LithicSpear().newViewModel()
    ));
});


// 旧貴族猟槍
export class RoyalSpear extends Base.WeaponData
{
    constructor()
    {
        super(
            "royal_spear",
            "旧貴族猟槍",
            4,
            "Polearm",
            565,
            "rateAtk",
            0.276
        );
    }


    newViewModel()
    {
        return new RoyalSpearViewModel(this);
    }


    static effectTable = [0.08, 0.10, 0.12, 0.14, 0.16];
}


// 旧貴族猟槍
export class RoyalSpearViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.selType = ko.observable("effective");  // effective | constant
        this.buffStacks = ko.observable(1);         // for this.selType() == "constant"
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.selType() == "constant") {
            calc.baseCrtRate.value += this.crtIncrease(this.buffStacks());
        } else {
            let incP = RoyalSpear.effectTable[this.rank()];

            let CalcType = Object.getPrototypeOf(calc).constructor;
            let NewCalc = class extends CalcType {
                #incRoyal = incP;

                crtRate(attackProps)
                {
                    if(hasAnyProperties(attackProps, ["incCrtRateRoyalSpear"])) {
                        return super.crtRate(attackProps).add(attackProps.incCrtRateRoyalSpear);
                    } else {
                        return super.crtRate(attackProps);
                    }
                }
    
                calculate(dmgScale, attackProps)
                {
                    if(!hasAnyProperties(attackProps, ["incCrtRateRoyalSpear"])) {
                        attackProps = {...attackProps};
                        const cr = this.crtRate(attackProps).value;
                        attackProps.incCrtRateRoyalSpear = Calc.royalCriticalRate(cr, this.#incRoyal) - cr;
                    }

                    return super.calculate(dmgScale, attackProps);
                }
            };
    
            calc = Object.assign(new NewCalc(), calc);
        }

        return calc;
    }


    crtIncrease(numStacks)
    {
        return RoyalSpear.effectTable[this.rank()] * Number(numStacks);
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(Widget.buildViewHTML(target, "集中",
            Widget.radioViewHTML("selType", [
                {value: "effective", label: "実質的な会心率の上昇量を利用"},
                {value: "constant", label: "固定の会心率の上昇量を利用"},
            ])
            +
            Widget.selectViewHTML("buffStacks", [
                {value: 0, label: `会心率+${textPercentageFix(this.crtIncrease(0), 0)}`},
                {value: 1, label: `会心率+${textPercentageFix(this.crtIncrease(1), 0)}`},
                {value: 2, label: `会心率+${textPercentageFix(this.crtIncrease(2), 0)}`},
                {value: 3, label: `会心率+${textPercentageFix(this.crtIncrease(3), 0)}`},
                {value: 4, label: `会心率+${textPercentageFix(this.crtIncrease(4), 0)}`},
                {value: 5, label: `会心率+${textPercentageFix(this.crtIncrease(5), 0)}`},
            ], undefined, {visible: "selType() == 'constant'"})
        ));

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.selType = this.selType();
        obj.buffStacks = this.buffStacks();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.selType(obj.selType);
        this.buffStacks(obj.buffStacks);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new RoyalSpear(),
        "Anemo",
        {
            "vm": {
                "parent_id": "royal_spear",
                "rank": 0,
                "selType": "effective",
                "buffStacks": 1
            },
            "expected": {
                "normal_100": 432.28420916129016,
                "normal_elem_100": 432.28420916129016,
                "skill_100": 432.28420916129016,
                "burst_100": 432.28420916129016
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new RoyalSpear().newViewModel()
    ));
});


// 黒岩の突槍
export class BlackcliffPole extends Base.WeaponData
{
    constructor()
    {
        super(
            "blackcliff_pole",
            "黒岩の突槍",
            4,
            "Polearm",
            510,
            "baseCrtDmg",
            0.551
        );
    }


    newViewModel()
    {
        return new BlackcliffPoleViewModel(this);
    }


    static effectTable = [0.12, 0.15, 0.18, 0.21, 0.24];
}


// 黒岩の突槍
export class BlackcliffPoleViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.effectStacks = ko.observable(3);
    }


    incRateAtk(numStacks)
    {
        return Number(numStacks) * BlackcliffPole.effectTable[this.rank()];
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.rateAtk.value += this.incRateAtk(this.effectStacks());

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "勝ちに乗じる",
                Widget.selectViewHTML("effectStacks", [
                    {value: 0, label: `攻撃力+${textPercentageFix(this.incRateAtk(0), 0)}`},
                    {value: 1, label: `攻撃力+${textPercentageFix(this.incRateAtk(1), 0)}`},
                    {value: 2, label: `攻撃力+${textPercentageFix(this.incRateAtk(2), 0)}`},
                    {value: 3, label: `攻撃力+${textPercentageFix(this.incRateAtk(3), 0)}`}
                ])
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.effectStacks = this.effectStacks();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.effectStacks(obj.effectStacks);
    }

}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new BlackcliffPole(),
        "Anemo",
        {
            "vm": {
                "parent_id": "blackcliff_pole",
                "rank": 0,
                "effectStacks": 3
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
        new BlackcliffPole().newViewModel()
    ));
});


// 星鎌・試作
export class PrototypeStarglitter extends Base.WeaponData
{
    constructor()
    {
        super(
            "prototype_starglitter",
            "星鎌・試作",
            4,
            "Polearm",
            510,
            "baseRecharge",
            0.459
        );
    }


    newViewModel()
    {
        return new PrototypeStarglitterViewModel(this);
    }


    static effectTable = [0.08, 0.10, 0.12, 0.14, 0.16];
}


// 星鎌・試作
export class PrototypeStarglitterViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.effectStacks = ko.observable(1);
    }


    incDmg(numStacks)
    {
        return Number(numStacks) * PrototypeStarglitter.effectTable[this.rank()];
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseNormalDmg.value += this.incDmg(this.effectStacks());
        calc.baseChargedDmg.value += this.incDmg(this.effectStacks());

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "魔力親和",
                Widget.selectViewHTML("effectStacks", [
                    {value: 0, label: `通常攻撃/重撃+${textPercentageFix(this.incDmg(0), 0)}`},
                    {value: 1, label: `通常攻撃/重撃+${textPercentageFix(this.incDmg(1), 0)}`},
                    {value: 2, label: `通常攻撃/重撃+${textPercentageFix(this.incDmg(2), 0)}`},
                ])
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.effectStacks = this.effectStacks();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.effectStacks(obj.effectStacks);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new PrototypeStarglitter(),
        "Anemo",
        {
            "vm": {
                "parent_id": "prototype_starglitter",
                "rank": 0,
                "effectStacks": 1
            },
            "expected": {
                "normal_100": 305.35380000000004,
                "normal_elem_100": 305.35380000000004,
                "skill_100": 282.735,
                "burst_100": 282.735
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new PrototypeStarglitter().newViewModel()
    ));
});


// 流月の針
export class CrescentPike extends Base.WeaponData
{
    constructor()
    {
        super(
            "crescent_pike",
            "流月の針",
            4,
            "Polearm",
            565,
            "basePhysicalDmg",
            0.345
        );
    }


    newViewModel()
    {
        return new CrescentPikeViewModel(this);
    }


    static effectTable = [0.2, 0.25, 0.3, 0.35, 0.4];
}


// 流月の針
export class CrescentPikeViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useEffect = ko.observable(false);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(! this.useEffect())
            return calc;

        let data = this.toJS();
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #dCrescentPike = data;

            chainedAttackDmg(attackProps) {
                let superValue = super.chainedAttackDmg(attackProps);

                if(hasAnyPropertiesWithSameValue(attackProps, {isNormal: true, isCharged: true})) {
                    let newProps = shallowDup(attackProps);
                    // 元々の攻撃の属性や攻撃種類を削除する
                    newProps = Calc.deleteAllElementFromAttackProps(newProps);
                    newProps = Calc.deleteAllAttackTypeFromAttackProps(newProps);

                    newProps.isPhysical = true;   // 物理攻撃
                    newProps.isChainable = false; // この攻撃では追撃は発生しない
                    return superValue.add(super.calculateNormalDmg(CrescentPike.effectTable[this.#dCrescentPike.rank], newProps));
                } else {
                    // 通常攻撃でも重撃でもないので，追撃は発生しない
                    return superValue;
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "注入の針",
                Widget.checkBoxViewHTML("useEffect", `通常/重撃時に${textPercentageFix(CrescentPike.effectTable[this.rank()], 0)}物理ダメージ`)
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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new CrescentPike(),
        "Anemo",
        {
            "vm": {
                "parent_id": "crescent_pike",
                "rank": 0,
                "useEffect": false
            },
            "expected": {
                "normal_100": 414.5659875,
                "normal_elem_100": 308.2275,
                "skill_100": 308.2275,
                "burst_100": 308.2275
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new CrescentPike().newViewModel()
    ));
});


// 死闘の槍
export class Deathmatch extends Base.WeaponData
{
    constructor()
    {
        super(
            "deathmatch",
            "死闘の槍",
            4,
            "Polearm",
            454,
            "baseCrtRate",
            0.368
        );
    }


    newViewModel()
    {
        return new DeathmatchViewModel(this);
    }


    static effectTable = [
        [0.16, 0.20, 0.24, 0.28, 0.32], // 2人以上
        [0.24, 0.30, 0.36, 0.42, 0.48], // 2人未満
    ];
}


// 死闘の槍
export class DeathmatchViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.isTwoOrHigh = ko.observable(0);    // true = 1, false = 0
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.isTwoOrHigh() == 1) {
            calc.rateAtk.value += Deathmatch.effectTable[0][this.rank()];
            calc.rateDef.value += Deathmatch.effectTable[0][this.rank()];
        } else {
            calc.rateAtk.value += Deathmatch.effectTable[1][this.rank()];
        }

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "剣闘士",
                Widget.selectViewHTML("isTwoOrHigh", [
                    {value: 1, label: `攻撃力/防御力+${textPercentageFix(Deathmatch.effectTable[0][this.rank()], 0)}`},
                    {value: 0, label: `攻撃力+${textPercentageFix(Deathmatch.effectTable[1][this.rank()], 0) }`},
                ])
            ));

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.isTwoOrHigh = this.isTwoOrHigh();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.isTwoOrHigh(obj.isTwoOrHigh);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new Deathmatch(),
        "Anemo",
        {
            "vm": {
                "parent_id": "deathmatch",
                "rank": 0,
                "isTwoOrHigh": 0
            },
            "expected": {
                "normal_100": 386.66230559999997,
                "normal_elem_100": 386.66230559999997,
                "skill_100": 386.66230559999997,
                "burst_100": 386.66230559999997
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Deathmatch().newViewModel()
    ));
});


// ドラゴンスピア
export class DragonspineSpear extends Base.WeaponData
{
    constructor()
    {
        super(
            "dragonspine_spear",
            "ドラゴンスピア",
            4,
            "Polearm",
            454,
            "basePhysicalDmg",
            0.69
        );
    }


    newViewModel()
    {
        return new DragonspineSpearViewModel(this);
    }


    static effectTable = [
        [0.80, 0.95, 1.10, 1.25, 1.40],
        [2.00, 2.40, 2.80, 3.20, 3.60]
    ];
}


// ドラゴンスピア
export class DragonspineSpearViewModel extends Base.WeaponWithChainedAttack
{
    constructor(parent)
    {
        super(parent);
        this.useEffect = ko.observable(false);
        this.perAttack = ko.observable(20);
        this.isCryo = ko.observable(false);
    }


    checkChainedAttack(attackProps)
    {
        return this.useEffect() && hasAnyPropertiesWithSameValue(attackProps, {isNormal: true, isCharged: true});
    }


    calcChainedAttackDmg(calc, attackProps)
    {
        let newProps = shallowDup(attackProps);
        // 元々の攻撃の属性や攻撃種類を削除する
        newProps = Calc.deleteAllElementFromAttackProps(newProps);
        newProps = Calc.deleteAllAttackTypeFromAttackProps(newProps);

        newProps.isPhysical = true;
        newProps.isChainable = false;

        let scale = this.addAttackScale();
        return calc.calculateNormalDmg(scale, newProps).div(Number(this.perAttack()));
    }


    addAttackScale()
    {
        if(this.isCryo()) {
            return DragonspineSpear.effectTable[1][this.rank()];
        } else {
            return DragonspineSpear.effectTable[0][this.rank()];
        }
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "通常/重撃時追加ダメージ",
                Widget.checkBoxViewHTML("useEffect",
                    `通常/重撃の${Widget.spanText("perAttack()")}回に1回${textPercentageFix(this.addAttackScale(), 0)}物理ダメージ`)
                +
                Widget.checkBoxViewHTML("isCryo", "敵：氷元素の付着中", {disable: "!useEffect()"})
                +
                Widget.sliderViewHTML("perAttack", 1, 20, 1, `発生頻度`, {disable: "!useEffect()"})
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.perAttack = this.perAttack();
        obj.useEffect = this.useEffect();
        obj.isCryo = this.isCryo();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.perAttack(obj.perAttack);
        this.useEffect(obj.useEffect);
        this.isCryo(obj.isCryo);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new DragonspineSpear(),
        "Anemo",
        {
            "vm": {
                "parent_id": "dragonspine_spear",
                "rank": 0,
                "perAttack": 20,
                "useEffect": false,
                "isCryo": false
            },
            "expected": {
                "normal_100": 433.95651000000004,
                "normal_elem_100": 256.779,
                "skill_100": 256.779,
                "burst_100": 256.779
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new DragonspineSpear().newViewModel()
    ));
});


// 喜多院十文字槍
export class KitainCrossSpear extends Base.WeaponData
{
    // TODO: 元素エネルギー回復効果は未実装
    constructor()
    {
        super(
            "kitain_cross_spear",
            "喜多院十文字槍",
            4,
            "Polearm",
            565,
            "baseMastery",
            110
        );
    }


    newViewModel()
    {
        return new KitainCrossSpearViewModel(this);
    }


    static effectTable = [0.06, 0.075, 0.09, 0.105, 0.12];
}


// 喜多院十文字槍
export class KitainCrossSpearViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseSkillDmg.value += KitainCrossSpear.effectTable[this.rank()];

        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new KitainCrossSpear(),
        "Anemo",
        {
            "vm": {
                "parent_id": "kitain_cross_spear",
                "rank": 0
            },
            "expected": {
                "normal_100": 308.2275,
                "normal_elem_100": 308.2275,
                "skill_100": 326.7211500000001,
                "burst_100": 308.2275
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new KitainCrossSpear().newViewModel()
    ));
});


// 斬波のひれ長
export class WavebreakersFin extends Base.WeaponData
{
    constructor()
    {
        super(
            "wavebreakers_fin",
            "斬波のひれ長",
            4,
            "Polearm",
            620,
            "rateAtk",
            0.138
        );
    }


    newViewModel()
    {
        return new WavebreakersFinViewModel(this);
    }


    static effectTable = [
        [0.0012, 0.0015, 0.0018, 0.0021, 0.0024],
        [0.40, 0.50, 0.60, 0.70, 0.80]
    ];
}


// 斬波のひれ長
export class WavebreakersFinViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.totalBurstEnergy = ko.observable(320);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let rank_ = this.rank();

        calc.baseBurstDmg.value += Math.min(
            Number(this.totalBurstEnergy()) * WavebreakersFin.effectTable[0][rank_],
            WavebreakersFin.effectTable[1][rank_]
        );

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "波を統べる海祇の民",
                `チームの累計元素爆発エネルギー：` + Widget.spanInteger("totalBurstEnergy()")
                +
                Widget.sliderViewHTML("totalBurstEnergy", 120, 330, 10, undefined)
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.totalBurstEnergy = this.totalBurstEnergy();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.totalBurstEnergy(obj.totalBurstEnergy);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new WavebreakersFin(),
        "Anemo",
        {
            "vm": {
                "parent_id": "wavebreakers_fin",
                "rank": 0,
                "totalBurstEnergy": 320
            },
            "expected": {
                "normal_100": 379.77335999999997,
                "normal_elem_100": 379.77335999999997,
                "skill_100": 379.77335999999997,
                "burst_100": 525.6063302399999
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new WavebreakersFin().newViewModel()
    ));
});


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


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new TheCatch(),
        "Anemo",
        {
            "vm": {
                "parent_id": "the_catch",
                "rank": 0
            },
            "expected": {
                "normal_100": 282.735,
                "normal_elem_100": 282.735,
                "skill_100": 282.735,
                "burst_100": 339.43571999999995
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new TheCatch().newViewModel()
    ));
});


// 黒纓槍
export class BlackTassel extends Base.WeaponData
{
    constructor()
    {
        super(
            "black_tassel",
            "黒纓槍",
            3,
            "Polearm",
            354,
            "rateHP",
            0.469
        );
    }


    newViewModel()
    {
        return new BlackTasselViewModel(this);
    }


    static effectTable = [0.40, 0.50, 0.60, 0.70, 0.80];
}


// 黒纓槍
export class BlackTasselViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useEffect = ko.observable(false);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useEffect()) {
            calc.baseAllDmg.value += BlackTassel.effectTable[this.rank()];
        }

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "スライム殺し",
                Widget.checkBoxViewHTML("useEffect", `ダメージ+${textPercentageFix(BlackTassel.effectTable[this.rank()], 0)}`)
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

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new BlackTassel(),
        "Anemo",
        {
            "vm": {
                "parent_id": "black_tassel",
                "rank": 0,
                "useEffect": false
            },
            "expected": {
                "normal_100": 210.429,
                "normal_elem_100": 210.429,
                "skill_100": 210.429,
                "burst_100": 210.429
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new BlackTassel().newViewModel()
    ));
});


// 鉾槍
export class Halberd extends Base.WeaponData
{
    constructor()
    {
        super(
            "halberd",
            "鉾槍",
            3,
            "Polearm",
            447,
            "rateAtk",
            0.234
        );
    }


    newViewModel()
    {
        return new HalberdViewModel(this);
    }


    static effectTable = [1.60, 2.00, 2.40, 2.80, 3.20];
}


// 鉾槍
export class HalberdViewModel extends Base.LikePrototypeArchaicViewModel
{
    constructor(parent)
    {
        super(
            parent,
            1,
            20,
            20,
            {isNormal: true},
            "通常攻撃時追加ダメージ"
        );
    }


    chainedAttackProps(parentAttackProps)
    {
        return {isPhysical: true, isChainable: false};
    }


    chainedAttackScale(parentAttackProps)
    {
        return Halberd.effectTable[this.rank()];
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new Halberd(),
        "Anemo",
        {
            "vm": {
                "parent_id": "halberd",
                "rank": 0,
                "perAttack": 20,
                "useEffect": false
            },
            "expected": {
                "normal_100": 312.861573,
                "normal_elem_100": 312.861573,
                "skill_100": 312.861573,
                "burst_100": 312.861573
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Halberd().newViewModel()
    ));
});


// 白纓槍
export class WhiteTassel extends Base.WeaponData
{
    constructor()
    {
        super(
            "white_tassel",
            "白纓槍",
            3,
            "Polearm",
            401,
            "baseCrtRate",
            0.234
        );
    }


    newViewModel()
    {
        return new WhiteTasselViewModel(this);
    }


    static effectTable = [0.24, 0.30, 0.36, 0.42, 0.48];
}


// 白纓槍
export class WhiteTasselViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.baseNormalDmg.value += WhiteTassel.effectTable[this.rank()];

        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new WhiteTassel(),
        "Anemo",
        {
            "vm": {
                "parent_id": "white_tassel",
                "rank": 0
            },
            "expected": {
                "normal_100": 327.1946832,
                "normal_elem_100": 327.1946832,
                "skill_100": 263.86668000000003,
                "burst_100": 263.86668000000003
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new WhiteTassel().newViewModel()
    ));
});
