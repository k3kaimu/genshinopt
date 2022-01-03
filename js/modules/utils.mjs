import * as Data from '/js/modules/data.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';


export function makeUnittestForCharacter(id)
{
    let c = Data.lookupCharacter(id);
    let cvm = c.newViewModel();
    cvm.constell(6);
    let cvmobj = cvm.toJS();

    let calc = new Calc.DamageCalculator();
    calc = cvm.applyDmgCalc(calc);
    calc = (new Data.TestWeapon(c.weaponType)).newViewModel().applyDmgCalc(calc);
    calc = (new Data.TestArtifact()).newViewModel(4).applyDmgCalc(calc);

    let results = {};
    cvm.presetAttacks().forEach(e => {
        results[e.id] = e.evaluate(calc).value;
    });

    return {vm: cvmobj, expected: results};
}


export function checkUnittestForCharacter(character, setting)
{
    let c = character;
    let cvm = c.newViewModel();
    cvm.fromJS(setting.vm);

    let calc = new Calc.DamageCalculator();
    calc = cvm.applyDmgCalc(calc);
    calc = (new Data.TestWeapon(c.weaponType)).newViewModel().applyDmgCalc(calc);
    calc = (new Data.TestArtifact()).newViewModel(4).applyDmgCalc(calc);

    let ok = true;
    cvm.presetAttacks().forEach(e => {
        let val = e.evaluate(calc).value;
        ok = ok && ( Math.round(val) == Math.round(setting.expected[e.id]) );
    });

    return ok;
}


export function makeUnittestForWeapon(id, elem)
{
    let w = Data.lookupWeapon(id);
    let wvm = w.newViewModel();
    let wvmobj = wvm.toJS();

    let results = {};
    let cvm = (new Data.TestCharacter(elem, w.weaponType)).newViewModel();
    results[elem] = {};

    let calc = new Calc.DamageCalculator();
    calc = cvm.applyDmgCalc(calc);
    calc = wvm.applyDmgCalc(calc);
    calc = (new Data.TestArtifact()).newViewModel(4).applyDmgCalc(calc);

    cvm.presetAttacks().forEach(e => {
        results[e.id] = e.evaluate(calc).value;
    });

    return {vm: wvmobj, expected: results};
}


export function checkUnittestForWeapon(weapon, elem, setting)
{
    let w = weapon;
    let wvm = w.newViewModel();
    wvm.fromJS(setting.vm);

    let results = {};

    let ok = true;
    let cvm = (new Data.TestCharacter(elem, w.weaponType)).newViewModel();

    let calc = new Calc.DamageCalculator();
    calc = cvm.applyDmgCalc(calc);
    calc = wvm.applyDmgCalc(calc);
    calc = (new Data.TestArtifact()).newViewModel(4).applyDmgCalc(calc);

    cvm.presetAttacks().forEach(e => {
        let val = e.evaluate(calc).value;

        // search
        ok = ok && ( Math.round(val) == Math.round(setting.expected[e.id]) );
    });

    return ok;
}


export function makeUnittestForArtifact(id, elem, type)
{
    let cvm = (new Data.TestCharacter(elem, type)).newViewModel();
    let wvm = (new Data.TestWeapon(type)).newViewModel();
    let avm = Data.lookupArtifact(id).newViewModel(4);

    let calc = new Calc.DamageCalculator();
    calc = cvm.applyDmgCalc(calc);
    calc = wvm.applyDmgCalc(calc);
    calc = avm.applyDmgCalc(calc);

    let results = {};
    cvm.presetAttacks().forEach(e => {
        results[e.id] = e.evaluate(calc).value;
    });

    return {vm: avm.toJS(), expected: results};
}


export function checkUnittestForArtifact(artifact, elem, type, setting)
{
    let cvm = (new Data.TestCharacter(elem, type)).newViewModel();
    let wvm = (new Data.TestWeapon(type)).newViewModel();
    let avm = artifact.newViewModel(4);
    avm.fromJS(setting.vm);

    let calc = new Calc.DamageCalculator();
    calc = cvm.applyDmgCalc(calc);
    calc = wvm.applyDmgCalc(calc);
    calc = avm.applyDmgCalc(calc);

    let ok = true;
    cvm.presetAttacks().forEach(e => {
        let val = e.evaluate(calc).value;

        // search
        ok = ok && ( Math.round(val) == Math.round(setting.expected[e.id]) );
    });

    return ok;
}


export function checkSerializationUnittest(vm)
{
    let obj = vm.toJS();
    let keys = Object.keys(obj);
    
    keys.forEach(k => {
        let v = obj[k];
        if((typeof v) === "number") {
            obj[k] += 1;
        } else if((typeof v) === "boolean") {
            obj[k] = !obj[k];
        }
    });

    vm.fromJS(obj);
    let newobj = vm.toJS(obj);

    let ok = true;
    keys.forEach(k => {
        ok = ok && (obj[k] == newobj[k]);
    });

    return ok;
}

