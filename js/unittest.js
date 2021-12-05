import { DamageCalculator } from './modules/dmg-calc.mjs';
import * as Data from '/js/modules/data.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';


// VGData
$(function(){
    document.getElementById("start-log").innerHTML = "start-unittest";
    var v = Calc.VGData.newRateAtk(10).mul(10).add(100);
    console.assert(v.value == 200, v.value);
    console.assert(v.grad[0] == 10, v.grad);

    var w = v.mul(Calc.VGData.newRateDef(2));
    console.assert(w.value == 400, w.value);
    console.assert(w.grad[0] == 20, w.grad);
    console.assert(w.grad[1] == 200, w.grad);

    var a1 = Calc.VGData.newRateAtk(1).add(2);           // (x + 2)
    var a2 = Calc.VGData.newRateDef(3).add(4).mul(5);    // (y + 4)*5
    var a3 = Calc.VGData.newRateHP(6).sub(2).div(2);     // (z - 2)/2

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
    var calc = new Calc.DamageCalculator();
    calc.baseAtk = calc.baseAtk.add(821);
    calc.addAtk = calc.addAtk.add(379);
    calc.rateAtk = calc.rateAtk.add(0.24);
    calc.artRateAtk.value = 0.25;
    calc.artMastery.value = 434;
    calc.baseCrtRate = calc.baseCrtRate.add(0.09);
    calc.artCrtRate.value = 0.165;
    calc.baseCrtDmg = calc.baseCrtDmg.add(0.5);
    calc.artCrtDmg.value = 0.33;

    var dmg = calc.calculateNormalDmg(0.817, {}).mul(0.5).mul(0.9);
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



$(function(){
    class HutaoDamageCalculator extends Calc.DamageCalculator
    {
        constructor() { super(); }
        
        atk() {
            return super.atk().add(super.hp().mul(0.0596 + 0.008));
        }
    }

    
    var calc = new HutaoDamageCalculator();
    calc.baseAtk = Calc.VGData.constant(714);
    calc.addAtk = Calc.VGData.constant(311);
    calc.rateAtk = Calc.VGData.constant(0.18);
    calc.baseDef = Calc.VGData.constant(845);
    calc.baseHP = Calc.VGData.constant(15552);
    calc.addHP = Calc.VGData.constant(4780);
    calc.rateHP = Calc.VGData.constant(0.466 + 0.2);
    calc.basePyroDmg = Calc.VGData.constant(0.466 + 0.5);
    calc.baseCrtRate = Calc.VGData.constant(0.05 + 0.311);
    calc.baseCrtDmg = Calc.VGData.constant(1.546);


    function objfunc(x) {
        calc.artRateAtk.value = x[0];
        calc.artRateDef.value = x[1];
        calc.artRateHP.value = x[2];
        calc.artCrtRate.value = x[3];
        calc.artCrtDmg.value = x[4];
        calc.artRecharge.value = x[5];
        calc.artMastery.value = x[6];

        return calc.calculateNormalDmg(2.287, {isPyro: true}).mul(0.5).mul(0.9);
    }


    (async () => {
        await nlopt.ready

        let total_cost = 0.0001;
        
        var results = [];
        const startTime = performance.now();
        for(let i = 0; i < 10; ++i) {
            try {
                let res = applyOptimize(calc, objfunc, total_cost, nlopt.Algorithm.LD_SLSQP, [0, 0, 0, 0, 0, 0, 0], 1e-3, 1000);

                if(res.opt_result.success)
                    results.push(res);
            } catch(ex) {
                console.log(ex);
            }

            // Flush the GC
            nlopt.GC.flush();
        }
        const endTime = performance.now();
        // console.log(endTime - startTime);
        // console.log(results);

        results.sort((a, b) => {
            return b.value - a.value;
        });

        var dmg_tmp = objfunc(results[0].opt_result.x);
        console.assert(Math.round(calc.crtRate().value*1000) == 361, calc.crtRate());
        console.assert(Math.round(calc.crtDmg().value*1000) == 1546, calc.crtDmg);
        console.assert(Math.round(calc.hp().value) == 30690, calc.hp());
        console.assert(Math.round(results[0].value/10) == 1018, results[0].value);

        // console.log(objfunc([0, 0, 0, 0, 0, 0, 0]));
    })();
});



$(function(){
    var calc = new DamageCalculator();
    calc.addAtk = Calc.VGData.constant(311);
    calc.rateAtk = Calc.VGData.constant(0.18);
    calc.addHP = Calc.VGData.constant(4780);
    calc.rateHP = Calc.VGData.constant(0.466);
    calc.basePyroDmg = Calc.VGData.constant(0.466 + 0.5);
    calc.baseCrtRate = Calc.VGData.constant(0.311);

    let hutao = (new Data.HuTao()).newViewModel();
    // hutao.useSkill(true);
    hutao.lowHP(true);
    hutao.useC6Effect(false);
    hutao.constell(0);
    hutao.normalRank(10);
    hutao.skillRank(10);
    hutao.burstRank(10);


    let homa = new Data.StaffOfHoma().newViewModel();
    homa.selLowHighHP("lowHP");
    homa.rank(4);

    calc = homa.applyDmgCalc(hutao.applyDmgCalc(calc));

    // console.log(calc);
    // console.log(calc.atk());
    // console.log(calc.hp());

    function objfunc(x) {
        calc.artRateAtk.value = x[0];
        calc.artRateDef.value = x[1];
        calc.artRateHP.value = x[2];
        calc.artCrtRate.value = x[3];
        calc.artCrtDmg.value = x[4];
        calc.artRecharge.value = x[5];
        calc.artMastery.value = x[6];

        return calc.calculateNormalDmg(2.565, {isPyro: true, isNowHuTaoSkill: true, isNormal: true}).mul(0.5).mul(0.9);
    }


    (async () => {
        await nlopt.ready

        let total_cost = 40 * 5;
        
        var results = [];
        for(let i = 0; i < 10; ++i) {
            try {
                var res = applyOptimize(calc, objfunc, total_cost, nlopt.Algorithm.LD_SLSQP, [0, 0, 0, 0, 0, 0, 0], 1e-3, 1000);
                
                if(res.opt_result.success)
                    results.push(res);
            } catch(ex) {
                console.log(ex);
            }

            // Flush the GC
            nlopt.GC.flush();
        }

        console.assert(Math.round(results[0].value/10)*10 >= 38260, results[0]);

        const startTime = performance.now();
        for(let _ = 0; _ < 100; ++_)
            var res3 = applyOptimize(calc, objfunc, total_cost, nlopt.Algorithm.LD_SLSQP, [0, 0, 0, 0, 0, 0, 0], 1e-3, 1000);
        const endTime = performance.now();
        document.getElementById("optimize-time").innerHTML = (endTime - startTime)/100;
    })();
});
