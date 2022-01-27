import * as Data from './data.mjs';
import * as Calc from './dmg-calc.mjs';


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
    let checkUniqe = {};
    cvm.presetAttacks().forEach(e => {
        let val = e.evaluate(calc).value;
        ok = ok && (isApproxEqual(val, setting.expected[e.id], undefined, 1e-3));

        // presetAttacks()のidがユニークか確認する
        if(e.id in checkUniqe)
            ok = false;
        
        checkUniqe[e.id] = true;
    });

    // 3凸と5凸でスキル・爆発の天賦レベルが+3されるかチェック
    {
        setting.vm.constell = 0;
        cvm.fromJS(setting.vm);
        let beforeSkill = cvm.maxSkillTalentRank();
        let beforeBurst = cvm.maxBurstTalentRank();

        setting.vm.constell = 5;
        cvm.fromJS(setting.vm);
        let afterSkill = cvm.maxSkillTalentRank();
        let afterBurst = cvm.maxBurstTalentRank();
        ok = ok && (afterSkill == beforeSkill + 3);
        ok = ok && (afterBurst == beforeBurst + 3);
    }

    return ok;
}


export function makeUnittestForWeapon(id, elem)
{
    let w = Data.lookupWeapon(id);
    let wvm = w.newViewModel();
    let wvmobj = wvm.toJS();

    let results = {};
    let cvm = (new Data.TestCharacter(elem, w.weaponType)).newViewModel();

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

    vm.fromJS(escapeHTML(obj));
    let newobj = vm.toJS();

    let ok = true;
    keys.forEach(k => {
        ok = ok && (obj[k] == newobj[k]);
    });

    return ok;
}


/**
 * @param {string} strtable 
 * @return {string}
 */
export function makeTalentTable(strtable, toLog=true)
{
    let table = strtable.split('\n').map(line => {
        let elems = line.split('\t');
        if(elems[0].startsWith('Lv.'))
            elems = elems.slice(1);

        elems = elems.map(e => {
            e = e.split("x");       // 掛け算（エックス"x"）で区切る
            if(e.length == 1) {
                // xなんてなかった場合
                e = e[0];
            } else {
                return "[" + (new Array(Number(e[1]))).fill(percentToNumber(e[0])).join(", ") + "]";
            }

            e = e.split(/[\/|\+]/); // スラッシュ "/" か プラス "+" で区切る
            if(e.length == 1)
                return percentToNumber(e[0]);
            else
                return percentToNumber(e);
        });

        return elems;
    });


    let result = table.map(row => "[" + row.join(", ") + "]" ).join(",\n");

    if(toLog)
        console.log(result);

    return result;
}


function percentToNumber(elems) {
    if(Array.isArray(elems)) {
        elems = elems.map(e => percentToNumber(e));
        return '[' + elems.join(', ') + ']';
    }

    if(elems.endsWith("%") || elems.endsWith("％"))
        return textNumberFix(Number(elems.replace(/[\%|％]/, '')) / 100, 3);
    else
        return elems;
}


/**
 * ys = mat * xsのベクトルxsを推定します．ここでxsは2要素ベクトルです．
 * matの型はnumber[2][ys.length]です．
 * @param {[number, number][]} mat 
 * @param {number[]} y
 * @return {[number, number]}
 */
export function estimateTwoParamLeastSquares(mat, ys)
{
    let len = ys.length;

    let gram = [[0, 0], [0, 0]];
    for(let i = 0; i < 2; ++i)
        for(let j = 0; j < 2; ++j)
            for(let n = 0; n < len; ++n)
                gram[i][j] += mat[n][i] * mat[n][j];


    let det = gram[0][0] * gram[1][1] - gram[1][0] * gram[0][1];
    let invgram = [[0, 0], [0, 0]];
    invgram[0][0] = +gram[1][1] / det;
    invgram[1][1] = +gram[0][0] / det;
    invgram[0][1] = -gram[0][1] / det;
    invgram[1][0] = -gram[1][0] / det;

    let matys = [0, 0];
    for(let i = 0; i < 2; ++i)
        for(let n = 0; n < len; ++n)
            matys[i] += mat[n][i] * ys[n];

    return [
        invgram[0][0] * matys[0] + invgram[0][1] * matys[1],
        invgram[1][0] * matys[0] + invgram[1][1] * matys[1]
    ];
}

runUnittest(function(){
    let coefs = estimateTwoParamLeastSquares(
        [[0.0, 1], [0.2, 1], [0.4, 1], [0.6, 1], [0.8, 1], [1.0, 1], [1.2, 1]],
        [1.0, 1.9, 3.2, 4.3, 4.8, 6.1, 7.2]);

    console.assert(isApproxEqual(coefs[0], 5.10714));
    console.assert(isApproxEqual(coefs[1], 1.00714));
});