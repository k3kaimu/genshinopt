export * from './characters.mjs';
export * from './weapons.mjs';
export * from './artifacts.mjs';
export * from './buffeffect.mjs';

import * as Characters from './characters.mjs';
import * as Artifacts from './artifacts.mjs';
import * as BuffEffect from './buffeffect.mjs';
import * as Weapons from './weapons.mjs';

export const bufferEffects = [
    new BuffEffect.ConstantBufferEffect("elem_pyro", "炎元素共鳴：攻撃力+25%", "E", {"rateAtk": 0.25}),
    new BuffEffect.ConstantBufferEffect("elem_cryo", "氷元素共鳴：会心率+15%", "E", {"baseCrtRate": 0.15}),
    new BuffEffect.ConstantBufferEffect("elem_geo", "岩元素共鳴：ダメージ+15%，岩耐性-20%，シールド強化+15%", "E", {"baseAllDmg": 0.15, "baseGeoResis": -0.20, "baseRateShieldStrength": 0.15 }),
    new BuffEffect.ConstantBufferEffect("art_noblesse_oblige_4", "旧貴族のしつけ4：攻撃力+20%", "A", {"rateAtk": 0.2}),
    new BuffEffect.BufferEffectViewModelFactory({id: "vaporize_melt"}, "蒸発・溶解", "E", (parent) => new BuffEffect.VaporizeMeltEffectViewModel(parent)),
    new BuffEffect.BufferEffectViewModelFactory(new Weapons.ThrillingTalesOfDragonSlayers(true), "竜殺しの英傑譚", "W", (parent) => parent.newBufferViewModel()),
    new BuffEffect.BufferEffectViewModelFactory(new Characters.Mona(), "モナ", "C", (parent) => new (Characters.MonaViewModel(BuffEffect.CharacterBufferEffectViewModel))(parent, true)),
    new BuffEffect.BufferEffectViewModelFactory(new Characters.Bennett(), "ベネット", "C", (parent) => new (Characters.BennettViewModel(BuffEffect.CharacterBufferEffectViewModel))(parent, true)),
    new BuffEffect.BufferEffectViewModelFactory(new Characters.Chongyun(), "重雲", "C", (parent) => new (Characters.ChongyunViewModel(BuffEffect.CharacterBufferEffectViewModel))(parent, true)),
    new BuffEffect.BufferEffectViewModelFactory(new Characters.Xingqiu(), "行秋", "C", (parent) => new (Characters.XingqiuViewModel(BuffEffect.CharacterBufferEffectViewModel))(parent, true)),
    new BuffEffect.BufferEffectViewModelFactory(new Characters.YunJin(), "雲菫", "C", (parent) => new Characters.YunJinBufferViewModel(parent)),
    new BuffEffect.BufferEffectViewModelFactory(new Characters.Shenhe(), "申鶴", "C", (parent) => new (Characters.ShenheViewModel(BuffEffect.CharacterBufferEffectViewModel))(parent, true)),
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