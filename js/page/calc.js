//@ts-check
import * as Data from '../modules/data.mjs';
import * as Calc from '../modules/dmg-calc.mjs';
import * as Migrator from '../modules/migrator.mjs'
import * as UI from '../modules/ui.mjs'


function newBundleSetting()
{
    return new UI.BundleSetting({
        bCharPicker: true,
        selectedChar: undefined,
        bTalent: true,
        bAttack: false,
        bWeapon: true,
        bArtifact: true,
        bArtifactStatus: true,
        bExternalBuff: true
    });
}


class CalcSetting
{
    constructor(bundleData)
    {
        this.setting = newBundleSetting();
        this.setting.fromJS(bundleData);
        this.calc = new Calc.DamageCalculator();

        // 設定をダメージ計算式に反映する
        this.calc = this.setting.applyDmgCalc(this.calc);

        this.normalAttacks = [];
        this.skillAttacks = [];
        this.burstAttacks = [];
        this.otherAttacks = [];

        // そのキャラクターのすべてのダメージの計算をする
        let cvm = this.setting.characterVMSetting.viewModel();
        let attacks = cvm.presetAttacks();
        attacks.forEach(attack => {
            let obj = {}
            obj.id = attack.id;
            obj.label = attack.label;
            obj.calc = this.calc;
            obj.attack = attack;
            obj.dmg = obj.attack.evaluate(this.calc);

            let pushed = false;
            if(attack.attackInfos(this.calc).map(a => a.props.isNormal || a.props.isCharged || a.props.isPlunge || false).reduce((a, b) => a || b, false)) {
                pushed = true;
                this.normalAttacks.push(obj);
            }

            if(attack.attackInfos(this.calc).map(a => a.props.isSkill || false).reduce((a, b) => a || b, false)) {
                pushed = true;
                this.skillAttacks.push(obj);
            }

            if(attack.attackInfos(this.calc).map(a => a.props.isBurst || false).reduce((a, b) => a || b, false)) {
                pushed = true;
                this.burstAttacks.push(obj);
            }

            if(!pushed) {
                this.otherAttacks.push(obj);
            }
        });
    }
}


class ViewModel
{
    constructor()
    {
        this.bundleSetting = newBundleSetting();

        this.calculateResult = ko.computed(function(){
            if(!this.bundleSetting.isValid())
                return undefined;

            return new CalcSetting(this.bundleSetting.toJS());
        }, this);
    }


    fromJS(obj) {
        this.bundleSetting.fromJS(obj);
    }


    toJS() {
        return this.bundleSetting.toJS();
    }
}


$(function(){
    let viewModel = new ViewModel()
    window.viewModel = viewModel;
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
