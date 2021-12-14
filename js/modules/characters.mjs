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
    new Electro.TravelerElectro(),
    new Geo.TravelerGeo(),
    new Geo.AratakiItto(),
    new Geo.Noelle(),
    new Hydro.Tartaglia(),
    new Pyro.HuTao(),
    new Pyro.Yanfei(),
];


export function lookupCharacter(id) {
    console.log(id);
    let res = undefined;
    characters.forEach(e => {
        if(e.id == id) {
            res = e;
            console.log(e);
        }
    });

    console.log(res);
    return res;
}


runUnittest(function(){
    console.assert(lookupCharacter("traveler_anemo").id == "traveler_anemo");
    console.assert(lookupCharacter("hu_tao").id == "hu_tao");
});
