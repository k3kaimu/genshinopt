import * as Base from '/js/modules/weapons/base.mjs'


// 護摩の杖
export class StaffOfHoma extends Base.WeaponData
{
    constructor()
    {
        super(
            "staff_of_homa",
            "護摩の杖",
            5,
            "Polearm",
            608,
            "baseCrtDmg",
            0.662
        );
    }


    newViewModel()
    {
        return new StaffOfHomaViewModel(this);
    }
}


// 護摩の杖, ViewModel
export class StaffOfHomaViewModel extends Base.WeaponViewModel
{
    constructor(data)
    {
        super(data);
        this.selLowHighHP = ko.observable("lowHP");
    }


    viewHTMLList(target)
    {
        var uid = genUniqueId();

        return [
            `
            <div class="card">
                <div class="card-header p-2">攻撃力上昇効果</div>
                <div class="card-body p-2">
                <div class="form-group" data-bind="with: `+target+`">
                    <div class="form-check">
                    <label class="form-check-label">
                        <input class="form-check-input" type="radio" name="`+target+uid+`" value="highHP" data-bind="checked: selLowHighHP">
                        HP上限の0.8%分攻撃力上昇
                    </label>
                    </div>
                    <div class="form-check">
                    <label class="form-check-label">
                        <input class="form-check-input" type="radio" name="`+target+uid+`" value="lowHP" data-bind="checked: selLowHighHP">
                        HP上限の1.8%分攻撃力上昇
                    </label>
                    </div>
                </div>
                </div>
            </div>
            `
        ]
    }
}
