import * as Calc from '../dmg-calc.mjs';
import * as Widget from '../widget.mjs';
import * as Utils from '../utils.mjs';


export class WeaponData
{
    constructor(id, name, rarity, weaponType, bAtk, bBonusType, bBonusValue) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;

        /*
        Sword, Claymore, Polearm, Catalyst, Bow
        */
        this.weaponType = weaponType;

        this.baseAtk = bAtk;
        this.rateAtk = 0;
        this.baseDef = 0;
        this.rateDef = 0;
        this.baseHP = 0;
        this.rateHP = 0;

        this.baseCrtRate = 0;
        this.baseCrtDmg = 0;

        this.baseAnemoDmg = 0;
        this.baseGeoDmg = 0;
        this.baseElectroDmg = 0;
        this.basePyroDmg = 0;
        this.baseHydroDmg = 0;
        this.baseCryoDmg = 0;
        this.baseDendroDmg = 0;
        this.basePhysicalDmg = 0;

        this.baseRecharge = 0;
        this.baseMastery = 0;

        this[bBonusType] += bBonusValue;
    }


    newViewModel()
    {
        return new WeaponViewModel(this);
    }
}


export class WeaponViewModel
{
    constructor(data)
    {
        this.parent = data;
        this.rank = ko.observable(0);
    }


    applyDmgCalc(calc)
    {
        Calc.VGData.pushContext('Weapon');
        calc = this.applyDmgCalcImpl(calc);
        Calc.VGData.popContext();
        return calc;
    }


    applyDmgCalcImpl(calc)
    {
        calc.weapon = this.parent;

        calc.baseAtk.value += this.parent.baseAtk;
        calc.rateAtk.value += this.parent.rateAtk;
        calc.baseDef.value += this.parent.baseDef;
        calc.rateDef.value += this.parent.rateDef;
        calc.baseHP.value += this.parent.baseHP;
        calc.rateHP.value += this.parent.rateHP;

        calc.baseCrtRate.value += this.parent.baseCrtRate;
        calc.baseCrtDmg.value += this.parent.baseCrtDmg;

        calc.baseAnemoDmg.value += this.parent.baseAnemoDmg;
        calc.baseGeoDmg.value += this.parent.baseGeoDmg;
        calc.baseElectroDmg.value += this.parent.baseElectroDmg;
        calc.basePyroDmg.value += this.parent.basePyroDmg;
        calc.baseHydroDmg.value += this.parent.baseHydroDmg;
        calc.baseCryoDmg.value += this.parent.baseCryoDmg;
        calc.baseDendroDmg.value += this.parent.baseDendroDmg;
        calc.basePhysicalDmg.value += this.parent.basePhysicalDmg;

        calc.baseRecharge.value += this.parent.baseRecharge;
        calc.baseMastery.value += this.parent.baseMastery;

        return calc;
    }


    viewHTMLList(target)
    {
        return [];
    }


    toJS() {
        let obj = {};
        obj.parent_id = this.parent.id;
        obj.rank = this.rank();
        return obj;
    }


    fromJS(obj) {
        this.rank(obj.rank);
    }
}



export class WeaponWithChainedAttack extends WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    checkChainedAttack(parentAttackProps)
    {
        return false;
    }


    makeChainedAttackInfo(parentInfo)
    {
        return undefined;
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let vm = this;
        let NewCalc = class extends CalcType {
            chainedAttackInfos(attackInfo) {
                let list = super.chainedAttackInfos(attackInfo);

                if(vm.checkChainedAttack(attackInfo.props)) {
                    list.push(vm.makeChainedAttackInfo(attackInfo));
                }

                return list;
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }
}


export class LikePrototypeArchaicViewModel extends WeaponWithChainedAttack
{
    constructor(parent, min, max, init, condProps, sliderHTMLTitle)
    {
        super(parent);
        this.useEffect = ko.observable(false);
        this.perAttack = ko.observable(init);
        this.minPerAttack = min;
        this.maxPerAttack = max;
        this.condProps = condProps;
        this.sliderHTMLTitle = sliderHTMLTitle;
    }


    chainedAttackProps(parentAttackProps)
    {
        return {};
    }


    chainedAttackScale(parentAttackProps)
    {
        return 0;
    }


    checkChainedAttack(attackProps)
    {
        return this.useEffect() && hasAnyPropertiesWithSameValue(attackProps, this.condProps);
    }


    makeChainedAttackInfo(attackInfo)
    {
        let newProps = shallowDup(attackInfo.props);
        // 元々の攻撃の属性や攻撃種類を削除する
        newProps = Calc.deleteAllElementFromAttackProps(newProps);
        newProps = Calc.deleteAllAttackTypeFromAttackProps(newProps);

        newProps = Object.assign(newProps, this.chainedAttackProps(attackInfo.props));
        let scale = this.chainedAttackScale(attackInfo.props);
        return new Calc.AttackInfo(scale, "atk", newProps, attackInfo.prob.div(Number(this.perAttack())));
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, this.sliderHTMLTitle,
                Widget.checkBoxViewHTML("useEffect",
                    `${Widget.spanText("perAttack()")}回に1回追加ダメージ`)
                +
                Widget.sliderViewHTML("perAttack", this.minPerAttack, this.maxPerAttack, 1, `発生頻度`, {disable: "!useEffect()"})
            )
        );

        return dst;
    }


    toJS() {
        let obj = super.toJS();
        obj.perAttack = this.perAttack();
        obj.useEffect = this.useEffect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.perAttack(obj.perAttack);
        this.useEffect(obj.useEffect);
    }
}


