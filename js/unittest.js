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
    calc.rateAtk = calc.rateAtk.add(0.24);
    calc.artRateAtk.value = 0.25;
    calc.artMastery.value = 434;
    calc.baseCrtRate = calc.baseCrtRate.add(0.09);
    calc.artCrtRate.value = 0.165;
    calc.baseCrtDmg = calc.baseCrtDmg.add(0.5);
    calc.artCrtDmg.value = 0.33;

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



$(function(){
    class HutaoDamageCalculator extends DamageCalculator
    {
        constructor() { super(); }
        
        atk() {
            return super.atk().add(super.hp().mul(0.0596 + 0.008));
        }
    }

    
    var calc = new HutaoDamageCalculator();
    calc.baseAtk = VGData.constant(714);
    calc.addAtk = VGData.constant(311);
    calc.rateAtk = VGData.constant(0.18);
    calc.baseDef = VGData.constant(845);
    calc.baseHP = VGData.constant(15552);
    calc.addHP = VGData.constant(4780);
    calc.rateHP = VGData.constant(0.466 + 0.2);
    calc.basePyroDmg = VGData.constant(0.466 + 0.5);
    calc.baseCrtRate = VGData.constant(0.05 + 0.311);
    calc.baseCrtDmg = VGData.constant(1.546);


    function objfunc(x) {
        calc.artRateAtk.value = x[0];
        calc.artRateDef.value = x[1];
        calc.artRateHP.value = x[2];
        calc.artCrtRate.value = x[3];
        calc.artCrtDmg.value = x[4];
        calc.artRecharge.value = x[5];
        calc.artMastery.value = x[6];

        return calc.calculateDmg(2.287, {isPyro: true}).mul(0.5).mul(0.9);
    }


    (async () => {
        await nlopt.ready

        // let total_cost = 6.6 * 4 * 5;
        let total_cost = 0.0001;

        function applyOptimize(algoritm, x0, tol, maxEval) {
            const opt = new nlopt.Optimize(algoritm, 7);

            opt.setMaxObjective((x, grad) => {
                var dmg = objfunc(x).log();

                if(grad) {
                    for(let i = 0; i < 7; ++i)
                        grad[i] = dmg.grad[i];
                }

                return dmg.value;
            }, tol);

            
            opt.addInequalityConstraint((x, grad) => {
                var cost = calcSubOptionCost(x);
                if(grad) {
                    for(let i = 0; i < 7; ++i)
                        grad[i] = cost.grad[i];
                }

                return cost.value - total_cost;
            }, tol);

            opt.setUpperBounds(calcUpperBounds(total_cost, objfunc));
            opt.setLowerBounds([0, 0, 0, 0, 0, 0, 0]);
            opt.setMaxeval(maxEval);

            return opt.optimize(x0);
        }

        // let done = false;
        var results = [];
        const startTime = performance.now();
        for(let i = 0; i < 10; ++i) {
            try {
                let res = applyOptimize(nlopt.Algorithm.LD_SLSQP, [0, 0, 0, 0, 0, 0, 0], 1e-3, 1000);
                res.value = Math.exp(res.value);

                if(res.success)
                    results.push(res);
            } catch(ex) {

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

        var dmg_tmp = objfunc(results[0].x);
        console.assert(Math.round(calc.crtRate().value*1000) == 361, calc.crtRate());
        console.assert(Math.round(calc.crtDmg().value*1000) == 1546, calc.crtDmg);
        console.assert(Math.round(calc.hp().value) == 30690, calc.hp());
        console.assert(Math.round(results[0].value/10) == 1018, results[0].value);

        // console.log(objfunc([0, 0, 0, 0, 0, 0, 0]));
    })();
});



$(function(){
    class HutaoDamageCalculator extends DamageCalculator
    {
        constructor() { super(); }
        
        atk() {
            return super.atk().add(super.hp().mul(0.0715 + 0.018*2));
        }
    }

    
    var calc = new HutaoDamageCalculator();
    calc.baseAtk = VGData.constant(714);
    calc.addAtk = VGData.constant(311);
    calc.rateAtk = VGData.constant(0.18);
    calc.baseDef = VGData.constant(845);
    calc.baseHP = VGData.constant(15552);
    calc.addHP = VGData.constant(4780);
    calc.rateHP = VGData.constant(0.466 + 0.4);
    calc.basePyroDmg = VGData.constant(0.466 + 0.5);
    calc.baseCrtRate = VGData.constant(0.05 + 0.311);
    calc.baseCrtDmg = VGData.constant(1.546);


    function objfunc(x) {
        calc.artRateAtk.value = x[0];
        calc.artRateDef.value = x[1];
        calc.artRateHP.value = x[2];
        calc.artCrtRate.value = x[3];
        calc.artCrtDmg.value = x[4];
        calc.artRecharge.value = x[5];
        calc.artMastery.value = x[6];

        return calc.calculateDmg(2.565, {isPyro: true}).mul(0.5).mul(0.9);
    }


    (async () => {
        await nlopt.ready

        let total_cost = 40 * 5;
        // let total_cost = 0.0001;

        var useLog = false;
        function applyOptimize(algoritm, x0, tol, maxEval) {
            const opt = new nlopt.Optimize(algoritm, 7);
            

            opt.setMaxObjective((x, grad) => {
                var dmg = objfunc(x);
                if(useLog) dmg = dmg.log();

                if(grad) {
                    for(let i = 0; i < 7; ++i)
                        grad[i] = dmg.grad[i];
                }

                return dmg.value;
            }, tol);

            
            opt.addInequalityConstraint((x, grad) => {
                var cost = calcSubOptionCost(x);
                if(grad) {
                    for(let i = 0; i < 7; ++i)
                        grad[i] = cost.grad[i];
                }

                return cost.value - total_cost;
            }, tol);

            opt.setUpperBounds(calcUpperBounds(total_cost, objfunc));
            opt.setLowerBounds([0, 0, 0, 0, 0, 0, 0]);
            opt.setMaxeval(maxEval);

            return opt.optimize(x0);
        }

        // let done = false;
        var results = [];
        var results_log = [];
        const startTime = performance.now();
        for(let i = 0; i < 10; ++i) {
            try {
                useLog = false;
                const res1 = applyOptimize(nlopt.Algorithm.GN_ISRES, [0, 0, 0, 0, 0, 0, 0], 1e-2, 4000);
                const res2 = applyOptimize(nlopt.Algorithm.LD_SLSQP, res1.x, 1e-3, 1000);

                // res2.value = Math.exp(res2.value);
                if(res2.success)
                    results.push(res2);

            } catch(ex) {

            }

            try{
                useLog = true;
                var res3 = applyOptimize(nlopt.Algorithm.LD_SLSQP, [0, 0, 0, 0, 0, 0, 0], 1e-3, 1000);
                res3.value = Math.exp(res3.value);

                if(res3.success)
                    results_log.push(res3);
            }catch(ex) {

            }

            // Flush the GC
            nlopt.GC.flush();
        }

        const endTime = performance.now();

        results.sort((a, b) => {
            return b.value - a.value;
        });

        for(let i = 0; i < results_log.length; ++i) {
            console.assert(Math.round(results_log[i].value/10)*10 >= Math.round(results[0].value/10)*10);
        }

        console.log(results_log);
        console.log(results);
    })();
});

