(function () {
    'use strict'
  
    feather.replace();

    
    // https://stackoverflow.com/a/31402450
    ko.bindingHandlers.htmlWithBinding = {
          'init': function() {
            return { 'controlsDescendantBindings': true };
          },
          'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
              element.innerHTML = valueAccessor();
              ko.applyBindingsToDescendants(bindingContext, element);
          }
    };

    $(document).ready(function() {
        $(".multiselect").each(function(){
            $(this).multiselect();
        });
    });
})();

// for nlopt-js
window.global = window;


if(location.href.endsWith('unittest/')) {
    window.runUnittest = function(func) { func(); }; 
} else {
    window.runUnittest = function(func) { };
}


genUniqueId = (function(){
    var i=0;
    return function() {
        return i++;
    };
})();


function zeroToNull(val) {
    if(val == 0) {
        return null;
    } else {
        return val;
    }
}


function textPercentage(value, digit=3)
{
    return new Intl.NumberFormat('ja', { style: 'percent', maximumSignificantDigits: digit}).format(value);
}

runUnittest(function(){
    console.assert(textPercentage(1, 3) == "100%");
    console.assert(textPercentage(1.11, 3) == "111%");
    console.assert(textPercentage(1.111111, 3) == "111%");
    console.assert(textPercentage(0.01, 3) == "1%");
    console.assert(textPercentage(0.0111, 3) == "1.11%");
    console.assert(textPercentage(0.01111111, 3) == "1.11%");
});


function textInteger(value)
{
    return "" + Math.round(value)
}

runUnittest(function(){
    console.assert(textInteger(12.2) == "12");
    console.assert(textInteger(12.8) == "13");
});


function textPercentageFix(value, fracDigit=1)
{
    return new Intl.NumberFormat(
        'ja',
        {   style: 'percent',
            minimumFractionDigits: fracDigit,
            maximumFractionDigits: fracDigit
        }).format(value);
}


function textNumber(value, digit=3)
{
    return new Intl.NumberFormat('ja', {maximumSignificantDigits: digit}).format(value);
}


function applyOptimize(calc, objfunc, total_cost, algoritm, x0, tol, maxEval) {
    let VGData = Object.getPrototypeOf(calc.baseAtk).constructor;

    VGData.doCalcExprText = false;
    let returnValue = undefined;
    try {
        const opt = new nlopt.Optimize(algoritm, 7);

        opt.setMaxObjective((x, grad) => {
            var dmg = objfunc(x);
            dmg = dmg.log();

            if(grad) {
                for(let i = 0; i < 7; ++i)
                    grad[i] = dmg.grad[i];
            }

            return dmg.value;
        }, tol);

        
        opt.addInequalityConstraint((x, grad) => {
            var cost = calc.calcSubOptionCost(x);
            if(grad) {
                for(let i = 0; i < 7; ++i)
                    grad[i] = cost.grad[i];
            }

            return cost.value - total_cost;
        }, tol);

        opt.setUpperBounds(calc.calcUpperBounds(total_cost, objfunc));
        opt.setLowerBounds([0, 0, 0, 0, 0, 0, 0]);
        opt.setMaxeval(maxEval);

        let result = opt.optimize(x0);

        calc.artRateAtk.value = result.x[0];
        calc.artRateDef.value = result.x[1];
        calc.artRateHP.value = result.x[2];
        calc.artCrtRate.value = result.x[3];
        calc.artCrtDmg.value = result.x[4];
        calc.artRecharge.value = result.x[5];
        calc.artMastery.value = result.x[6];

        returnValue = {opt_result: result, calc: calc, value: Math.exp(result.value)};
    }catch(ex) {
        console.log(ex);
    }

    VGData.doCalcExprText = true;
    return returnValue;
}


function processTasksOnIdle(tasks, onFinish)
{
    if(tasks.length == 0) {
        onFinish();
        return;
    }

    function runTasks(deadline) {
        while(tasks.length && deadline.timeRemaining() > 0){
            tasks.shift()();
        }
        
        if(tasks.length){
            requestIdleCallback(runTasks);
        } else {
            onFinish();
        }
    }


    requestIdleCallback(runTasks);
}
