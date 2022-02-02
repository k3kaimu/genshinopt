//@ts-check
import * as Calc from './dmg-calc.mjs';
import * as CharBase from './characters/base.mjs';


/**
 * @enum {string}
 */
export const Element = {
    Anemo: "Anemo",
    Cryo: "Cryo",
    Dendro: "Dendro",
    Electro: "Electro",
    Geo: "Geo",
    Hydro: "Hydro",
    Pyro: "Pyro,"
};


/**
 * @enum {string}
 */
export const WeaponType = {
    Bow: "Bow",
    Catalyst: "Catalyst",
    Claymore: "Claymore",
    Polearm: "Polearm",
    Sword: "Sword",
};


/**
 * @enum {string}
 */
export const AttackType = {
    Normal: "isNormal",
    Charged: "isCharged",
    Plunge: "isPlunge",
    Skill: "isSkill",
    Burst: "isBurst",
    None: "none",
};


/**
 * @enum {string}
 */
export const UIType = {
    select: "select",
    checkbox: "checkbox",
    html: "html",
}


/**
 * @typedef {{
 *  type: UIType;
 *  name: string;
 *  init: any;
 *  label?: (vm: CharBase.CharacterViewModel) => string;
 *  options?: {label: string, value: any}[];
 *  other?: (vm: CharBase.CharacterViewModel) => Object;
 *  html?: (vm: CharBase.CharacterViewModel) => string;
 * }} UIItem
 */


/**
 * @typedef {(number | number[])[][]} TalentTable
 */

/** ステータスを表します．DynamicStatusTypeと違い，こちらは他のステータスなどから換算して決定されず，すべての攻撃方法で値が変動しない場合に利用します
 * @enum {string}
 */
export const StaticStatusType = {
    baseAtk: "baseAtk",
    rateAtk: "rateAtk",
    addAtk: "addAtk",
    baseDef: "baseDef",
    rateDef: "rateDef",
    addDef: "addDef",
    baseHP: "baseHP",
    rateHP: "rateHP",
    addHP: "addHP",
    crtRate: "baseCrtRate",
    crtDmg: "baseCrtDmg",
    allDmg: "baseAllDmg",
    anemoDmg: "baseAnemoDmg",
    geoDmg: "baseGeoDmg",
    electroDmg: "baseElectroDmg",
    pyroDmg: "basePyroDmg",
    hydroDmg: "baseHydroDmg",
    cryoDmg: "baseCryoDmg",
    dendroDmg: "baseDendroDmg",
    physicalDmg: "basePhysicalDmg",
    normalDmg: "baseNormalDmg",
    chargedDmg: "baseChargedDmg",
    plungeDmg: "basePlungeDmg",
    skillDmg: "baseSkillDmg",
    burstDmg: "baseBurstDmg",
    swirlBonus: "baseSwirlBonus",
    crystalizeBonus: "baseCrystalizeBonus",
    vaporizeBonus: "baseVaporizeBonus",
    overloadedBonus: "baseOverloadedBonus",
    meltBonus: "baseMeltBonus",
    electroChargedBonus: "baseElectroChargedBonus",
    frozenBonus: "baseFrozenBonus",
    superconductBonus: "baseSuperconductBonus",
    shatteredBonus: "baseShatteredBonus",
    burningBonus: "baseBurningBonus",
    recharge: "baseRecharge",
    mastery: "baseMastery",
    rateShieldStrength: "baseRateShieldStrength",
    allResis: "baseAllResis",
    anemoResis: "baseAnemoResis",
    geoResis: "baseGeoResis",
    electroResis: "baseElectroResis",
    pyroResis: "basePyroResis",
    hydroResis: "baseHydroResis",
    cryoResis: "baseCryoResis",
    dendroResis: "baseDendroResis",
    physicalResis: "basePhysicalResis",
    enemyRateDef: "baseEnemyRateDef",
};

/** @type {StaticStatusType[]} */
export const staticStatusTypes = Object.values(StaticStatusType);

/** ステータスを表します．StaticStatusTypeと違い，こちらは他のステータスなどから換算して決定されたり，攻撃方法によって値が変わる場合に利用します
 * @enum {string}
 */
