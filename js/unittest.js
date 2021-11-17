// VGData
$(function(){
    var v = VGData.newRateAtk(10).mul(10).add(100);
    console.assert(v.value == 200, v.value);
    console.assert(v.grad[0] == 10, v.grad);

    var w = v.mul(VGData.newRateDef(2));
    console.assert(w.value == 400, w.value);
    console.assert(w.grad[0] == 20, w.grad);
    console.assert(w.grad[1] == 200, w.grad);

    var a1 = VGData.newRateAtk(1).add(2);           // (x + 2)
    var a2 = VGData.newRateDef(3).add(4).mul(5);    // (y + 4)*5
    var a3 = VGData.newRateHP(6).sub(2).div(2);     // (z - 2)/2

    // (x + 2) + (y + 4)*5 + (z - 2)/2 @ (x, y, z) = (1, 3, 6)
    var v1 = a1.add(a2).add(a3);
    console.assert(v1.value == 3 + 35 + 2, v1.value);
    console.assert(v1.grad[0] == 1, v1.grad);
    console.assert(v1.grad[1] == 5, v1.grad);
    console.assert(v1.grad[2] == 0.5, v1.grad);
    
    var v2 = a1.mul(a2).mul(a3);
    console.assert(v2.value == 3 * 35 * 2, v2.value);
    console.assert(v2.grad[0] == 35 * 2, v2.grad);
    console.assert(v2.grad[1] == 5 * 3 * 2, v2.grad);
    console.assert(v2.grad[2] == 3 * 35 * 0.5, v2.grad);

    var v3 = a1.mul(a1);    // (x + 2)(x + 2) == x^2 + 4x + 4
    console.assert(v3.value == 9, v3.value);
    console.assert(v3.grad[0] == 2  * 1 + 4, v3.grad);
    console.assert(v3.grad[1] == 0, v3.grad);

    var v4 = a1.div(a1);    // Constant(1)
    console.assert(v4.value == 1, v4.value);
    console.assert(v4.grad[0] == 0, v4.grad);

    var v5 = a1.sub(a1);    // Constant(0)
    console.assert(v5.value == 0, v5.value);
    console.assert(v5.grad[0] == 0, v5.grad);

    var v6 = a1.min_number(1);  // Constant(1)
    console.assert(v6.value == 1, v6.value);
    console.assert(v6.grad[0] == 0, v6.grad);

    var v7 = a1.min_number(10); // a1
    console.assert(v7.value == a1.value, v7.value);
    console.assert(v7.grad[0] == a1.grad[0], v7.grad);

    var v8 = a1.max_number(10);  // Constant(10)
    console.assert(v8.value == 10, v8.value);
    console.assert(v8.grad[0] == 0, v8.grad);

    var v9 = a1.max_number(1);  // a1
    console.assert(v9.value == a1.value, v9.value);
    console.assert(v9.grad[0] == a1.grad[0], v9.grad);
});


$(function(){
    var calc = new DamageCalculator();
    calc.baseAtk = calc.baseAtk.add(821);
    calc.addAtk = calc.addAtk.add(379);
    calc.rateAtk = calc.rateAtk.add(0.24).add(VGData.newRateAtk(0.25));
    calc.baseMastery = calc.baseMastery.add(VGData.newMastery(434));
    calc.baseCrtRate = calc.baseCrtRate.add(0.09).add(VGData.newCrtRate(0.165));
    calc.baseCrtDmg = calc.baseCrtDmg.add(0.5).add(VGData.newCrtDmg(0.33));

    var dmg = calc.calculateDmg(0.817, {}).mul(0.5).mul(0.9);
    console.assert(Math.round(dmg.value) == 714, dmg);
    console.assert(Math.round(calc.atk().value) == 1602, calc.atk());
    console.assert(Math.round(dmg.grad[0]) == 366);
    console.assert(Math.round(dmg.grad[1]) == 0);
    console.assert(Math.round(dmg.grad[2]) == 0);
    console.assert(Math.round(dmg.grad[3]) == 489);
    console.assert(Math.round(dmg.grad[4]) == 150);
    console.assert(Math.round(dmg.grad[5]) == 0);
    console.assert(Math.round(dmg.grad[6]) == 0);

    calc.baseSwirlBonus = calc.baseSwirlBonus.add(0.6);
    
    dmg = calc.calculateElementalReactionDmg({isPyro: true, isSwirl: true}).mul(1.15);
    console.assert(Math.round(dmg.value) == 4445, dmg);
    console.assert(Math.round(dmg.grad[0]) == 0);
    console.assert(Math.round(dmg.grad[1]) == 0);
    console.assert(Math.round(dmg.grad[2]) == 0);
    console.assert(Math.round(dmg.grad[3]) == 0);
    console.assert(Math.round(dmg.grad[4]) == 0);
    console.assert(Math.round(dmg.grad[5]) == 0);
    console.assert(Math.round(dmg.grad[6]*100) == 539);
});
