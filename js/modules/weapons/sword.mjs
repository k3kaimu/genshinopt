import * as Base from '/js/modules/weapons/base.mjs';


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


    applyDmgCalc(calc)
    {
        calc = super.applyDmgCalc(calc);

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