export const DynamicStatusType = {
    /** 攻撃力 */                   atk: "atk",
    /** 攻撃力% */                  rateAtk: "rateAtk_",
    /** 攻撃力(atkと同等) */        addAtk: "atk",
    /** 防御力 */                   def: "def",
    /** 防御力% */                  rateDef: "rateDef_",
    /** 防御力(defと同等) */        addDef: "def",
    /** HP */                       hp: "hp",
    /** HP% */                      rateHP: "rateHP_",
    /** HP(hpと同等) */             addHP: "hp",
    /** 会心率 */                   crtRate: "crtRate",
    /** 会心ダメージ */             crtDmg: "crtDmg",
    /** 全元素/全攻撃ダメージ% */   allDmg: "allDmgBuff",
    /** 風元素ダメージ% */           anemoDmg: "anemoDmgBuff",
    /** 岩元素ダメージ% */           geoDmg: "geoDmgBuff",
    /** 雷元素ダメージ% */           electroDmg: "electroDmgBuff",
    /** 炎元素ダメージ% */           pyroDmg: "pyroDmgBuff",
    /** 水元素ダメージ% */           hydroDmg: "hydroDmgBuff",
    /** 氷元素ダメージ% */           cryoDmg: "cryoDmgBuff",
    /** 草元素ダメージ% */           dendroDmg: "dendroDmgBuff",
    /** 物理ダメージ% */             physicalDmg: "physicalDmgBuff",
    /** 通常攻撃ダメージ% */        normalDmg: "normalDmgBuff",
    /** 重撃ダメージ% */            chargedDmg: "chargedDmgBuff",
    /** 落下ダメージ% */            plungeDmg: "plungeDmgBuff",
    /** スキルダメージ% */          skillDmg: "skillDmgBuff",
    /** 爆発ダメージ% */            burstDmg: "burstDmgBuff",
    swirlBonus: "swirlBonus",
    crystalizeBonus: "crystalizeBonus",
    vaporizeBonus: "vaporizeBonus",
    overloadedBonus: "overloadedBonus",
    meltBonus: "meltBonus",
    electroChargedBonus: "electroChargedBonus",
    frozenBonus: "frozenBonus",
    shatteredBonus: "shatteredBonus",
    superconductBonus: "superconductBonus",
    burningBonus: "burningBonus",
    allResis: "allResis",
    anemoResis: "anemoResis",
    geoResis: "geoResis",
    electroResis: "electroResis",
    pyroResis: "pyroResis",
    hydroResis: "hydroResis",
    cryoResis: "cryoResis",
    dendroResis: "dendroResis",
    physicalResis: "physicalResis",
    recharge: "recharge",
    mastery: "mastery",
    enemyRateDef: "enemyRateDef",
    /** ダメージ加算 */             increaseDamage: "increaseDamage",
};

export const dynamicStatusTypes = Object.values(DynamicStatusType);



class AttackItem {
    /** @type {("Normal" | "Charged" | "Plunge" | "Skill" | "Burst")?} */
    type;
    /** @type {((talentRow :(number|number[])[], calc: Calc.DamageCalculator, vm: CharBase.CharacterViewModel) => (number | number[]))?} */
    scale = undefined;
    /** @type {((calc: Calc.DamageCalculator, vm: CharBase.CharacterViewModel) => number)?} */
    fn = undefined;
    /** @type {DynamicStatusType?} */
    ref = DynamicStatusType.atk;
    /** @type {Object?} */
    props = undefined;
}

/** @typedef {AttackItem} AttackItemLiteral */


/** 攻撃方法を表す型です
 * 
 */
class AttackDefinition {
    /** @type {string} */
    id;
    /** @type {string} */
    label;
    /** @type {("Normal" | "Charged" | "Plunge" | "Skill" | "Burst")?} */
    type;
    /** @type {((talentRow :(number|number[])[], calc: Calc.DamageCalculator, vm: CharBase.CharacterViewModel) => (number | number[]))?} */
    scale = undefined;
    /** @type {((calc: Calc.DamageCalculator, vm: CharBase.CharacterViewModel) => number)?} */
    fn = undefined;
    /** @type {DynamicStatusType?} */
    ref = DynamicStatusType.atk;
    /** @type {Object?} */
    props = undefined;
    /** @type {AttackItem[]} */
    list;

    /** 
     * @param {AttackDefinitionLiteral} literal 
     */
    constructor(literal)
    {
        Object.assign(this, literal);
    }
}


/** @typedef {AttackDefinition} AttackDefinitionLiteral */


/**
 * @enum {string}
 */
export const TalentType = {
    Skill: "isSkill",
    Burst: "isBurst",
    Other: "isOther",
};

export class TalentDefinition
{
    /** @type {TalentType} */
    type;
    // /** @type {string} */
    // label;
    /** @type {number} */
    requiredC;
    /** @type {UIItem[]} */
    uiList = [];
    /** @type {TalentEffect} */
    effect;
}


export class TalentEffect
{
    /** @type {(vm: CharBase.CharacterViewModel) => boolean} */
    cond;
    /**
     * @type {(StaticTalentEffect | DynamicTalentEffect | )[]}
     */
    list;
}


export class StaticTalentEffect
{
    /** @type {StaticStatusType} */
    target;
    /** @type {boolean} */
    isStatic = true;
    /** @type {(vm: CharBase.CharacterViewModel) => number} */
    value;
}


export class DynamicTalentEffect
{
    /** @type {DynamicStatusType} */
    target;
    /** @type {boolean} */
    isDynamic = true;
    /** @type {(props: Object) => boolean} */
    condProps;
    /** @type {(data: any, calc: Calc.DamageCalculator, props: Object) => (number | Calc.VGData)} */
    value;
}


/** 
 */
class CharacterDefinition {
    /** @type {string} */
    id;
    /** @type {string} */
    name;
    /** @type {number} */
    rarity;
    /** @type {Element} */
    elem;
    /** @type {WeaponType} */
    weaponType;
    /** @type {number} */
    ATK;
    /** @type {number} */
    DEF;
    /** @type {number} */
    HP;
    /** @type {StaticStatusType} */
    bonusType;
    /** @type {number} */
    bonusValue;
    /** @type {TalentTable} */
    normalTalentTable;
    /** @type {TalentTable} */
    skillTalentTable;
    /** @type {TalentTable} */
    burstTalentTable;
    /** @type {("isSkill" | "isBurst")} */
    typeOfC3Effect;
    /** @type {("isSkill" | "isBurst")} */
    typeOfC5Effect;
    /** @type {AttackDefinition[]} */
    attackDefs;
    /** @type {TalentDefinition[]} */
    talentDefs;


    /** 
     * @param {CharacterDefinitionLiteral} literal 
     */
    constructor(literal)
    {
        Object.assign(this, literal);
    }
}


/**
 * @typedef {CharacterDefinition} CharacterDefinitionLiteral
 */