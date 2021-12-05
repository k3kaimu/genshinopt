export * from '/js/modules/weapons/base.mjs';
export * from '/js/modules/weapons/bow.mjs';
export * from '/js/modules/weapons/catalyst.mjs';
export * from '/js/modules/weapons/claymore.mjs';
export * from '/js/modules/weapons/polearm.mjs';
export * from '/js/modules/weapons/sword.mjs';


import * as Base from '/js/modules/weapons/base.mjs';
import * as Bow from '/js/modules/weapons/bow.mjs';
import * as Catalyst from '/js/modules/weapons/catalyst.mjs';
import * as Claymore from '/js/modules/weapons/claymore.mjs';
import * as Polearm from '/js/modules/weapons/polearm.mjs';
import * as Sword from '/js/modules/weapons/sword.mjs';


export const weapons = [
    // 弓, 星5
    new Bow.SkywardHarp(),
    // 弓, 星4
    new Bow.Rust(),
    // 両手剣, 星4
    new Claymore.Whiteblind(),
    new Claymore.PrototypeArchaic(),
    // 長柄武器, 星5
    new Polearm.StaffOfHoma(),
    // 長柄武器, 星4
    new Polearm.DragonsBane(),
    // 片手剣, 星5
    new Sword.PrimordialJadeCutter(),
];
