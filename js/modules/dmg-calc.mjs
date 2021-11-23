
// Value and Gradient Data
// 値と勾配ベクトルを保持するデータ
export class VGData
{
    constructor(value, gradVec)
    {
        this.value = value;
        this.grad = gradVec;    // double[7]: [rateAtk, rateDef, rateHP, crtRate, crtDmg, recharge, mastery]
    }


    static zero()
    {
        return new VGData(0, [0, 0, 0, 0, 0, 0, 0]);
    }


    static constant(value)
    {
        return new VGData(value, [0, 0, 0, 0, 0, 0, 0]);
    }


    static newRateAtk(value)
    {
        return new VGData(value, [1, 0, 0, 0, 0, 0, 0]);
    }

    
    static newRateDef(value)
    {
        return new VGData(value, [0, 1, 0, 0, 0, 0, 0]);
    }


    static newRateHP(value)
    {
        return new VGData(value, [0, 0, 1, 0, 0, 0, 0]);
    }

    static newCrtRate(value)
    {
        return new VGData(value, [0, 0, 0, 1, 0, 0, 0]);
    }

    static newCrtDmg(value)
    {
        return new VGData(value, [0, 0, 0, 0, 1, 0, 0]);
    }

    static newRecharge(value)
    {
        return new VGData(value, [0, 0, 0, 0, 0, 1, 0]);
    }

    static newMastery(value)
    {
        return new VGData(value, [0, 0, 0, 0, 0, 0, 1]);
    }


    dup() {
        var dst = VGData.zero();
        dst.value = this.value;
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = this.grad[i];
        }

        return dst;
    }


    add_VGData(rhs) {
        var dst = VGData.zero();
        dst.value = this.value + rhs.value;
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = this.grad[i] + rhs.grad[i];
        }

        return dst;
    }


    add_number(rhs) {
        var dst = VGData.zero();
        dst.value = this.value + rhs;
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = this.grad[i];
        }

        return dst;
    }


    // this + rhs
    add(rhs) {
        if(typeof rhs === "number")
            return this.add_number(rhs);
        else
            return this.add_VGData(rhs);
    }


    sub_VGData(rhs) {
        var dst = VGData.zero();
        dst.value = this.value - rhs.value;
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = this.grad[i] - rhs.grad[i];
        }

        return dst;
    }

    
    sub_number(rhs) {
        var dst = VGData.zero();
        dst.value = this.value - rhs;
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = this.grad[i];
        }

        return dst;
    }


    // this - rhs
    sub(rhs) {
        if(typeof rhs === "number")
            return this.sub_number(rhs);
        else
            return this.sub_VGData(rhs);
    }


    mul_VGData(rhs) {
        var dst = VGData.zero();
        dst.value = this.value * rhs.value;
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = this.grad[i] * rhs.value + this.value * rhs.grad[i];
        }

        return dst;
    }


    mul_number(rhs) {
        var dst = VGData.zero();
        dst.value = this.value * rhs;
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = this.grad[i] * rhs;
        }

        return dst;
    }


    // this * rhs
    mul(rhs) {
        if(typeof rhs === "number")
            return this.mul_number(rhs);
        else
            return this.mul_VGData(rhs);
    }


    div_VGData(rhs) {
        var dst = VGData.zero();
        dst.value = this.value / rhs.value;
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = (this.grad[i] * rhs.value - this.value * rhs.grad[i])/(rhs.value * rhs.value);
        }

        return dst;
    }


    div_number(rhs) {
        var dst = VGData.zero();
        dst.value = this.value / rhs;
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = this.grad[i] / rhs;
        }

        return dst;
    }


    // this / rhs
    div(rhs) {
        if(typeof rhs === "number")
            return this.div_number(rhs);
        else
            return this.div_VGData(rhs);
    }


    // 逆数
    inv() {
        var dst = VGData.zero();
        dst.value = 1 / this.value;
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = -this.grad[i] / (this.value * this.value);
        }

        return dst;
    }


    // Math.min(this, num)
    min_number(num) {
        if(this.value > num) {
            return VGData.constant(num);
        } else {
            return VGData.zero().add(this);
        }
    }


    // Math.max(this, num)
    max_number(num) {
        if(this.value > num) {
            return VGData.zero().add(this);
        } else {
            return VGData.constant(num);
        }
    }


    // natural log
    log() {
        var dst = VGData.zero();
        dst.value = Math.log(this.value);
        for(let i = 0; i < 7; ++i) {
            dst.grad[i] = this.grad[i] / this.value;
        }

        return dst;
    }
}


