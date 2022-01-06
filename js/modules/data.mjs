export * from '/js/modules/characters.mjs';
export * from '/js/modules/weapons.mjs';
export * from '/js/modules/artifacts.mjs';
export * from '/js/modules/buffeffect.mjs';

import * as Artifacts from '/js/modules/artifacts.mjs';
import * as BuffEffect from '/js/modules/buffeffect.mjs'

export const bufferEffects = [
    new BuffEffect.ConstantBufferEffect("art_noblesse_oblige_4", "旧貴族のしつけ：4セット効果", "A", "rateAtk", 0.2)
];


export function lookupBuffEffect(id)
{
    let ret = undefined;
    bufferEffects.forEach(e => {
        if(e.id == id)
            ret = e;
    });

    return ret;
}