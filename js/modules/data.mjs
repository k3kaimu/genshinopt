export * from '/js/modules/characters.mjs';
export * from '/js/modules/weapons.mjs';
export * from '/js/modules/artifacts.mjs';
export * from '/js/modules/buffeffect.mjs';

import * as Characters from '/js/modules/characters.mjs';
import * as Artifacts from '/js/modules/artifacts.mjs';
import * as BuffEffect from '/js/modules/buffeffect.mjs'

export const bufferEffects = [
    new BuffEffect.ConstantBufferEffect("elem_pyro", "炎元素共鳴：攻撃力+25%", "E", {"rateAtk": 0.25}),
    new BuffEffect.ConstantBufferEffect("elem_cryo", "氷元素共鳴：会心率+15%", "E", {"baseCrtRate": 0.15}),
    new BuffEffect.ConstantBufferEffect("elem_geo", "岩元素共鳴：ダメージ+15%，岩耐性-20%，シールド強化+15%", "E", {"baseAllDmg": 0.15, "baseGeoResis": -0.20, "baseRateShieldStrength": 0.15 }),
    new BuffEffect.ConstantBufferEffect("art_noblesse_oblige_4", "旧貴族のしつけ4：攻撃力+20%", "A", {"rateAtk": 0.2}),
    new BuffEffect.BufferEffectViewModelFactory("yun_jin", "雲菫", "C", (parent) => new Characters.YunJinBufferViewModel(parent)),
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