'use strict';
import * as Data from '/js/modules/data.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Migrator from '/js/modules/migrator.mjs'
import * as UI from '/js/modules/ui.mjs'


$(function(){
    function MultiWeaponAdderModal(parent)
    {
        this.parent = parent;
        this.selWeaponRarity = ko.observable();


        this.weapons = [];
        Data.weapons.forEach(e => {
            this.weapons.push({
                weapon: e,
                checked: ko.observable(false)
            });
        });

        this.selWeaponList = ko.pureComputed(function(){
            var list = [];
            var rarity = this.selWeaponRarity();
            var ch = this.parent.selectedChar();

            this.weapons.forEach(e => {
                if(!(rarity == "ALL" || e.weapon.rarity == rarity))
                    return;

                if(ch != undefined && ch.weaponType != e.weapon.weaponType)
                    return;

                list.push(e);
            });

            return list;
        }.bind(this));

        this.addWeapons = function(){
            var removeList = [];
            this.parent.comparingWeaponList().forEach(e => {
                if(e.selected() == undefined)
                    removeList.push(e);
            });
            
            removeList.forEach(function(e) { this.parent.comparingWeaponList.remove(e); }.bind(this));

            this.weapons.forEach(e => {
                if(e.checked()) {
                    var wp = new UI.WeaponSelector(this.parent.selectedChar);
                    wp.selected(e.weapon);
                    this.parent.comparingWeaponList.push(wp);
                }
            });
        }.bind(this);

        this.uncheckALL = function(){
            this.weapons.forEach(e => {
                e.checked(false);
            });
        }.bind(this);

        this.checkALL = function() {
            this.selWeaponList().forEach(e => {
                e.checked(true);
            });
        }.bind(this);
    }

    function ViewModel() {
        this.readyNLopt = ko.observable();
    
        this.characterSelector = new UI.CharacterSelector();
        this.selectedChar = this.characterSelector.selected;

        this.comparingWeaponList = ko.observableArray();

        this.addComparingWeapon = function()
        {
            this.comparingWeaponList.push(new UI.WeaponSelector(this.selectedChar));
        }.bind(this);

        
        this.multiWeaponAdderModal = new MultiWeaponAdderModal(this);
        this.initMultiWeaponAdder = function(){
            this.multiWeaponAdderModal.uncheckALL();
        }.bind(this);


        this.comparingArtifactList = ko.observableArray();

        this.addComparingArtifact = function()
        {
            this.comparingArtifactList.push(new UI.ArtifactSelector());
        }.bind(this);

        this.clockMainStatus = [
            { value: "ATK%",        label:"攻撃力%",            checked: ko.observable(true) },
            { value: "DEF%",        label:"防御力%",            checked: ko.observable(false) },
            { value: "HP%",         label:"HP%",                checked: ko.observable(false) },
            { value: "Mastery",     label:"元素熟知",           checked: ko.observable(false) },
            { value: "Recharge",    label:"元素チャージ効率",   checked: ko.observable(false) },
        ];

        this.cupMainStatus = [
            { value: "ATK%",    label: "攻撃力%",               checked: ko.observable(false) },
            { value: "DEF%",    label: "防御力%",               checked: ko.observable(false) },
            { value: "HP%",     label: "HP%",                   checked: ko.observable(false) },
            { value: "Mastery", label: "元素熟知",              checked: ko.observable(false) },
            { value: "PhyDmg",  label: "物理ダメージ",          checked: ko.observable(false) },
            { value: "ElmDmg",  label: "キャラ属性ダメージ",    checked: ko.observable(true) },
        ];

        this.hatMainStatus = [
            { value: "ATK%",    label: "攻撃力%",           checked: ko.observable(false) },
            { value: "DEF%",    label: "防御力%",           checked: ko.observable(false) },
            { value: "HP%",     label: "HP%",               checked: ko.observable(false) },
            { value: "Mastery", label: "元素熟知",          checked: ko.observable(false) },
            { value: "CrtRate", label: "会心率",            checked: ko.observable(true) },
            { value: "CrtDmg",  label: "会心ダメージ",      checked: ko.observable(true) },
            { value: "Heal",    label: "与える治癒効果",    checked: ko.observable(false) },
        ];

        this.comparingExternalBuffList = ko.observableArray();

        this.selectLastOfExternalBuffList = function() {
            $(`#external_buff_list .nav-link`).removeClass("active");
            $(`#external_buff_list .tab-pane`).removeClass("active");

            let lastIndex = this.comparingExternalBuffList().length;
            $(`#external_buff_list ul li:nth-child(${lastIndex}) a`).tab('show');
        }.bind(this);

        this.addComparingExternalBuff = function(){
            this.comparingExternalBuffList.push(new UI.ExternalBuffSetting());
            this.selectLastOfExternalBuffList();
        }.bind(this);

        this.dupComparingExternalBuff = function(index){
            let srcObj = this.comparingExternalBuffList()[index].toJS();
            this.addComparingExternalBuff();
            this.comparingExternalBuffList().at(-1).fromJS(srcObj);
        }.bind(this);

        this.removeComparingExternalBuff = function(index) {
            let target = this.comparingExternalBuffList()[index];
            this.comparingExternalBuffList.remove(target);
            this.selectLastOfExternalBuffList();
        }.bind(this);

        this.optTotalCost = ko.observable();


        // 評価値に元素チャージ効率を考慮するか？
        this.usePowRecharge = ko.observable(false);

        // usePowRechargeが有効のとき，元素チャージ効率のX乗を評価値に乗算する
        this.exponentOfRecharge = ko.observable(0.5);

        // 大域最適化アルゴリズムを利用するか？
        this.useGlobalOpt = ko.observable(false);

        // 大域最適化アルゴリズムでの，目的関数の評価回数の上限
        this.numOfEvalGlobalOpt = ko.observable(100);


        this.allPatterns = ko.pureComputed(function(){
            let dst = [];
            this.comparingWeaponList().forEach((weapon, iwp) => {
                if(weapon.selected() == undefined)
                    return;

                this.comparingArtifactList().forEach((artifact, iatft) => {
                    if(artifact.selected1() == undefined
                    || artifact.selected2() == undefined) {
                        return;
                    }

                    this.clockMainStatus.forEach(clock => {
                        if(! clock.checked()) return;

                        this.cupMainStatus.forEach(cup => {
                            if(! cup.checked()) return;

                            this.hatMainStatus.forEach(hat => {
                                if(! hat.checked()) return;

                                let exbuffs = this.comparingExternalBuffList().slice(0);

                                // バフ設定の個数が0なら，初期値を追加する
                                if(exbuffs.length == 0) {
                                    exbuffs.push(new UI.ExternalBuffSetting());
                                }

                                exbuffs.forEach((externalBuff, ibuff) => {
                                    dst.push({
                                        character: this.characterSelector.viewModel(),
                                        attack: this.characterSelector.selectedAttack(),
                                        weapon: weapon.viewModel(),
                                        iweapon: iwp,
                                        artifactSet1: artifact.viewModel1(),
                                        artifactSet2: artifact.viewModel2(),
                                        iartifact: iatft,
                                        clock: clock,
                                        cup: cup,
                                        hat: hat,
                                        exbuff: externalBuff,
                                        iexbuff: ibuff,
                                        powRecharge: { isEnabled: this.usePowRecharge(), exp: Number(this.exponentOfRecharge()) },
                                        globalOpt: { isEnabled: this.useGlobalOpt(), maxEval: Number(this.numOfEvalGlobalOpt()) },
                                    });
                                });
                            });
                        })
                    });
                });
            });

            return dst;
        }, this);

        this.savedURL = ko.observable();

        this.optimizedResults = ko.observableArray();
        this.doneOptimizedCount = ko.observable(0);

        this.optimizeAllCases = function() {
            this.optimizedResults([]);
            let allpatterns = this.allPatterns();
            let total_cost = this.optTotalCost();

            this.doneOptimizedCount(0);

            if(allpatterns.length > 200 || (this.useGlobalOpt() && Number(this.numOfEvalGlobalOpt()) * allpatterns.length > 1000 )) {
                $('#optimizationProgress').modal('show');
            }

            let tasks = [];
            let results = [];

            allpatterns.forEach(setting => {
                async function task(){
                    let oldsetting = Calc.VGData.doCalcExprText;
                    Calc.VGData.doCalcExprText = true;
                    let calc = new Calc.DamageCalculator();
                    {
                        calc = setting.character.applyDmgCalc(calc);
                        calc = setting.weapon.applyDmgCalc(calc);
                        calc = setting.artifactSet1.applyDmgCalc(calc);
                        calc = setting.artifactSet2.applyDmgCalc(calc);

                        Calc.VGData.pushContext('Artifact');
                        calc.addAtk.value += 311;
                        calc.addHP.value += 4780;
                        Calc.VGData.popContext();

                        [setting.clock, setting.cup, setting.hat].forEach(e => {
                            calc = Data.applyDmgCalcArtifactMainStatus(calc, setting.character.parent, e.value);
                        });

                        calc = setting.exbuff.applyDmgCalc(calc);
                    }
                    Calc.VGData.doCalcExprText = oldsetting;

                    let attackType = setting.attack;

                    function setArg(x) {
                        calc.artRateAtk.value = x[0];
                        calc.artRateDef.value = x[1];
                        calc.artRateHP.value = x[2];
                        calc.artCrtRate.value = x[3];
                        calc.artCrtDmg.value = x[4];
                        calc.artRecharge.value = x[5];
                        calc.artMastery.value = x[6];
                    }

                    function objfunc(x) {
                        setArg(x);
                        let dmg = attackType.evaluate(calc);

                        if(setting.powRecharge.isEnabled) {
                            return dmg.mul(calc.recharge(attackType.attackProps).pow_number(setting.powRecharge.exp));
                        } else {
                            return dmg;
                        }
                    }

                    const x0 = [0, 0, 0, 0, 0, 0, 0];

                    if(total_cost == 0) {
                        results.push({dmg: objfunc(x0).value, calc: calc, setting: setting});
                    } else {
                        let opt = undefined;
                        if(setting.globalOpt.isEnabled) {
                            opt = await Calc.applyGlobalOptimize(calc, objfunc, total_cost, nlopt.Algorithm.GN_ISRES, nlopt.Algorithm.LD_SLSQP, x0, 1e-3, setting.globalOpt.maxEval, 1000);

                            // 局所最適化のみ
                            let local = await Calc.applyOptimize(calc, objfunc, total_cost, nlopt.Algorithm.LD_SLSQP, x0, 1e-3, 1000);
                            if(opt == undefined || !opt.success || opt.value < local.value)
                                opt = local;    // 局所最適化の方が性能が良かったのでそちらを採用
                        } else {
                            opt = await Calc.applyOptimize(calc, objfunc, total_cost, nlopt.Algorithm.LD_SLSQP, x0, 1e-3, 1000);
                        }
                        
                        console.assert(opt.opt_result.success);
                        setArg(opt.opt_result.x);
                        results.push({dmg: opt.value, calc: opt.calc, setting: setting});
                    }

                    if(results.length % 10 == 0 || this.useGlobalOpt())
                        this.doneOptimizedCount(results.length);
                }

                tasks.push(task.bind(this));
            });

            function onFinish() {
                if(results.length == 0) return;
                // console.log(results);

                results.sort(function(a, b){
                    return -(a.dmg - b.dmg);
                });

                this.optimizedResults(results);
                setTimeout(() => { $('#optimizationProgress').modal('hide'); }, 300);
                $("html,body").animate({scrollTop:$('#scrollTargetAfterOptimization').offset().top});

                const encodedURL = `${location.pathname}?ver=${Migrator.indexDataMigrator.currentVersion()}&data=${encodeToURI(this.toJS())}`;
                this.savedURL(`${location.protocol}//${location.host}${encodedURL}`);
                history.replaceState('', '', encodedURL);
                // nlopt.GC.flush();
            }

            processTasksOnIdle(tasks, onFinish.bind(this));

        }.bind(this);


        this.titleOptimizedResult = function(index, r) {
            let wname = r.setting.weapon.parent.name;
            let iw = r.setting.iweapon;
            let artname1 = r.setting.artifactSet1.parent.abbr;
            let artname2 = undefined;
            if(r.setting.artifactSet2.parent != undefined)
                artname2 = r.setting.artifactSet2.parent.abbr;

            let ia = r.setting.iartifact;

            if(artname2 == undefined) {
                return `#${index+1}：${wname}/${artname1}4（#W${r.setting.iweapon+1}/#A${r.setting.iartifact+1}/#B${r.setting.iexbuff+1}）`;
            } else {
                return `#${index+1}：${wname}/${artname1}2${artname2}2（#W${r.setting.iweapon+1}/#A${r.setting.iartifact+1}/#B${r.setting.iexbuff+1}）`;
            }
        }.bind(this);

        this.textCardBodyOptimizedResult = function(index, r) {
            let line1 = "メイン：";
            line1 += r.setting.clock.label + "/" + r.setting.cup.label + "/" + r.setting.hat.label;
            line1 = line1.replaceAll("ダメージ", "ダメ").replaceAll("キャラ", "");

            let line2 = "サブ累計：";
            let sp = "";
            if(Math.round(r.calc.artRateAtk.value*100) > 0) {
                line2 += "攻撃力+" + textPercentageFix(r.calc.artRateAtk.value, 1);
                sp = "/";
            }

            if(Math.round(r.calc.artRateDef.value*100) > 0) {
                line2 += sp + "防御力+" + textPercentageFix(r.calc.artRateDef.value, 1);
                sp = "/";
            }

            if(Math.round(r.calc.artRateHP.value*100) > 0) {
                line2 += sp + "HP+" + textPercentageFix(r.calc.artRateHP.value, 1);
                sp = "/";
            }

            if(Math.round(r.calc.artCrtRate.value*100) > 0) {
                line2 += sp + "会心率+" + textPercentageFix(r.calc.artCrtRate.value, 1);
                sp = "/";
            }

            if(Math.round(r.calc.artCrtDmg.value*100) > 0) {
                line2 += sp + "会心ダメ+" + textPercentageFix(r.calc.artCrtDmg.value, 1);
                sp = "/";
            }

            if(Math.round(r.calc.artRecharge.value*100) > 0) {
                line2 += sp + "チャージ効率+" + textPercentageFix(r.calc.artRecharge.value, 1);
                sp = "/";
            }

            if(Math.round(r.calc.artMastery.value) > 0) {
                line2 += sp + "熟知+" + textInteger(Math.round(r.calc.artMastery.value));
                sp = "/";
            }

            if(sp == "")
                line2 += "なし";

            return line1 + "<br>" + line2;
        }.bind(this);

        this.showOptResultsLimit = ko.observable(20);

        this.shownOptimizedResultsCondition = ko.observable("ALL");

        this.setShownResult = function(cond) {
            this.shownOptimizedResultsCondition(cond);
        }.bind(this);

        this.shownOptimizedResults = ko.pureComputed(function(){
            let arr = this.optimizedResults();
            let len = arr.length;
            let lim = Number(this.showOptResultsLimit());
            let cond = this.shownOptimizedResultsCondition();

            // DOMを遅延して構築するために必要
            function EachResultViewModel(e) {
                this.isOpen = ko.observable(false);
                this.toggle = function() {
                    this.isOpen(!this.isOpen());
                }.bind(this);

                this.doneCalc = false;
                this.dmgExpected = {};
                this.dmgCrt = {};
                this.dmgNonCrt = {};
                e.setting.character.presetAttacks().forEach(attackType => {
                    this.dmgExpected[attackType.id] = ko.observable();
                    this.dmgCrt[attackType.id] = ko.observable();
                    this.dmgNonCrt[attackType.id] = ko.observable();
                });

                this.isOpen.subscribe(function(newVal){
                    if(newVal && !this.doneCalc) {
                        e.setting.character.presetAttacks().forEach(attackType => {
                            let oldValue = Calc.VGData.doCalcExprText;
                            Calc.VGData.doCalcExprText = true;                            

                            let expected = attackType.evaluate(e.calc, {});
                            let crt = attackType.evaluate(e.calc, {isForcedCritical: true});
                            let noncrt = attackType.evaluate(e.calc, {isForcedNonCritical: true});

                            this.dmgExpected[attackType.id](expected);
                            this.dmgCrt[attackType.id](crt);
                            this.dmgNonCrt[attackType.id](noncrt);

                            Calc.VGData.doCalcExprText = oldValue;
                        });
                        this.doneCalc = true;
                    }
                }.bind(this));
            }

            if(cond == 'ALL') {
                // nop
            } else {
                // genKeyでarrの内容をユニークにする
                let genKey;
                if(cond == 'weapon') {
                    genKey = function(e) { return `${e.setting.iweapon}`; };
                } else {
                    genKey = function(e) { return `${e.setting.iweapon}_${e.setting.iartifact}`; };
                }

                let uniqueKeys = {};
                let newarr = [];
                for(let i = 0; i < arr.length; ++i) {
                    let k = genKey(arr[i]);
                    if(k in uniqueKeys) continue;

                    uniqueKeys[k] = true;
                    newarr.push(arr[i]);
                }

                arr = newarr;
            }

            let dst = [];
            arr.slice(0, Math.min(len, lim)).forEach(e => {
                dst.push(Object.assign(new EachResultViewModel(e), e));
            });

            return dst;
        }, this);


        this.copySavedURL = function() {
            copyTextToClipboard(this.savedURL());
        }.bind(this);


        this.toJS = function(){
            let obj = {};

            obj.character = this.characterSelector.toJS();

            obj.weapons = [];
            this.comparingWeaponList().forEach(w => {
                if(w.selected() != undefined)
                    obj.weapons.push(w.toJS());
            });

            obj.artifacts = [];
            this.comparingArtifactList().forEach(a => {
                if(a.selected1() == undefined || a.selected2() == undefined)
                    return;

                obj.artifacts.push(a.toJS());
            });

            obj.totcost = this.optTotalCost();
            obj.buff = this.comparingExternalBuffList().map(a => a.toJS());

            obj.clock = {};
            this.clockMainStatus.forEach(c => {
                obj.clock[c.value] = c.checked();
            });

            obj.cup = {};
            this.cupMainStatus.forEach(c => {
                obj.cup[c.value] = c.checked();
            });

            obj.hat = {};
            this.hatMainStatus.forEach(c => {
                obj.hat[c.value] = c.checked();
            });

            obj.usePowRecharge = this.usePowRecharge();
            obj.exponentOfRecharge = Number(this.exponentOfRecharge());

            // obj.useGlobalOpt = this.useGlobalOpt();
            // obj.numOfEvalGlobalOpt = Number(this.numOfEvalGlobalOpt());

            return obj;

        }.bind(this);


        this.fromJS = function(obj){
            this.characterSelector.fromJS(obj.character);

            this.comparingWeaponList([]);
            obj.weapons.forEach(w => {
                let wdata = new UI.WeaponSelector(this.selectedChar);
                wdata.fromJS(w);
                this.comparingWeaponList.push(wdata);
            });

            this.comparingArtifactList([]);
            obj.artifacts.forEach(a => {
                let adata = new UI.ArtifactSelector();
                adata.fromJS(a);
                this.comparingArtifactList.push(adata);
            });

            this.optTotalCost(obj.totcost);
            obj.buff.forEach(e => {
                this.addComparingExternalBuff();
                this.comparingExternalBuffList().at(-1).fromJS(e);
            });

            this.clockMainStatus.forEach(c => {
                c.checked(obj.clock[c.value]);
            });

            this.cupMainStatus.forEach(c => {
                c.checked(obj.cup[c.value]);
            });

            this.hatMainStatus.forEach(c => {
                c.checked(obj.hat[c.value]);
            });

            this.usePowRecharge(obj.usePowRecharge);
            this.exponentOfRecharge(obj.exponentOfRecharge);

            // this.useGlobalOpt(obj.useGlobalOpt);
            // this.numOfEvalGlobalOpt(obj.numOfEvalGlobalOpt);

        }.bind(this);
    }

    window.viewModel = new ViewModel();

    ko.applyBindings(window.viewModel);

    // 初期設定
    {
        viewModel.setShownResult("ALL");
        // viewModel.addComparingExternalBuff();
    }

    function loadDataFromURI(version, uri)
    {
        let migrated = Migrator.indexDataMigrator.migrate(version, decodeFromURI(uri));
        viewModel.fromJS(migrated);
    }

    function encodeDataToURI()
    {
        return encodeToURI(viewModel.toJS());
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