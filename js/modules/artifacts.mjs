
export class ArtifactData
{
    constructor(id, name, abbr)
    {
        this.id = id;
        this.name = name;
        this.abbr = abbr;
    }


    newViewModel()
    {
        return new ArtifactViewModel(this);
    }
}


export class ArtifactViewModel
{
    // bonusType: '2' or '4'
    constructor(data, bonusType)
    {
        this.parent = data;
        this.bonusType = bonusType;
    }


    applyDmgCalc(calc)
    {
        return calc;
    }


    viewHTMLList(target)
    {
        return [];
    }


    toJS() {
        return {
            parent_id: this.parent.id, 
            bonusType: this.bonusType
        };
    }


    fromJS(obj) {
        this.bonusType = obj.bonusType;
    }
}


// 剣闘士のフィナーレ
export class GladiatorsFinale extends ArtifactData
{
    constructor()
    {
        super(
            "gladiators_finale",
            "剣闘士のフィナーレ",
            "剣闘士",
        )
    }

    newViewModel(bonusType)
    {
        return new GladiatorsFinaleViewModel(this, bonusType);
    }
}


// 剣闘士のフィナーレ, ViewModel
export class GladiatorsFinaleViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.rateAtk.value += 0.18;

        if(this.bonusType == 2)
            return calc;

        // when bonusType == 4 as follows:
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalcGladiatorsFinale = class extends CalcType {
            normalDmgBuff() {
                if(this.character.weaponType == 'Sword'
                || this.character.weaponType == 'Claymore'
                || this.character.weaponType == 'Polearm') {
                    return super.normalDmgBuff().add(0.35);
                } else {
                    return super.normalDmgBuff();
                }
            }
        }

        calc = Object.assign(new NewCalcGladiatorsFinale(), calc);
        return calc;
    }
}


// 大地を流浪する楽団
export class WanderersTroupe extends ArtifactData
{
    constructor()
    {
        super(
            "wanderers_troupe",
            "大地を流浪する楽団",
            "楽団",
        )
    }

    newViewModel(bonusType)
    {
        return new WanderersTroupeViewModel(this, bonusType);
    }
}


// 大地を流浪する楽団, ViewModel
export class WanderersTroupeViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.baseMastery.value += 80;

        if(this.bonusType == 2)
            return calc;

        // when bonusType == 4 as follows:
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalcWanderersTroupe = class extends CalcType {
            chargedDmgBuff() {
                if(this.character.weaponType == 'Catalyst'
                || this.character.weaponType == 'Bow') {
                    return super.chargedDmgBuff().add(0.35);
                } else {
                    return super.chargedDmgBuff();
                }
            }
        }

        calc = Object.assign(new NewCalcWanderersTroupe(), calc);
        return calc;
    }
}


// 燃え盛る炎の魔女
export class CrimsonWitchOfFlames extends ArtifactData
{
    constructor()
    {
        super(
            'crimson_witch_of_flames',
            "燃え盛る炎の魔女",
            "火魔女",
        );
    }


    newViewModel(type)
    {
        return new CrimsonWitchOfFlamesViewModel(this, type);
    }
}


// 燃え盛る炎の魔女, ViewModel
export class CrimsonWitchOfFlamesViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffStacks = ko.observable(3);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        let bonusValue = 0.15;
        if(this.bonusType == '4') {
            bonusValue += bonusValue * 0.5 * this.buffStacks();
            
            calc.baseOverloadedBonus.value += 0.4;
            calc.baseBurningBonus.value += 0.4;
            calc.baseVaporizeBonus.value += 0.15;
            calc.baseMeltBonus.value += 0.15;
        }
        
        calc.basePyroDmg.value += bonusValue;
        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                `
                <div class="card">
                    <div class="card-header p-2">火魔女：炎ダメバフ</div>
                    <div class="card-body p-2">
                        <div class="form-group m-0">
                            <div class="form-check" data-bind="with: ` + target + `">
                                <select class="custom-select" aria-label="バフ効果量" data-bind="value: buffStacks">
                                    <option value="0">+15.0%</option>
                                    <option value="1">+22.5%</option>
                                    <option value="2">+30.0%</option>
                                    <option value="3">+37.5%</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                `);
        }

        return list;
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


// 追憶のしめ縄
export class ShimenawaReminiscence extends ArtifactData
{
    constructor()
    {
        super(
            'shimenawa_reminiscence',
            "追憶のしめ縄",
            "しめ縄",
        );
    }


    newViewModel(type)
    {
        return new ShimenawaReminiscenceViewModel(this, type);
    }
}


// 追憶のしめ縄, ViewModel
export class ShimenawaReminiscenceViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffEffect = ko.observable(true);
    }


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

        calc.rateAtk.value += 0.18;

        if(this.bonusType == '4') {
            calc.baseNormalDmg.value += 0.5;
            calc.baseChargedDmg.value += 0.5;
            calc.basePlungeDmg.value += 0.5;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                `
                <div class="card">
                    <div class="card-header p-2">しめ縄：ダメバフ</div>
                    <div class="card-body p-2">
                        <div class="form-group m-0">
                            <div class="form-check" data-bind="with: ` + target + `">
                                <label class="form-check-label">
                                    <input class="form-check-input" type="checkbox" data-bind="checked: buffEffect" checked>
                                    通常・重撃・落下+50%ダメバフ（元素エネ15消費）
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                `);
        }

        return list;
    }


    toJS() {
        let obj = super.toJS();
        obj.buffEffect = this.buffEffect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.buffEffect(obj.buffEffect);
    }
}


export const artifacts = [
    new GladiatorsFinale(),
    new WanderersTroupe(),
    new CrimsonWitchOfFlames(),
    new ShimenawaReminiscence(),
];



// statusType: "ATK%", "DEF%", "HP%", "Mastery", "Recharge", "PhyDmg", "ElmDmg", "CrtRate", "CrtDmg", "Heal"
export function applyDmgCalcArtifactMainStatus(calc, character, statusType)
{
    switch(statusType) {
        case "ATK%":
            calc.rateAtk.value += 0.466;
            break;

        case "DEF%":
            calc.rateDef.value += 0.583;
            break;

        case "HP%":
            calc.rateHP.value += 0.466;
            break;

        case "Mastery":
            calc.baseMastery.value += 187;
            break;

        case "Recharge":
            calc.baseRecharge.value += 0.518;
            break;

        case "PhyDmg":
            calc.basePhysicalDmg.value += 0.583;
            break;

        case "ElmDmg":
            switch(character.elem) {
                case "Anemo":
                    calc.baseAnemoDmg.value +=  0.466;
                    break;
                case "Cryo":
                    calc.baseCryoDmg.value +=  0.466;
                    break;
                case "Dendro":
                    calc.baseDendroDmg.value +=  0.466;
                    break;
                case "Electro":
                    calc.baseElectroDmg.value +=  0.466;
                    break;
                case "Geo":
                    calc.baseGeoDmg.value +=  0.466;
                    break;
                case "Hydro":
                    calc.baseHydroDmg.value +=  0.466;
                    break;
                case "Pyro":
                    calc.basePyroDmg.value +=  0.466;
                    break;
            }
            break;

        case "CrtRate":
            calc.baseCrtRate.value += 0.311;
            break;

        case "CrtDmg":
            calc.baseCrtDmg.value += 0.622;
            break;

        case "Heal":
            // calc.baseHeal.value += 0.359;
            break;

        default:
            console.log("Unknown value: ", e.value);
    }

    return calc;
}


