import * as Base from './base.mjs';
import * as Widget from '../widget.mjs';
import * as Calc from '../dmg-calc.mjs';
import * as Utils from '../utils.mjs';
import * as BuffEffect from '../buffeffect.mjs';
import * as TypeDefs from '../typedefs.mjs';


// 旅人（風）
export class TravelerAnemo extends Base.CharacterData
{
    constructor()
    {
        super(
            "traveler_anemo",
            "旅人(風)",
            5,
            "Anemo",
            "Sword",
            213,        /* bAtk */
            682,        /* bDef */
            10875,      /* bHP */
            "rateAtk",  /* bBonusType */
            0.24        /* bBonusValue */
            );
    }
}



// 楓原万葉
export class KaedeharaKazuha extends Base.CharacterData
{
    constructor()
    {
        super(
            "kazuha",
            "楓原万葉",
            5,
            TypeDefs.Element.Anemo,
            TypeDefs.WeaponType.Sword,
            [23, 60, 119, 154, 193, 227, 262, 297],
            [63, 163, 324, 417, 523, 617, 712, 807],
            [1039, 2695, 5366, 6902, 8659, 10213, 11777, 13348],
            TypeDefs.StaticStatusType.mastery,
            115,
        );
    }


    newViewModel()
    {
        return new (KaedeharaKazuhaViewModel(Base.CharacterViewModel))(this, false);
    }


    static normalTalentTable = [
        // 0-4: 通常, 5: 重撃, 6: 落下, 7-0:低空, 7-1:高空
        [0.450, 0.452, [0.258, 0.310], 0.607, new Array(3).fill(0.254), [0.430, 0.746], 0.818, [1.640, 2.040]],
        [0.486, 0.489, [0.279, 0.335], 0.657, new Array(3).fill(0.274), [0.465, 0.807], 0.885, [1.770, 2.210]],
        [0.523, 0.526, [0.300, 0.360], 0.706, new Array(3).fill(0.295), [0.500, 0.868], 0.952, [1.900, 2.380]],
        [0.575, 0.579, [0.330, 0.396], 0.777, new Array(3).fill(0.325), [0.550, 0.955], 1.047, [2.090, 2.610]],
        [0.612, 0.615, [0.351, 0.420], 0.826, new Array(3).fill(0.345), [0.585, 1.016], 1.113, [2.230, 2.780]],
        [0.654, 0.658, [0.375, 0.450], 0.883, new Array(3).fill(0.369), [0.625, 1.085], 1.189, [2.380, 2.970]],
        [0.711, 0.715, [0.408, 0.490], 0.960, new Array(3).fill(0.401), [0.680, 1.180], 1.294, [2.590, 3.230]],
        [0.769, 0.773, [0.441, 0.529], 1.038, new Array(3).fill(0.434), [0.735, 1.276], 1.399, [2.800, 3.490]],
        [0.826, 0.831, [0.474, 0.569], 1.115, new Array(3).fill(0.466), [0.790, 1.371], 1.503, [3.010, 3.750]],
        [0.889, 0.894, [0.510, 0.612], 1.200, new Array(3).fill(0.502), [0.850, 1.476], 1.618, [3.230, 4.040]],
        [0.961, 0.967, [0.551, 0.662], 1.297, new Array(3).fill(0.542), [0.919, 1.595], 1.732, [3.460, 4.330]]
    ];


    static skillTalentTable = [
        // 0:短おし，1:長押し
        [1.920, 2.610],
        [2.060, 2.800],
        [2.210, 3.000],
        [2.400, 3.260],
        [2.540, 3.460],
        [2.690, 3.650],
        [2.880, 3.910],
        [3.070, 4.170],
        [3.260, 4.430],
        [3.460, 4.690],
        [3.650, 4.960],
        [3.840, 5.220],
        [4.080, 5.440]
    ];


    static burstTalentTable = [
        // 0:斬撃ダメージ，1:継続ダメージ，2:付加元素ダメージ
        [2.620, 1.200, 0.360],
        [2.820, 1.290, 0.390],
        [3.020, 1.380, 0.410],
        [3.280, 1.500, 0.450],
        [3.480, 1.590, 0.480],
        [3.670, 1.680, 0.500],
        [3.940, 1.800, 0.540],
        [4.200, 1.920, 0.580],
        [4.460, 2.040, 0.610],
        [4.720, 2.160, 0.650],
        [4.990, 2.280, 0.680],
        [5.250, 2.400, 0.720],
        [5.580, 2.550, 0.770]
    ];


