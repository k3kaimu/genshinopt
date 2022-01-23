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


function reload_js(src) {
    $('script[src="' + src + '"]').remove();
    $('<script>').attr('src', src).appendTo('head');
}


reload_js('/js/nlopt-js.js');

if(location.host.startsWith('localhost')) {
    let unittest_functions = [];
    function runUnittest(func) {
        unittest_functions.push(func); 
    }

    setTimeout(() => {
        unittest_functions.forEach(fn => fn());
        console.log("Done all tests");
    }, 2000);
} else {
    function runUnittest(func) { };
}


let genUniqueId = (function(){
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

function textNumberFix(value, digit=3)
{
    return new Intl.NumberFormat(
        'ja',
        {   minimumFractionDigits: digit,
            maximumFractionDigits: digit
        }).format(value);
}


function isValidNumber(value)
{
    if(value == null)
        return false;

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
    console.assert(!isValidNumber(null));
});


function escapeHTMLString(str){
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#x27;');
    str = str.replace(/`/g, '&#x60;');
    return str;
}


function escapeHTML(obj)
{
    if(typeof obj == "number")
        return obj;
    else if(typeof obj == "string")
        return escapeHTMLString(obj);
    else if(typeof obj == "boolean")
        return obj;
    else if(Array.isArray(obj))
    {
        if(obj == null)
            return null;

        let newArr = [];
        obj.forEach(e => {
            newArr.push(escapeHTML(e));
        });

        return newArr;
    }
    else if(typeof obj == "object")
    {
        if(obj == null)
            return null;

        let keys = Object.keys(obj);
        let newObj = {};
        keys.forEach(k => {
            newObj[escapeHTMLString(k)] = escapeHTML(obj[k]);
        });

        return newObj;
    }
    else {
        return undefined;
    }
}


/**
 * @param {(() => void)[]} tasks
 * @param {() => void} onFinish
 */
function processTasksOnIdle(tasks, onFinish)
{
    if(tasks.length == 0) {
        onFinish();
        return;
    }

    async function runTasks(deadline) {
        while(tasks.length && deadline.timeRemaining() > 0){
            let task = tasks.shift();
            await task();
        }
        
        if(tasks.length){
            requestIdleCallback(runTasks);
        } else {
            if(onFinish)
                onFinish();
        }
    }


    requestIdleCallback(runTasks);
}



function shallowDup(obj)
{
    return Object.assign({}, obj);
}


function deepDup(obj)
{
    return MessagePack.decode(MessagePack.encode(obj));
}


function isShallowEqualObject(obj1, obj2) {
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    if(keys1.length !== keys2.length)
        return false;

    for(let key of keys1){
        if(obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
}



/**
 * @param {Object} obj
 * @param {string|string[]} props
 */
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



/**
 * @param {Object} obj
 * @param {string[]|string} props
 */
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


/**
 * @param {Object} obj
 * @param {Object} props
 */
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


/**
 * @param {Object} obj
 * @param {Object} props
 */
function hasAnyPropertiesWithSameValue(obj, props = {})
{
    var keys = Object.keys(props);
    if(keys.length == 0)
        return true;

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
    let obj = MessagePack.decode(LZMA.decompress(base64ToUint8Array(decodeURIComponent(uri).replace('-', '+').replace('_', '/'))));
    return escapeHTML(obj);
}


// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
/**
 * @param {string} text
 */
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
/**
 * @param {string} text
 */
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
