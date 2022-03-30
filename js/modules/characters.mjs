export * from './characters/base.mjs';
export * from './characters/anemo.mjs';
export * from './characters/cryo.mjs';
export * from './characters/dendro.mjs';
export * from './characters/electro.mjs';
export * from './characters/geo.mjs';
export * from './characters/hydro.mjs';
export * from './characters/pyro.mjs';

import * as Base from './characters/base.mjs';
import * as Anemo from './characters/anemo.mjs';
import * as Cryo from './characters/cryo.mjs';
import * as Dendro from './characters/dendro.mjs';
import * as Electro from './characters/electro.mjs';
import * as Geo from './characters/geo.mjs';
import * as Hydro from './characters/hydro.mjs';
import * as Pyro from './characters/pyro.mjs';


export const characters = [
    // new Anemo.TravelerAnemo(),
    new Cryo.Qiqi(),
    new Cryo.Ganyu(),
    new Cryo.Shenhe(),
    new Cryo.Chongyun(),
    new Electro.RaidenShogun(),
    new Electro.YaeMiko(),
    new Electro.Beidou(),
    // new Electro.TravelerElectro(),
    // new Geo.TravelerGeo(),
    new Geo.AratakiItto(),
    new Geo.Albedo(),
    new Geo.Noelle(),
    new Geo.Ningguang(),
    new Geo.YunJin(),
    new Hydro.Mona(),
    new Hydro.Tartaglia(),
    new Hydro.KamisatoAyato(),
    new Hydro.Xingqiu(),
    new Pyro.Diluc(),
    new Pyro.Klee(),
    new Pyro.HuTao(),
    new Pyro.Yoimiya(),
    new Pyro.Bennett(),
    new Pyro.Xiangling(),
    new Pyro.Yanfei(),
];


export function lookupCharacter(id) {
    let res = undefined;
    characters.forEach(e => {
        if(e.id == id) {
            res = e;
        }
    });

    return res;
}


runUnittest(function(){
    // console.assert(lookupCharacter("traveler_anemo").id == "traveler_anemo");
    console.assert(lookupCharacter("hu_tao").id == "hu_tao");
});