// https://wikiwiki.jp/genshinwiki/%E3%83%80%E3%83%A1%E3%83%BC%E3%82%B8%E8%A8%88%E7%AE%97%E5%BC%8F
const elementalReactionCoeffTable = [
    [8, 10, 20, 26, 33],        // lv1
    [9, 11, 22, 28, 37],
    [9, 11, 23, 29, 39],
    [10, 12, 24, 31, 42],
    [11, 13, 27, 33, 44],
    [12, 14, 29, 37, 49],
    [12, 16, 31, 39, 52],
    [13, 17, 34, 42, 57],
    [16, 18, 37, 47, 62],
    [17, 20, 40, 51, 68],
    [18, 22, 44, 56, 73],
    [20, 23, 48, 60, 81],
    [22, 27, 53, 67, 89],
    [23, 29, 58, 72, 97],
    [27, 32, 64, 80, 107],
    [29, 34, 70, 88, 118],
    [31, 38, 77, 96, 128],
    [34, 41, 83, 104, 139],
    [37, 44, 90, 112, 150],
    [40, 48, 97, 120, 161],
    [42, 51, 103, 129, 172],
    [46, 54, 110, 137, 183],
    [48, 58, 117, 146, 194],
    [51, 61, 123, 153, 206],
    [53, 64, 130, 162, 217],
    [56, 68, 136, 169, 226],
    [59, 70, 141, 177, 236],
    [61, 73, 147, 184, 246],
    [64, 78, 156, 194, 259],
    [68, 81, 163, 203, 272],
    [71, 86, 171, 213, 284],
    [74, 89, 178, 223, 298],
    [77, 92, 186, 232, 310],
    [80, 97, 193, 242, 323],
    [84, 101, 202, 253, 338],
    [88, 106, 211, 264, 352],
    [91, 110, 220, 276, 368],
    [96, 114, 230, 287, 383],
    [99, 119, 239, 299, 399],
    [103, 123, 248, 310, 414],
    [107, 129, 258, 322, 430],
    [111, 134, 269, 336, 448],
    [117, 140, 280, 350, 467],
    [121, 146, 291, 364, 487],
    [128, 153, 307, 383, 511],
    [133, 161, 322, 402, 537],
    [140, 169, 338, 422, 562],
    [147, 177, 353, 442, 590],
    [154, 184, 370, 463, 618],
    [161, 193, 388, 484, 647],
    [168, 201, 403, 504, 673],
    [174, 210, 420, 526, 700],
    [182, 218, 437, 547, 729],
    [189, 227, 453, 568, 757],
    [199, 239, 478, 598, 797],
    [208, 249, 499, 624, 832],
    [217, 260, 521, 651, 868],
    [226, 271, 543, 679, 906],
    [236, 283, 567, 709, 944],
    [246, 296, 591, 739, 986],
    [257, 308, 616, 770, 1027],
    [269, 323, 647, 808, 1078],
    [282, 339, 678, 848, 1130],
    [296, 354, 710, 888, 1184],
    [311, 374, 749, 936, 1248],
    [326, 390, 781, 977, 1302],
    [339, 407, 814, 1019, 1359],
    [353, 424, 849, 1061, 1416],
    [368, 441, 883, 1104, 1472],
    [382, 459, 918, 1148, 1531],
    [397, 477, 953, 1191, 1589],
    [412, 494, 989, 1237, 1649],
    [426, 510, 1021, 1277, 1702],
    [438, 526, 1052, 1316, 1754],
    [457, 548, 1097, 1371, 1828],
    [473, 568, 1136, 1420, 1893],
    [489, 587, 1174, 1469, 1958],
    [506, 607, 1213, 1517, 2022],
    [522, 627, 1253, 1567, 2089],
    [538, 646, 1292, 1616, 2154],
    [554, 666, 1331, 1664, 2219],
    [571, 686, 1371, 1714, 2286],
    [588, 706, 1411, 1764, 2352],
    [604, 726, 1451, 1814, 2420],
    [627, 752, 1504, 1880, 2507],
    [644, 773, 1547, 1933, 2578],
    [662, 794, 1590, 1988, 2650],
    [681, 818, 1636, 2044, 2727],
    [702, 842, 1686, 2107, 2810],
    [723, 868, 1736, 2170, 2893]];  // lv90


