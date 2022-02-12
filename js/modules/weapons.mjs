export * from './weapons/base.mjs';
export * from './weapons/bow.mjs';
export * from './weapons/catalyst.mjs';
export * from './weapons/claymore.mjs';
export * from './weapons/polearm.mjs';
export * from './weapons/sword.mjs';


import * as Base from './weapons/base.mjs';
import * as Bow from './weapons/bow.mjs';
import * as Catalyst from './weapons/catalyst.mjs';
import * as Claymore from './weapons/claymore.mjs';
import * as Polearm from './weapons/polearm.mjs';
import * as Sword from './weapons/sword.mjs';


export const weapons = [
    // 弓, 星5
    new Bow.AmosBow(),
    new Bow.SkywardHarp(),
    new Bow.ElegyForTheEnd(),
    new Bow.ThunderingPulse(),
    new Bow.PolarStar(),
    // 弓, 星4
    new Bow.FavoniusWarbow(),
    new Bow.SacrificialBow(),
    new Bow.Rust(),
    new Bow.TheStringless(),
    new Bow.AlleyHunter(),
    new Bow.RoyalBow(),
    new Bow.PrototypeCrescent(),
    new Bow.BlackcliffWarbow(),
    // 法器，星5,
    new Catalyst.SkywardAtlas(),
    new Catalyst.LostPrayerToTheSacredWinds(),
    new Catalyst.MemoryOfDust(),
    new Catalyst.EverlastingMoonglow(),
    // 法器，星4
    new Catalyst.FavoniusCodex(),
    new Catalyst.TheWidsith(),
    new Catalyst.MappaMare(),
    // 両手剣, 星5
    new Claymore.RedhornStonethresher(),
    // 両手剣, 星4
    new Claymore.Whiteblind(),
    new Claymore.PrototypeArchaic(),
    new Claymore.SerpentSpine(),
    new Claymore.LuxuriousSeaLord(),
    // 長柄武器, 星5
    new Polearm.PrimordialJadeWingedSpear(),
    new Polearm.SkywardSpine(),
    new Polearm.VortexVanquisher(),
    new Polearm.StaffOfHoma(),
    new Polearm.EngulfingLightning(),
    new Polearm.CalamityQueller(),
    // 長柄武器, 星4
    new Polearm.FavoniusLance(),
    new Polearm.DragonsBane(),
    new Polearm.LithicSpear(),
    new Polearm.RoyalSpear(),
    new Polearm.BlackcliffPole(),
    new Polearm.PrototypeStarglitter(),
    new Polearm.CrescentPike(),
    new Polearm.Deathmatch(),
    new Polearm.DragonspineSpear(),
    new Polearm.KitainCrossSpear(),
    new Polearm.TheCatch(),
    new Polearm.WavebreakersFin(),
    // 長柄武器, 星3
    new Polearm.BlackTassel(),
    new Polearm.Halberd(),
    new Polearm.WhiteTassel(),
    // 片手剣, 星5
    new Sword.PrimordialJadeCutter(),
    // 片手剣, 星4
    new Sword.SacrificialSword(),
    new Sword.CinnabarSpindle(),
];


export function lookupWeapon(id)
{
    let ret = undefined;
    weapons.forEach(e => {
        if(e.id == id)
            ret = e;
    });

    return ret;
}


runUnittest(function(){
    console.assert(lookupWeapon("staff_of_homa").id == "staff_of_homa");
});
