(function () {
    'use strict'
  
    feather.replace();

    $(document).ready(function() {
        $(".multiselect").each(function(){
            $(this).multiselect();
        });
    });

})()


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