// 防御補正と元素耐性補正を除いた部分の期待値計算を行う
export class DamageCalculator
{
    constructor()
    {
        this.baseAtk = VGData.zero();
        this.rateAtk = VGData.zero();
        this.addAtk = VGData.zero();
        this.baseDef = VGData.zero();
        this.rateDef = VGData.zero();
        this.addDef = VGData.zero();
        this.baseHP = VGData.zero();
        this.rateHP = VGData.zero();
        this.addHP = VGData.zero();

        this.baseCrtRate = VGData.zero();
        this.baseCrtDmg = VGData.zero();

        this.baseAnemoDmg = VGData.zero();
        this.baseGeoDmg = VGData.zero();
        this.baseElectroDmg = VGData.zero();
        this.basePyroDmg = VGData.zero();
        this.baseHydroDmg = VGData.zero();
        this.baseCryoDmg = VGData.zero();
        this.baseDendroDmg = VGData.zero();
        this.basePhysicalDmg = VGData.zero();
        this.baseNormalDmg = VGData.zero();     // 通常攻撃ダメージバフ
        this.baseChargedDmg = VGData.zero();    // 重撃ダメージバフ
        this.basePlungDmg = VGData.zero();      // 落下ダメージバフ
        this.baseSkillDmg = VGData.zero();      // スキルダメージ
        this.baseBurstDmg = VGData.zero();      // 元素爆発ダメージ
        this.baseSwirlBonus = VGData.zero();            // 拡散ボーナス
        this.baseCrystalizeBonus = VGData.zero();       // 結晶化ボーナス
        this.baseVaporizeBonus = VGData.zero();         // 蒸発ボーナス
        this.baseOverloadedBonus = VGData.zero();       // 過負荷ボーナス
        this.baseMeltBonus = VGData.zero();             // 融解ボーナス
        this.baseElectroChargedBonus = VGData.zero();   // 感電ボーナス
        this.baseFrozenBonus = VGData.zero();           // 凍結ボーナス
        this.baseSuperconductBonus = VGData.zero();     // 超伝導ボーナス
        this.baseShatteredBonus = VGData.zero();        // 氷砕き
        this.baseBurningBonus = VGData.zero();          // 燃焼ボーナス

        this.baseRecharge = VGData.zero();      // 元素チャージ効率
        this.baseMastery = VGData.zero();       // 元素熟知

        // 聖遺物サブオプション
        this.artRateAtk = VGData.newRateAtk(0);
        this.artRateDef = VGData.newRateDef(0);
        this.artRateHP = VGData.newRateHP(0);
        this.artCrtRate = VGData.newCrtRate(0);
        this.artCrtDmg = VGData.newCrtDmg(0);
        this.artRecharge = VGData.newRecharge(0);
        this.artMastery = VGData.newMastery(0);
    }


