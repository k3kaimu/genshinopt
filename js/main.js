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


function isValidNumber(value)
{
    value = Number(value);

    if(value == undefined || isNaN(value))
        return false;
    else if(typeof value == 'number')
        return true;
    else
        return false;
}

runUnittest(function(){
    console.assert(isValidNumber(0));
    console.assert(isValidNumber(1));
    console.assert(isValidNumber(-1));
    console.assert(!isValidNumber(NaN));
    console.assert(!isValidNumber(undefined));
});


function applyOptimize(calc, objfunc, total_cost, algoritm, x0, tol, maxEval) {
    let VGData = Object.getPrototypeOf(calc.baseAtk).constructor;

    let doCalcExprTextLast = VGData.doCalcExprText;
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

        // calc.artRateAtk.value = result.x[0];
        // calc.artRateDef.value = result.x[1];
        // calc.artRateHP.value = result.x[2];
        // calc.artCrtRate.value = result.x[3];
        // calc.artCrtDmg.value = result.x[4];
        // calc.artRecharge.value = result.x[5];
        // calc.artMastery.value = result.x[6];

        returnValue = {opt_result: result, calc: calc, value: Math.exp(result.value)};
    }catch(ex) {
        console.log(ex);
    }

    VGData.doCalcExprText = doCalcExprTextLast;
    return returnValue;
}


function applyGlobalOptimize(calc, objfunc, total_cost, globalAlgorithm, localAlgorithm, x0, tol, maxEvalGlobal, maxEvalLocal)
{
    function globalObjFunc(x)
    {
        let opt = applyOptimize(calc, objfunc, total_cost, localAlgorithm, x, tol, maxEvalLocal);
        return objfunc(opt.opt_result.x);
    }


    let ret = applyOptimize(calc, globalObjFunc, total_cost, globalAlgorithm, x0, tol, maxEvalGlobal);

    // 大域最適化の結果を使って局所最適化をする
    return applyOptimize(calc, objfunc, total_cost, localAlgorithm, ret.opt_result.x, tol, maxEvalLocal);;
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



function shallowDup(obj)
{
    return Object.assign({}, obj);
}



function deleteProperties(obj, props = [])
{
    if(!Array.isArray(props))
        props = [props];

    props.forEach(e => {
        delete obj[e];
    });

    return obj;
}

runUnittest(function(){
    let obj = {a:1, b:2, c:3};

    obj = deleteProperties(obj, ['a', 'c', 'd']);
    console.assert(obj.a == undefined, obj);
    console.assert(obj.b == 2, obj);
    console.assert(obj.c == undefined, obj);
});



function hasAnyProperties(obj, props = [])
{
    if(!Array.isArray(props))
        props = [props];

    let ret = false;
    props.forEach(e => {
        if(e in obj)
            ret = true;
    });

    return ret;
}

runUnittest(function(){
    let obj = {a:1, b:2, c:3};

    console.assert(hasAnyProperties(obj, 'a') === true);
    console.assert(hasAnyProperties(obj, 'd') === false);
    console.assert(hasAnyProperties(obj, ['a', 'd']) == true);

    obj = deleteProperties(obj, ['a', 'c']);
    console.assert(hasAnyProperties(obj, 'a') === false);
    console.assert(hasAnyProperties(obj, 'd') === false);
    console.assert(hasAnyProperties(obj, ['a', 'd']) == false);
});


function hasAllPropertiesWithSameValue(obj, props = {})
{
    var keys = Object.keys(props);

    for (var i = 0; i < keys.length; i++) {
        if(obj[keys[i]] != props[keys[i]])
            return false;
    }

    return true;
}


runUnittest(function(){
    let obj = {a:1, b:2, c:3};

    console.assert(hasAllPropertiesWithSameValue(obj, {a:1}) === true);
    console.assert(hasAllPropertiesWithSameValue(obj, {a:2}) === false);
    console.assert(hasAllPropertiesWithSameValue(obj, {d:1}) === false);
    console.assert(hasAllPropertiesWithSameValue(obj, {a:1,b:2}) == true);
    console.assert(hasAllPropertiesWithSameValue(obj, {a:1,b:3}) == false);

    obj = deleteProperties(obj, ['a', 'c']);
    console.assert(hasAllPropertiesWithSameValue(obj, {a:1}) === false);
    console.assert(hasAllPropertiesWithSameValue(obj, {d:1}) === false);
});


function hasAnyPropertiesWithSameValue(obj, props = {})
{
    var keys = Object.keys(props);

    for (var i = 0; i < keys.length; i++) {
        if(obj[keys[i]] == props[keys[i]])
            return true;
    }

    return false;
}

runUnittest(function(){
    let obj = {a:1, b:2, c:3};

    console.assert(hasAnyPropertiesWithSameValue(obj, {a:1}) === true);
    console.assert(hasAnyPropertiesWithSameValue(obj, {a:2}) === false);
    console.assert(hasAnyPropertiesWithSameValue(obj, {d:1}) === false);
    console.assert(hasAnyPropertiesWithSameValue(obj, {a:1,b:2}) == true);
    console.assert(hasAnyPropertiesWithSameValue(obj, {a:1,b:3}) == true);

    obj = deleteProperties(obj, ['a', 'c']);
    console.assert(hasAnyPropertiesWithSameValue(obj, {a:1}) === false);
    console.assert(hasAnyPropertiesWithSameValue(obj, {d:1}) === false);
});


function uint8ArrayToBase64(data)
{
    return btoa(String.fromCharCode(...new Uint8Array(data)));
}


function base64ToUint8Array(str)
{
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}


function encodeToURI(obj)
{
    return encodeURIComponent(uint8ArrayToBase64(LZMA.compress(MessagePack.encode(obj))).replace('+', '-').replace('/', '_'));
}


function decodeFromURI(uri)
{
    return MessagePack.decode(LZMA.decompress(base64ToUint8Array(decodeURIComponent(uri).replace('-', '+').replace('_', '/'))));
}


// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
    //   console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
}


//   https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        // console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}