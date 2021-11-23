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



// 旅人（雷）
export class TravelerElectro extends Base.CharacterData
{
    constructor()
    {
        super(
            "traveler_anemo",
            "旅人(雷)",
            5,
            "Electro",
            "Sword",
            213,        /* bAtk */
            682,        /* bDef */
            10875,      /* bHP */
            "rateAtk",  /* bBonusType */
            0.24        /* bBonusValue */
            );
    }
}



// 胡桃
export class HuTao extends Base.CharacterData
{
    constructor()
    {
        super(
            "hu_tao",
            "胡桃",
            5,
            "Pyro",
            "Polearm",
            106,            /* bAtk */
            876,            /* bDef */
            15552,          /* bHP */
            "baseCrtDmg",   /* bBonusType */
            0.384           /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new HuTaoViewModel(this);
    }
}


export class HuTaoViewModel extends Base.CharacterViewModel
{
    constructor(ch)
    {
        super(ch);
        this.hpLowerThan50 = ko.observable(true);
        this.useC6Effect = ko.observable();
    }


    viewHTMLList(target)
    {
        return [
            `
            <div class="card">
                <div class="card-header p-2">血のかまど</div>
                <div class="card-body p-2">
                    <div class="form-group m-0">
                        <div class="form-check" data-bind="with: ` + target + `">
                            <label class="form-check-label">
                                <input class="form-check-input" type="checkbox" data-bind="checked: hpLowerThan50" checked>
                                +33%炎ダメ（HP50%以下）
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            `,
            `
            <div data-bind="if: $root.selConstellation() >= 6">
                <div class="card">
                    <div class="card-header p-2">冥蝶の抱擁（6凸効果）</div>
                        <div class="card-body p-2">
                            <div class="form-group m-0">
                                <div class="form-check" data-bind="with: ` + target + `">
                                    <label class="form-check-label">
                                        <input class="form-check-input" type="checkbox" data-bind="checked: useC6Effect" checked>
                                        会心率+100%
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `
        ];
    }
}


export const characters = [
    new Anemo.TravelerAnemo(),
    new Geo.TravelerGeo(),
    new TravelerElectro(),
    new HuTao(),
];