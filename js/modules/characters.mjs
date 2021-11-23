export * from '/js/modules/characters/base.mjs';
export * from '/js/modules/characters/anemo.mjs';
export * from '/js/modules/characters/cryo.mjs';
export * from '/js/modules/characters/dendro.mjs';
export * from '/js/modules/characters/electro.mjs';
export * from '/js/modules/characters/geo.mjs';
export * from '/js/modules/characters/hydro.mjs';
export * from '/js/modules/characters/pyro.mjs';

import * as Base from '/js/modules/characters/base.mjs';
import * as Anemo from '/js/modules/characters/anemo.mjs';
import * as Cryo from '/js/modules/characters/cryo.mjs';
import * as Dendro from '/js/modules/characters/dendro.mjs';
import * as Electro from '/js/modules/characters/electro.mjs';
import * as Geo from '/js/modules/characters/geo.mjs';
import * as Hydro from '/js/modules/characters/hydro.mjs';
import * as Pyro from '/js/modules/characters/pyro.mjs';


export const characters = [
    new Anemo.TravelerAnemo(),
    new Geo.TravelerGeo(),
    new Electro.TravelerElectro(),
    new Pyro.HuTao(),
];
