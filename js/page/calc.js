//@ts-check
import * as Data from '../modules/data.mjs';
import * as Calc from '../modules/dmg-calc.mjs';
import * as Migrator from '../modules/migrator.mjs'
import * as UI from '../modules/ui.mjs'


class ArtifactStatus
{
    constructor()
    {
        this.hp = ko.observable(0);
        this.atk = ko.observable(0);
        this.def = ko.observable(0);
        this.mastery = ko.observable(0);
        this.crtRate = ko.observable(0);
        this.crtDmg = ko.observable(0);
        this.healingBonus = ko.observable(0);
        this.recharge = ko.observable(0);
        this.shieldBonus = ko.observable(0);
        this.pyroDmg = ko.observable(0);
        this.hydroDmg = ko.observable(0);
        this.dendroDmg = ko.observable(0);
        this.electroDmg = ko.observable(0);
        this.anemoDmg = ko.observable(0);
        this.cryoDmg = ko.observable(0);
        this.geoDmg = ko.observable(0);
        this.physicalDmg = ko.observable(0);
    }


    static getValue(v)
    {
        let x = Number(v);
        if(isNaN(x))
            return 0;
        else
            return x;
    }


    /**
     * @param {Calc.DamageCalculator} calc 
     */
    applyDmgCalc(calc)
    {
        calc.addHP.value += ArtifactStatus.getValue(this.hp());
        calc.addAtk.value += ArtifactStatus.getValue(this.atk());
        calc.addDef.value += ArtifactStatus.getValue(this.def());
        calc.baseMastery.value += ArtifactStatus.getValue(this.mastery());
        calc.baseCrtRate.value += ArtifactStatus.getValue(this.crtRate());
        calc.baseCrtDmg.value += ArtifactStatus.getValue(this.crtDmg());
        calc.baseHealingBonus.value += ArtifactStatus.getValue(this.healingBonus());
        calc.baseRecharge.value += ArtifactStatus.getValue(this.recharge());
        calc.baseRateShieldStrength.value += ArtifactStatus.getValue(this.shieldBonus());
        calc.basePyroDmg.value += ArtifactStatus.getValue(this.pyroDmg());
        calc.baseHydroDmg.value += ArtifactStatus.getValue(this.hydroDmg());
        calc.baseDendroDmg.value += ArtifactStatus.getValue(this.dendroDmg());
        calc.baseElectroDmg.value += ArtifactStatus.getValue(this.electroDmg());
        calc.baseAnemoDmg.value += ArtifactStatus.getValue(this.anemoDmg());
        calc.baseCryoDmg.value += ArtifactStatus.getValue(this.cryoDmg());
        calc.baseGeoDmg.value += ArtifactStatus.getValue(this.geoDmg());
        calc.basePhysicalDmg.value += ArtifactStatus.getValue(this.physicalDmg());

        return calc;
    }
}


class CalcResult
{
    constructor(setting, calc)
    {
        this.attack = setting.bundle.attackSetting.makeAttackEvaluator(setting.bundle.characterVMSetting.viewModel());
        this.calc = calc;
    }
}


$(function(){
    function ViewModel()
    {
        this.bundleSetting = new UI.BundleSetting(true, undefined, true, true, true, true, true);
        this.artifactStatus = new ArtifactStatus();

        this.calculateResult = ko.computed(function(){
            if(!this.bundleSetting.isValid())
                return undefined;

            let calc = new Calc.DamageCalculator();
            calc = this.bundleSetting.applyDmgCalc(calc);
            calc = this.artifacts.applyDmgCalc(calc);
            return new CalcResult({bundle: this.bundleSetting, artifact: this.artifactStatus}, calc);
        }, this);
    }


    window.viewModel = new ViewModel();
    ko.applyBindings(window.viewModel);

    function loadDataFromURI(version, uri)
    {
        let migrated = Migrator.calcDataMigrator.migrate(version, decodeFromURI(uri));
        viewModel.fromJS(migrated);
    }

    (async () => {
        // await nlopt.ready
        // viewModel.readyNLopt(true);

        // ページロード時にgetパラメータにデータがあればそれを復元する
        try {
            var url = new URL(window.location.href);
            const uridata = url.searchParams.get('data');
            const verdata = url.searchParams.get('ver') || '0';    // データのバージョン

            if(uridata && verdata) {
                loadDataFromURI(verdata, uridata);
                viewModel.optimizeAllCases();
            }
        } catch(ex) {

        };
    })();
});
