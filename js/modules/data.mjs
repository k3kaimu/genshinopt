export * from '/js/modules/characters.mjs';
export * from '/js/modules/weapons.mjs';

import * as Characters from '/js/modules/characters.mjs';
import * as Weapons from '/js/modules/weapons.mjs';


export class ArtifactData
{
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
    }


    newViewModel()
    {
        return new ArtifactViewModel(this);
    }
}


export class ArtifactViewModel
{
    // bonusType: '2' or '4'
    constructor(data, bonusType)
    {
        this.parent = data;
        this.bonusType = bonusType;
    }


    viewHTMLList(target)
    {
        return [];
    }
}


// 燃え盛る炎の魔女
export class CrimsonWitchOfFlames extends ArtifactData
{
    constructor()
    {
        super(
            'crimson_witch_of_flames',
            "燃え盛る炎の魔女"
        )
    }


    newViewModel()
    {
        return new CrimsonWitchOfFlamesViewModel(this);
    }
}


// 燃え盛る炎の魔女, ViewModel
export class CrimsonWitchOfFlamesViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffStacks = ko.observable();
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                `
                <div class="card">
                    <div class="card-header p-2">火魔女：炎ダメバフ</div>
                    <div class="card-body p-2">
                        <div class="form-group m-0">
                            <div class="form-check" data-bind="with: ` + target + `">
                                <select class="custom-select" aria-label="バフ効果量" data-bind="value: buffStacks">
                                    <option value="0">+15.0%</option>
                                    <option value="1">+22.5%</option>
                                    <option value="2">+30.0%</option>
                                    <option selected value="3">+37.5%</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                `);
        }

        return list;
    }
}


// 追憶のしめ縄
export class ShimenawaReminiscence extends ArtifactData
{
    constructor()
    {
        super(
            'shimenawa_reminiscence',
            "追憶のしめ縄"
        );
    }


    newViewModel()
    {
        return new ShimenawaReminiscenceViewModel(this);
    }
}


// 追憶のしめ縄, ViewModel
export class ShimenawaReminiscenceViewModel extends ArtifactViewModel
{
    constructor(parent, bonusType)
    {
        super(parent, bonusType);
        this.buffEffect = ko.observable();
    }


    viewHTMLList(target)
    {
        var list = [];

        if(this.bonusType == '4') {
            list.push(
                `
                <div class="card">
                    <div class="card-header p-2">しめ縄：ダメバフ</div>
                    <div class="card-body p-2">
                        <div class="form-group m-0">
                            <div class="form-check" data-bind="with: ` + target + `">
                                <label class="form-check-label">
                                    <input class="form-check-input" type="checkbox" data-bind="checked: buffEffect" checked>
                                    通常・重撃・落下+50%ダメバフ（元素エネ15消費）
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                `);
        }

        return list;
    }
}


export const genshinData = {
    artifacts: [
        new CrimsonWitchOfFlames(),
        new ShimenawaReminiscence(),
    ],
};