    dup()
    {
        var dst = new DamageCalculator();

        dst.baseAtk = this.baseAtk.dup();
        dst.rateAtk = this.rateAtk.dup();
        dst.addAtk = this.addAtk.dup();
        dst.baseDef = this.baseDef.dup();
        dst.rateDef = this.rateDef.dup();
        dst.addDef = this.addDef.dup();
        dst.baseHP = this.baseHP.dup();
        dst.rateHP = this.rateHP.dup();
        dst.addHP = this.addHP.dup();

        dst.baseCrtRate = this.baseCrtRate.dup();
        dst.baseCrtDmg = this.baseCrtDmg.dup();

        dst.baseAnemoDmg = this.baseAnemoDmg.dup();
        dst.baseGeoDmg = this.baseGeoDmg.dup();
        dst.baseElectroDmg = this.baseElectroDmg.dup();
        dst.basePyroDmg = this.basePyroDmg.dup();
        dst.baseHydroDmg = this.baseHydroDmg.dup();
        dst.baseCryoDmg = this.baseCryoDmg.dup();
        dst.baseDendroDmg = this.baseDendroDmg.dup();
        dst.basePhysicalDmg = this.basePhysicalDmg.dup();
        dst.baseNormalDmg = this.baseNormalDmg.dup();
        dst.baseChargedDmg = this.baseChargedDmg.dup();
        dst.basePlungDmg = this.basePlungDmg.dup();
        dst.baseSkillDmg = this.baseSkillDmg.dup();
        dst.baseBurstDmg = this.baseBurstDmg.dup();
        dst.baseSwirlBonus = this.baseSwirlBonus.dup();
        dst.baseCrystalizeBonus = this.baseCrystalizeBonus.dup();
        dst.baseVaporizeBonus = this.baseVaporizeBonus.dup();
        dst.baseOverloadedBonus = this.baseOverloadedBonus.dup();
        dst.baseMeltBonus = this.baseMeltBonus.dup();
        dst.baseElectroChargedBonus = this.baseElectroChargedBonus.dup();
        dst.baseFrozenBonus = this.baseFrozenBonus.dup();
        dst.baseSuperconductBonus = this.baseSuperconductBonus.dup();
        dst.baseShatteredBonus = this.baseShatteredBonus.dup();
        dst.baseBurningBonus = this.baseBurningBonus.dup();

        dst.baseRecharge = this.baseRecharge.dup();
        dst.baseMastery = this.baseMastery.dup();

        this.artRateAtk = VGData.newRateAtk(0);
        this.artRateDef = VGData.newRateDef(0);
        this.artRateHP = VGData.newRateHP(0);
        this.artCrtRate = VGData.newCrtRate(0);
        this.artCrtDmg = VGData.newCrtDmg(0);
        this.artRecharge = VGData.newRecharge(0);
        this.artMastery = VGData.newMastery(0);

        return dst;
    }


    copyFrom(rhs) {
        this.baseAtk = rhs.baseAtk.dup();
        this.rateAtk = rhs.rateAtk.dup();
        this.addAtk = rhs.addAtk.dup();
        this.baseDef = rhs.baseDef.dup();
        this.rateDef = rhs.rateDef.dup();
        this.addDef = rhs.addDef.dup();
        this.baseHP = rhs.baseHP.dup();
        this.rateHP = rhs.rateHP.dup();
        this.addHP = rhs.addHP.dup();

        this.baseCrtRate = rhs.baseCrtRate.dup();
        this.baseCrtDmg = rhs.baseCrtDmg.dup();

        this.baseAnemoDmg = rhs.baseAnemoDmg.dup();
        this.baseGeoDmg = rhs.baseGeoDmg.dup();
        this.baseElectroDmg = rhs.baseElectroDmg.dup();
        this.basePyroDmg = rhs.basePyroDmg.dup();
        this.baseHydroDmg = rhs.baseHydroDmg.dup();
        this.baseCryoDmg = rhs.baseCryoDmg.dup();
        this.baseDendroDmg = rhs.baseDendroDmg.dup();
        this.basePhysicalDmg = rhs.basePhysicalDmg.dup();
        this.baseNormalDmg = rhs.baseNormalDmg.dup();
        this.baseChargedDmg = rhs.baseChargedDmg.dup();
        this.basePlungDmg = rhs.basePlungDmg.dup();
        this.baseSkillDmg = rhs.baseSkillDmg.dup();
        this.baseBurstDmg = rhs.baseBurstDmg.dup();
        this.baseSwirlBonus = rhs.baseSwirlBonus.dup();
        this.baseCrystalizeBonus = rhs.baseCrystalizeBonus.dup();
        this.baseVaporizeBonus = rhs.baseVaporizeBonus.dup();
        this.baseOverloadedBonus = rhs.baseOverloadedBonus.dup();
        this.baseMeltBonus = rhs.baseMeltBonus.dup();
        this.baseElectroChargedBonus = rhs.baseElectroChargedBonus.dup();
        this.baseFrozenBonus = rhs.baseFrozenBonus.dup();
        this.baseSuperconductBonus = rhs.baseSuperconductBonus.dup();
        this.baseShatteredBonus = rhs.baseShatteredBonus.dup();
        this.baseBurningBonus = rhs.baseBurningBonus.dup();

        this.baseRecharge = rhs.baseRecharge.dup();
        this.baseMastery = rhs.baseMastery.dup();

        this.artRateAtk = rhs.artRateAtk.dup();
        this.artRateDef = rhs.artRateDef.dup();
        this.artRateHP = rhs.artRateHP.dup();
        this.artCrtRate = rhs.artCrtRate.dup();
        this.artCrtDmg = rhs.artCrtDmg.dup();
        this.artRecharge = rhs.artRecharge.dup();
        this.artMastery = rhs.artMastery.dup();
    }


