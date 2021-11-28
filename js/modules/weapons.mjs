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
    new Claymore.Whiteblind(),
    new Claymore.PrototypeArchaic(),
    new Polearm.StaffOfHoma(),
    new Polearm.DragonsBane(),
    new Sword.PrimordialJadeCutter(),
];
