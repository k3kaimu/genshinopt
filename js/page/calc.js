import * as Data from '/js/modules/data.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Migrator from '/js/modules/migrator.mjs'
import * as UI from '/js/modules/ui.mjs'

$(function(){
    function ViewModel()
    {
        this.readyNLopt = ko.observable(false);
        
        this.characterSelector = new UI.CharacterSelector();
        this.weaponSelector = new UI.WeaponSelector(this.characterSelector.selected);
        this.artifactSelector = new UI.ArtifactSelector();
    }


    window.viewModel = new ViewModel();
    ko.applyBindings(window.viewModel);

    function loadDataFromURI(version, uri)
    {
        let migrated = Migrator.calcDataMigrator.migrate(version, decodeFromURI(uri));
        viewModel.fromJS(migrated);
    }

    (async () => {
        await nlopt.ready
        viewModel.readyNLopt(true);

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