    // 蒸発・融解以外の元素反応のダメージ計算
    calculateElementalReactionDmg(attackProps)
    {
        var reactType = undefined;
        var bonus = VGData.zero();
        if("isSuperconduct" in attackProps)     { reactType = 0;    bonus = bonus.add(this.superconductBonus()); }
        if("isSwirl" in attackProps)            { reactType = 1;    bonus = bonus.add(this.swirlBonus()); }
        if("isElectroCharged" in attackProps)   { reactType = 2;    bonus = bonus.add(this.electroChargedBonus()); }
        if("isShattered" in attackProps)        { reactType = 3;    bonus = bonus.add(this.shatteredBonus()); }
        if("isOverloaded" in attackProps)       { reactType = 4;    bonus = bonus.add(this.overloadedBonus()); }

        // Lv90時の係数を参照
        var coef = VGData.constant(elementalReactionCoeffTable[90-1][reactType]);
        console.assert(!(reactType == undefined), attackProps + " is not an elemental reaction.");

        var masteryBonus = this.mastery().mul(16).div(this.mastery().add(2000));

        return coef.mul(masteryBonus.add(1).add(bonus));
    }


    // 一般のダメージ計算（蒸発・融解のボーナスを含む）
    calculateDmg(dmgScale, attackProps) {
        if(attackProps == undefined)
            attackProps = {};

        var dmgbuff = VGData.zero();
        if("isAnemo" in attackProps)    dmgbuff = dmgbuff.add(this.anemoDmgBuff());
        if("isGeo" in attackProps)      dmgbuff = dmgbuff.add(this.geoDmgBuff());
        if("isElectro" in attackProps)  dmgbuff = dmgbuff.add(this.electroDmgBuff());
        if("isPyro" in attackProps)     dmgbuff = dmgbuff.add(this.pyroDmgBuff());
        if("isHydro" in attackProps)    dmgbuff = dmgbuff.add(this.hydroDmgBuff());
        if("isCryo" in attackProps)     dmgbuff = dmgbuff.add(this.cryoDmgBuff());
        if("isDendro" in attackProps)   dmgbuff = dmgbuff.add(this.dendroDmgBuff());
        if("isPysical" in attackProps)  dmgbuff = dmgbuff.add(this.physicalDmgBuff());
        if("isNormal" in attackProps)   dmgbuff = dmgbuff.add(this.normalDmgBuff());
        if("isCharged" in attackProps)  dmgbuff = dmgbuff.add(this.chargedDmgBuff());
        if("isPlung" in attackProps)    dmgbuff = dmgbuff.add(this.plungDmgBuff());
        if("isSkill" in attackProps)    dmgbuff = dmgbuff.add(this.skillDmgBuff());
        if("isBurst" in attackProps)    dmgbuff = dmgbuff.add(this.burstDmgBuff());

        // var dmg = this.atk() * dmgScale * (1 + Math.min(this.crtRate(), 1) * this.crtDmg()) * (1 + dmgbuff);
        var dmg = this.atk().mul(dmgScale).mul(this.crtRate().min_number(1).max_number(0).mul(this.crtDmg()).add(1)).mul(dmgbuff.add(1));

        if(("isVaporize" in attackProps) || ("isMelt" in attackProps)) {
            var reactBonus = this.mastery().mul(25).div(this.mastery().add(1400).mul(9));
            if("isVaporize" in attackProps)     reactBonus = reactBonus.add(this.vaporizeBonus());
            if("isMelt" in attackProps)         reactBonus = reactBonus.add(this.meltBonus());

            var reactScale = 1;
            if(("isHydro" in attackProps) && ("isVaporize" in attackProps)) reactScale = 2;     // 炎 -> 水
            if(("isPyro" in attackProps) && ("isVaporize" in attackProps))  reactScale = 1.5;   // 水 -> 炎
            if(("isPyro" in attackProps) && ("isMelt" in attackProps))      reactScale = 2;     // 氷 -> 炎
            if(("isCryo" in attackProps) && ("isMelt" in attackProps))      reactScale = 1.5;   // 炎 -> 氷

            var masteryBonus = this.mastery().mul(25).div(this.mastery().add(1400).mul(9));

            return dmg.mul(reactScale).mul(masteryBonus.add(1).add(reactBonus));
        }
        
        return dmg;
    }