// テスト用武器
export class TestWeapon extends WeaponData
{
    constructor(type)
    {
        super(
            "test_weapon",
            "テスト用武器",
            1,
            type,
            200,
            "baseCrtRate",
            0.100
        );
    }
}


/**
 * 武器の基礎攻撃力を線形補間して計算するためのクラス
 */
class WeaponBaseATK
{
    /**
     * Lv90時の基礎攻撃力から，各レベルの攻撃力を計算します．
     * 星2と星1武器はレベル90の基礎攻撃力の代わりにレベル70時点の値を指定します．
     * @param {number} rarity 
     * @param {number} baseATKLv90 
     */
    constructor(rarity, baseATKLv90)
    {
        this.levelBaseATKTable = null;
        this.rankBaseATKTable = null;

        if(rarity == 5)
        {
            this.rankBaseATKTable = [0, 31.1, 62.2, 93.4, 124.5, 155.6, 186.7];

            switch(baseATKLv90) {
                case 741:
                    this.levelBaseATKTable = [49, 145, 286, 374, 464, 555, 648, 741];
                    break;
                case 674:
                    this.levelBaseATKTable = [48, 133, 261, 341, 423, 506, 590, 674];
                    break;
                case 608:
                    this.levelBaseATKTable = [46, 122, 235, 308, 382, 457, 532, 608];
                    break;
                case 542:
                    this.levelBaseATKTable = [44, 110, 210, 275, 341, 408, 475, 542];
                    break;
                default:
                    console.assert(false, `Illegal baseATKLv90=${baseATKLv90}`);
            }
        }
        else if(rarity == 4)
        {
            this.rankBaseATKTable = [0, 25.9, 51.9, 77.8, 103.7, 129.7, 155.6];

            switch(baseATKLv90) {
                case 620:
                    this.levelBaseATKTable = [45, 128, 247, 321, 395, 470, 545, 620];
                    break;
                case 565:
                    this.levelBaseATKTable = [44, 119, 226, 293, 361, 429, 497, 565];
                    break;
                case 510:
                    this.levelBaseATKTable = [42, 109, 205, 266, 327, 388, 449, 510];
                    break;
                case 454:
                    this.levelBaseATKTable = [41, 99, 184, 238, 293, 347, 401, 454];
                    break;
                case 440:
                    this.levelBaseATKTable = [39, 94, 176, 229, 282, 335, 388, 440];
                    break;
                default:
                    console.assert(false, `Illegal baseATKLv90=${baseATKLv90}`);
            }
        }
        else if(rarity == 3)
        {
            this.rankBaseATKTable = [0, 19.5, 38.9, 58.4, 77.8, 97.3, 116.7];

            switch(baseATKLv90){
                case 448:
                    this.levelBaseATKTable = [40, 102, 187, 239, 292, 344, 396, 448];
                    break;
                case 401:
                    this.levelBaseATKTable = [39, 94, 169, 216, 263, 309, 355, 401];
                    break;
                case 354:
                    this.levelBaseATKTable = [38, 86, 151, 193, 234, 274, 314, 354];
                    break;
                default:
                    console.assert(false, `Illegal baseATKLv90=${baseATKLv90}`);
            }
        }
        else if(rarity == 2)
        {
            this.rankBaseATKTable = [0, 11.7, 23.3, 35.0, 46.7];
            this.levelBaseATKTable = [33, 80, 139, 174, 209, 243];
            console.assert(baseATKLv90 === 243, `Illegal baseATKLv90=${baseATKLv90}`);
        }
        else
        {
            this.rankBaseATKTable = [0, 11.7, 23.3, 35.0, 46.7];
            this.levelBaseATKTable = [23, 56, 102, 130, 158, 185];
            console.assert(baseATKLv90 === 185, `Illegal baseATKLv90=${baseATKLv90}`);
        }
    }


    atLv(strLv)
    {
        const levelMap = [1, 20, 40, 50, 60, 70, 80, 90];
        const parsedLv = Utils.parseStrLevel(strLv);
        // 突破rankが r のとき，this.levelBaseATKTable[r] + <突破による増加値> から this.levelBaseATKTable[r+1] を両端に線形補間すればよい

        const start = this.levelBaseATKTable[parsedLv.rank] + (parsedLv.rank == 0 ? 0 : this.rankBaseATKTable[parsedLv.rank] - this.rankBaseATKTable[parsedLv.rank - 1]);
        const end   = this.levelBaseATKTable[parsedLv.rank + 1];

        const startLv   = levelMap[parsedLv.rank];
        const endLv     = levelMap[parsedLv.rank + 1];

        // 傾き
        const scale = (end - start) / (endLv - startLv);

        // 線形補間
        return start + scale * (parsedLv.level - startLv);
    }
}

runUnittest(function(){
    let obj = new WeaponBaseATK(5, 741);
    console.assert(isApproxEqual(obj.atLv("90"), 741, 0.4, 1e-3));
    console.assert(isApproxEqual(obj.atLv("85"), 710, 0.4, 1e-3));
    console.assert(isApproxEqual(obj.atLv("80+"), 679, 0.4, 1e-3));
    console.assert(isApproxEqual(obj.atLv("80"), 648, 0.4, 1e-3));
    console.assert(isApproxEqual(obj.atLv("70+"), 586, 0.4, 1e-3));
    console.assert(isApproxEqual(obj.atLv("70"), 555, 0.4, 1e-3));
});
