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


function tryAndDefault(fn, defval)
{
    try{
        return fn();
    } catch(error) {
        return defval;
    }
}


function zeroToNull(val)
{
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
