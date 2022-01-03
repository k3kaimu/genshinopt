import * as Base from '/js/modules/weapons/base.mjs';
import * as Utils from '/js/modules/utils.mjs';

// 磐岩結緑
export class PrimordialJadeCutter extends Base.WeaponData
{
    constructor()
    {
        super(
            "primordial_jade_cutter",
            "磐岩結緑",
            5,
            "Sword",
            542,
            "baseCrtRate",
            0.441
        );
    }


    newViewModel()
    {
        return new PrimordialJadeCutterViewModel(this);
    }


    static hpInc = [0.20, 0.25, 0.30, 0.35, 0.40];
    static atkInc = [0.012, 0.015, 0.018, 0.021, 0.024];
}


// 磐岩結緑
export class PrimordialJadeCutterViewModel extends Base.WeaponViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let data = this.toJS();
        data.atkInc = PrimordialJadeCutter.atkInc[data.rank];
        calc.rateHP.value += PrimordialJadeCutter.hpInc[data.rank];

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            priJadeCutData = data;

            atk(attackProps) {
                return super.atk(attackProps).add(this.hp(attackProps).mul(this.priJadeCutData.atkInc));
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForWeapon(
        new PrimordialJadeCutter(),
        "Anemo",
        {
            "vm": {
                "parent_id": "primordial_jade_cutter",
                "rank": 0
            },
            "expected": {
                "normal_100": 457.90002000000004,
                "normal_elem_100": 457.90002000000004,
                "skill_100": 457.90002000000004,
                "burst_100": 457.90002000000004
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new PrimordialJadeCutter().newViewModel()
    ));
});