    static presetAttacks = [
        {
            id: "normal_total",
            label: "通常5段累計",
            dmgScale(vm){ return vm.normalTalentRow().slice(0, 5); },
            attackProps(vm){
                if(vm.useC6Anemo)
                    return {isNormal: true, isAnemo: true};
                else
                    return {isNormal: true, isPhysical: true};
            }
        },
        {
            id: "plunge_low_normal",
            label: "低空落下",
            dmgScale(vm){ return vm.normalTalentRow()[7][0]; },
            // attackProps: { isPlunge: true, isPhysical: true }
            attackProps(vm){
                if(vm.useAnemoPlunge)
                    return { isPlunge: true, isAnemo: true };
                else
                    return { isPlunge: true, isPhysical: true };
            }
        },
        {
            id: "plunge_high_normal",
            label: "高空落下",
            dmgScale(vm){ return vm.normalTalentRow()[7][1]; },
            attackProps(vm){
                if(vm.useAnemoPlunge)
                    return { isPlunge: true, isAnemo: true };
                else
                    return { isPlunge: true, isPhysical: true };
            }
        },
        {
            id: "skill_short",
            label: "スキル（短押し）",
            dmgScale(vm) { return vm.skillTalentRow()[0]; },
            attackProps: { isSkill: true, isAnemo: true }
        },
        {
            id: "skill_long",
            label: "スキル（長押し）",
            dmgScale(vm) { return vm.skillTalentRow()[1]; },
            attackProps: { isSkill: true, isAnemo: true }
        },
        {
            id: "skill_plunge_EA",
            label: "スキル元素変化ダメージ（200%）",
            dmgScale(vm) { return 2.00; },
            attackProps(vm) {
                let p = { isPlunge: true };
                p[vm.absorbedElement()] = true;

                return p;
            },
        },
        {
            id: "burst_slash_dmg",
            label: "元素爆発：斬撃ダメージ",
            dmgScale(vm) { return vm.burstTalentRow()[0]; },
            attackProps: { isBurst: true, isAnemo: true, }
        },
        {
            id: "burst_const_dmg",
            label: "元素爆発：継続ダメージ",
            dmgScale(vm) { return vm.burstTalentRow()[1]; },
            attackProps: { isBurst: true, isAnemo: true, }
        },
        {
            id: "burst_ea_dmg",
            label: "元素爆発：元素変化ダメージ",
            dmgScale(vm) { return vm.burstTalentRow()[2]; },
            attackProps(vm) {
                let p = {isBurst: true};
                p[vm.absorbedElement()] = true;
                return p;
            }
        },
    ];
}