    atk() { return this.baseAtk.mul(this.rateAtk.add(1).add(this.artRateAtk)).add(this.addAtk); }
    def() { return this.baseDef.mul(this.rateDef.add(1).add(this.artRateDef)).add(this.addDef); }
    hp() { return this.baseHP.mul(this.rateHP.add(1).add(this.artRateHP)).add(this.addHP); }
    crtRate() { return this.baseCrtRate.add(this.artCrtRate); }
    crtDmg() { return this.baseCrtDmg.add(this.artCrtDmg); }

    anemoDmgBuff() { return this.baseAnemoDmg; }
    geoDmgBuff() { return this.baseGeoDmg; }
    electroDmgBuff() { return this.baseElectroDmg; }
    pyroDmgBuff() { return this.basePyroDmg; }
    hydroDmgBuff() { return this.baseHydroDmg; }
    cryoDmgBuff() { return this.baseCryoDmg; }
    dendroDmgBuff() { return this.baseDendroDmg; }
    physicalDmgBuff() { return this.basePhysicalDmg; }
    normalDmgBuff() { return this.baseNormalDmg; }
    chargedDmgBuff() { return this.baseChargedDmg; }
    plungDmgBuff() { return this.basePlungDmg; }
    skillDmgBuff() { return this.baseSkillDmg; }
    burstDmgBuff() { return this.baseBurstDmg; }
    swirlBonus() { return this.baseSwirlBonus; }
    crystalizeBonus() { return this.baseCrystalizeBonus; }
    vaporizeBonus() { return this.baseVaporizeBonus; }
    overloadedBonus() { return this.baseOverloadedBonus; }
    meltBonus() { return this.baseMeltBonus; }
    electroChargedBonus() { return this.baseElectroChargedBonus; }
    frozenBonus() { return this.baseFrozenBonus; }
    shatteredBonus() { return this.baseShatteredBonus; }
    superconductBonus() { return this.baseSuperconductBonus; }
    burningBonus() { return this.baseBurningBonus; }


    recharge() { return this.baseRecharge.add(this.artRecharge); }
    mastery() { return this.baseMastery.add(this.artMastery); }
}


export function calcAttenuationByEnemy(charLvl, enemyLvl)
{
    return (charLvl + 100)/((enemyLvl + 100) + charLvl + 100);
}


// https://wikiwiki.jp/genshinwiki/%E8%81%96%E9%81%BA%E7%89%A9#ParamSubOps
export function calcUpperBounds(cost, objfunc)
{
    var rect = [
        cost / 6.2 * 0.047,
        cost / 6.2 * 0.058,
        cost / 6.2 * 0.047,
        cost / 6.2 * 0.031,
        cost / 6.2 * 0.062,
        cost / 6.2 * 0.052,
        cost / 6.2 * 19];

    var grad = objfunc([0, 0, 0, 0, 0, 0, 0]).grad;
    for(let i = 0; i < 7; ++i)
        if(grad[i] < 1e-4)
            rect[i] = 0;
    
    return rect;
}


// https://wikiwiki.jp/genshinwiki/%E8%81%96%E9%81%BA%E7%89%A9#ParamSubOps
export function calcSubOptionCost(x)
{
    return  VGData.newRateAtk(x[0]).div(0.047)
            .add(VGData.newRateDef(x[1]).div(0.058))
            .add(VGData.newRateHP(x[2]).div(0.047))
            .add(VGData.newCrtRate(x[3]).div(0.031))
            .add(VGData.newCrtDmg(x[4]).div(0.062))
            .add(VGData.newRecharge(x[5]).div(0.052))
            .add(VGData.newMastery(x[6]).div(19))
            .mul(6.2);
}