// 楓原万葉
export let KaedeharaKazuhaViewModel = (Base) => class extends Base
{
    constructor(parent, isBuffer)
    {
        super(parent);
        this.isBuffer = isBuffer;

        if(!isBuffer) {
            // 元素変化の対象元素選択
            this.registerTalent({
                type: "Other",
                requiredC: 0,
                uiList: [{
                    type: "select",
                    name: "absorbedElement",
                    init: "isPyro",
                    label: (vm) => "元素変化",
                    options: (vm) => [
                        {label: "炎元素", value: "isPyro"},
                        {label: "氷元素", value: "isCryo"},
                        {label: "水元素", value: "isHydro"},
                        {label: "雷元素", value: "isElectro"},
                        {label: "草元素", value: "isDendro"}],
                }],
                effect: undefined
            });

            // スキル後の落下攻撃で風元素になるかの選択
            this.registerTalent({
                type: "Skill",
                requiredC: 0,
                uiList: [{
                    type: "checkbox",
                    name: "useAnemoPlunge",
                    init: true,
                    label: (vm) => "落下攻撃に風元素付与",
                }],
                effect: undefined
            });
        }

        // 拡散での元素ダメージバフ
        this.registerTalent({
            type: "Other",
            requiredC: 0,
            uiList: [
                {
                    type: "checkbox",
                    name: "useElementDmgBuff",
                    init: true,
                    label: (vm) => "元素ダメージバフ（拡散後）",
                },
                {
                    type: "select",
                    name: "targetElementDmgBuff",
                    init: "isPyro",
                    label: (vm) => "ダメージバフ対象の元素",
                    options: (vm) => [
                        {label: "炎元素", value: "isPyro"},
                        {label: "氷元素", value: "isCryo"},
                        {label: "水元素", value: "isHydro"},
                        {label: "雷元素", value: "isElectro"},
                        {label: "草元素", value: "isDendro"}],
                },
                !isBuffer ? undefined : {
                    type: "number",
                    name: "masteryKazuha",
                    init: 1000,
                    label: (vm) => "万葉の熟知",
                }
            ],
            effect: {
                cond: (vm) => vm.useElementDmgBuff(),
                list: !isBuffer ? [
                    {
                        target: TypeDefs.DynamicStatusType.pyroDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => calc.mastery(props).mul(0.0004).mul( vmdata.targetElementDmgBuff == "isPyro" ? 1 : 0)
                    },
                    {
                        target: TypeDefs.DynamicStatusType.cryoDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => calc.mastery(props).mul(0.0004).mul( vmdata.targetElementDmgBuff == "isCryo" ? 1 : 0)
                    },
                    {
                        target: TypeDefs.DynamicStatusType.hydroDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => calc.mastery(props).mul(0.0004).mul( vmdata.targetElementDmgBuff == "isHydro" ? 1 : 0)
                    },
                    {
                        target: TypeDefs.DynamicStatusType.electroDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => calc.mastery(props).mul(0.0004).mul( vmdata.targetElementDmgBuff == "isElectro" ? 1 : 0)
                    },
                    {
                        target: TypeDefs.DynamicStatusType.dendroDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => calc.mastery(props).mul(0.0004).mul( vmdata.targetElementDmgBuff == "isDendro" ? 1 : 0)
                    }
                ]
                :
                [
                    {
                        target: TypeDefs.DynamicStatusType.pyroDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => vmdata.masteryKazuha * 0.0004 * ( vmdata.targetElementDmgBuff == "isPyro" ? 1 : 0)
                    },
                    {
                        target: TypeDefs.DynamicStatusType.cryoDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => vmdata.masteryKazuha * 0.0004 * ( vmdata.targetElementDmgBuff == "isCryo" ? 1 : 0)
                    },
                    {
                        target: TypeDefs.DynamicStatusType.hydroDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => vmdata.masteryKazuha * 0.0004 * ( vmdata.targetElementDmgBuff == "isHydro" ? 1 : 0)
                    },
                    {
                        target: TypeDefs.DynamicStatusType.electroDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => vmdata.masteryKazuha * 0.0004 * ( vmdata.targetElementDmgBuff == "isElectro" ? 1 : 0)
                    },
                    {
                        target: TypeDefs.DynamicStatusType.dendroDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => vmdata.masteryKazuha * 0.0004 * ( vmdata.targetElementDmgBuff == "isDendro" ? 1 : 0)
                    }
                ]
            }
        })

        if(!isBuffer) {
            // 6凸効果：通常攻撃に風元素付与するかどうかと，通常攻撃などのダメージバフ
            this.registerTalent({
                type: "Other",
                requiredC: 6,
                uiList: [{
                    type: "checkbox",
                    name: "useC6Anemo",
                    init: true,
                    label: (vm) => "風元素付与（6凸効果）"
                }],
                effect: {
                    cond: (vm) => true,
                    list: [{
                        target: TypeDefs.DynamicStatusType.normalDmg,
                        isDynamic: true,
                        condAttackProps: (props) => true,
                        value: (vmdata, calc, props) => calc.mastery(props).mul(0.002)
                    }]
                }
            });
        }
    }

    
    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new KaedeharaKazuha(),
        {
            "vm": {
                "level": "90",
                "parent_id": "kazuha",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "absorbedElement": "isPyro",
                "useAnemoPlunge": true,
                "useElementDmgBuff": true,
                "targetElementDmgBuff": "isPyro",
                "useC6Anemo": true
            },
            "expected": {
                "normal_total": 1541.5946807624996,
                "plunge_low_normal": 723.6754874999998,
                "plunge_high_normal": 901.5890625000001,
                "skill_short": 783.7814249999999,
                "skill_long": 1065.0772124999999,
                "skill_plunge_EA": 502.966485,
                "burst_slash_dmg": 1072.2899249999998,
                "burst_const_dmg": 490.46445000000006,
                "burst_ea_dmg": 153.40477792500002,
                "__elemReact_Swirl_Cryo__": 1460.8255319148936,
                "__elemReact_Swirl_Dendro__": 1460.8255319148936,
                "__elemReact_Swirl_Electro__": 1460.8255319148936,
                "__elemReact_Swirl_Hydro__": 1460.8255319148936,
                "__elemReact_Swirl_Pyro__": 1460.8255319148936
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new KaedeharaKazuha().newViewModel()
    ));
});