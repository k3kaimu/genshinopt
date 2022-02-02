'use strict';
import * as Data from '../modules/data.mjs';
import * as Calc from '../modules/dmg-calc.mjs';
import * as Migrator from '../modules/migrator.mjs';
import * as UI from '../modules/ui.mjs';
import * as TypeDefs from '../modules/typedefs.mjs';


class CharacterSettingList extends UI.TabListViewModel
{
    constructor(htmlId, selectedChar)
    {
        super(htmlId);
        this.selectedChar = selectedChar;

        this.selectedChar.subscribe(newchar => {
            if(newchar == undefined) {
                this.list([]);
            } else {
                this.list([]);
                this.addListItem();
            }
        });
    }


    addListItem() {
        this.list.push(new UI.CharacterVMSetting(this.selectedChar));
        this.selectListItem(this.list().length - 1);
    }
}


class ExternalBuffSettingList extends UI.TabListViewModel
{
    constructor(htmlId)
    {
        super(htmlId);
    }


    addListItem() {
        this.list.push(new UI.ExternalBuffSetting());
        this.selectListItem(this.list().length - 1);
    }
}


class BundleSettingList extends UI.TabListViewModel
{
    constructor(htmlId, selectedChar)
    {
        super(htmlId);
        this.selectedChar = selectedChar;
        this.enableCharacter = ko.observable(true);
        this.enableAttack = ko.observable(false);
        this.enableWeapon = ko.observable(false);
        this.enableArtifact = ko.observable(false);
        this.enableExBuff = ko.observable(false);
    }


    enableAny() {
        return this.enableCharacter() || this.enableAttack()
            || this.enableWeapon() || this.enableArtifact()
            || this.enableExBuff();
    }


    addListItem() {
        this.list.push(new UI.BundleSetting({
            bCharPicker: false,
            selectedChar: this.selectedChar,
            bTalent: this.enableCharacter,
            bAttack: this.enableAttack,
            bWeapon: this.enableWeapon,
            bArtifact: this.enableArtifact,
            bArtifactStatus: false,
            bExternalBuff: this.enableExBuff,
        }));

        
        this.selectListItem(this.list().length - 1);
    }


    toJS() {
        let obj = {list: super.toJS()};
        obj.bChar = this.enableCharacter();
        obj.bAttk = this.enableAttack();
        obj.bWeap = this.enableWeapon();
        obj.bArti = this.enableArtifact();
        obj.bExbf = this.enableExBuff();

        return obj;
    }


    fromJS(obj) {
        this.enableCharacter(obj.bChar);
        this.enableAttack(obj.bAttk);
        this.enableWeapon(obj.bWeap);
        this.enableArtifact(obj.bArti);
        this.enableExBuff(obj.bExbf);
        super.fromJS(obj.list);
    }
}


// DOMを遅延して構築するために必要
function EachResultViewModel(optres) {
    this.isOpen = ko.observable(false);
    this.toggle = function() {
        this.isOpen(!this.isOpen());
    }.bind(this);

    this.doneCalc = false;
    this.dmgExpected = {};
    this.dmgCrt = {};
    this.dmgNonCrt = {};
    this.status = {};
    this.attackIds = [];
    optres.setting.character.presetAttacks().forEach(attackType => {
        this.dmgExpected[attackType.id] = {};
        this.dmgCrt[attackType.id] = {};
        this.dmgNonCrt[attackType.id] = {};
        this.status[attackType.id] = {};
        this.attackIds.push(attackType.id);
    });

    let statusList = [...TypeDefs.dynamicStatusTypes, 'calculateTotalDmgBuff', 'calculateTotalResistanceBonus'];

    this.isShownStatus = {};
    statusList.forEach(k => {
        this.isShownStatus[k] = false;
    });

    this.isOpen.subscribe(function(newVal){
        if(newVal && !this.doneCalc) {
            optres.setting.character.presetAttacks().forEach(attackType => {
                let oldValue = Calc.VGData.doCalcExprText;
                Calc.VGData.doCalcExprText = true;
                attackType.setOptimizedMode(false);

                let expected = attackType.evaluate(optres.calc, {});
                let crt = attackType.evaluate(optres.calc, {isForcedCritical: true});
                let noncrt = attackType.evaluate(optres.calc, {isForcedNonCritical: true});

                this.dmgExpected[attackType.id] = expected;
                this.dmgCrt[attackType.id] = crt;
                this.dmgNonCrt[attackType.id] = noncrt;

                let statusValues = attackType.evaluateStatus(optres.calc, {}, statusList);
                statusList.forEach(key => {
                    if(key === "hp" || key === "atk" || key === "def" || key === "mastery") {
                        this.status[attackType.id][key] = statusValues[key].map(e => e.value).sort().map(e => textInteger(e)).join("/");
                    } else {
                        this.status[attackType.id][key] = statusValues[key].map(e => e.value).sort().map(e => textPercentageFix(e, 1)).join("/");
                    }

                    if(this.status[attackType.id][key] !== "0" && this.status[attackType.id][key] !== "0.0%")
                        this.isShownStatus[key] = true;
                });
                this.status[attackType.id]['totalVaporizeCoeff'] = attackType.evaluateStatus(optres.calc, {isVaporize: true}, ['calculateVaporizeMeltBonus']).calculateVaporizeMeltBonus.map(e => e.value).sort().map(e => textPercentageFix(e, 1)).join("/");
                this.status[attackType.id]['totalMeltCoeff'] = attackType.evaluateStatus(optres.calc, {isMelt: true}, ['calculateVaporizeMeltBonus']).calculateVaporizeMeltBonus.map(e => e.value).sort().map(e => textPercentageFix(e, 1)).join("/");

                Calc.VGData.doCalcExprText = oldValue;
            });
            this.doneCalc = true;
        }
    }.bind(this));
}


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

        this.characterPicker = new UI.CharacterPicker();
        this.selectedChar = this.characterPicker.selected;

        this.bundleList = new BundleSettingList('bundle_list', this.selectedChar); 

        this.characterList = new CharacterSettingList("character_list", this.selectedChar);

        this.attackSetting = new UI.AttackSetting(ko.pureComputed(function(){
            let mlist = this.bundleList.list().map(e => e.characterVMSetting.viewModel());
            let clist = this.characterList.list().map(e => e.viewModel());

            if(this.bundleList.enableCharacter()) {
                return mlist;
            } else {
                return clist;
            }
        }, this));



    
        // this.characterSelector = new UI.CharacterSelector(true);

        this.comparingWeaponList = ko.observableArray();

        this.addComparingWeapon = function(){
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
            { value: "ElmDmg",  label: "キャラ元素ダメージ",    checked: ko.observable(true) },
            { value: "AllElmDmg",  label: "物理/全元素ダメージ",    checked: ko.observable(true) },
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

        this.externalBuffList = new ExternalBuffSettingList("external_buff_list");

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
            const totbund = this.bundleList.list().length;
            const totchar = this.characterList.list().length;
            const totweap = this.comparingWeaponList().length;
            const totarti = this.comparingArtifactList().length;
            const totexbf = this.externalBuffList.list().length;

            if(! this.bundleList.enableAttack() && ! this.attackSetting.isValid())
                return dst;

            (this.bundleList.enableAny()
                ? this.bundleList.list()
                : [{isValid: () => true}]
            ).forEach((bundleSetting, ibundle) => {
                if(!bundleSetting.isValid()) return;

                (this.bundleList.enableCharacter()
                    ? [bundleSetting.characterVMSetting]
                    : this.characterList.list()
                ).forEach((charSetting, ichar) => {
                    if(!charSetting.isValid()) return;

                    (this.bundleList.enableWeapon()
                        ? [bundleSetting.weaponSelector]
                        : this.comparingWeaponList()
                    ).forEach((weapon, iwp) => {
                        if(!weapon.isValid()) return;

                        (this.bundleList.enableArtifact()
                            ? [bundleSetting.artifactSelector]
                            : this.comparingArtifactList()
                        ).forEach((artifact, iatft) => {
                            if(!artifact.isValid()) return;

                            this.clockMainStatus.forEach(clock => {
                                if(! clock.checked()) return;

                                this.cupMainStatus.forEach(cup => {
                                    if(! cup.checked()) return;

                                    this.hatMainStatus.forEach(hat => {
                                        if(! hat.checked()) return;

                                        let exbuffs = this.externalBuffList.list().slice(0);

                                        // バフ設定の個数が0なら，初期値を追加する
                                        if(exbuffs.length == 0) {
                                            exbuffs.push(new UI.ExternalBuffSetting());
                                        }

                                        (this.bundleList.enableExBuff()
                                            ? [bundleSetting.exbuffSetting]
                                            : exbuffs
                                        ).forEach((externalBuff, ibuff) => {
                                            let attackEval = undefined;
                                            if(this.bundleList.enableAttack())
                                                attackEval = bundleSetting.attackSetting.makeAttackEvaluator(charSetting.viewModel());
                                            else
                                                attackEval = this.attackSetting.makeAttackEvaluator(charSetting.viewModel());

                                            dst.push({
                                                character: charSetting.viewModel(),
                                                attack: attackEval,
                                                ichar: ichar,
                                                totchar: totchar,
                                                weapon: weapon.viewModel(),
                                                iweapon: iwp,
                                                totweap: totweap,
                                                artifactSet1: artifact.viewModel1(),
                                                artifactSet2: artifact.viewModel2(),
                                                iartifact: iatft,
                                                totarti: totarti,
                                                clock: clock,
                                                cup: cup,
                                                hat: hat,
                                                exbuff: externalBuff,
                                                iexbuff: ibuff,
                                                totexbf: totexbf,
                                                powRecharge: { isEnabled: this.usePowRecharge(), exp: Number(this.exponentOfRecharge()) },
                                                globalOpt: { isEnabled: this.useGlobalOpt(), maxEval: Number(this.numOfEvalGlobalOpt()) },
                                                ibund: ibundle,
                                                totbund: totbund,
                                                bBundleChar: this.bundleList.enableCharacter(),
                                                bBundleAttk: this.bundleList.enableAttack(),
                                                bBundleWeap: this.bundleList.enableWeapon(),
                                                bBundleArti: this.bundleList.enableArtifact(),
                                                bBundleExbf: this.bundleList.enableExBuff(),
                                            });
                                        });
                                    });
                                })
                            });
                        });
                    })
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
            let exceptions = [];

            allpatterns.forEach(setting => {
                async function task(){
                    try {
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
                        attackType.clearInfoCache();
                        attackType.setOptimizedMode(true);  // 最適化モード

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
                                return dmg.mul(calc.recharge(attackType.attackProps ?? {}).pow_number(setting.powRecharge.exp));
                            } else {
                                return dmg;
                            }
                        }

                        const x0 = [0, 0, 0, 0, 0, 0, 0];

                        // コストが0か，もしくは全部の傾きがゼロなのであれば最適化しない
                        if(total_cost == 0 || calc.calcUpperBounds(total_cost, objfunc).filter(e => e > 1e-4).length == 0) {
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

                        // 最適化モードを終わる
                        attackType.setOptimizedMode(false);

                        if(results.length % 10 == 0 || this.useGlobalOpt())
                            this.doneOptimizedCount(results.length);
                    } catch(ex) {
                        exceptions.push(JSON.stringify(ex, Object.getOwnPropertyNames(ex)));
                        console.error(ex);
                    }
                }

                tasks.push(task.bind(this));
            });

            function onFinish() {
                if(exceptions.length != 0) {
                    UI.showToast("原神OPT", `${exceptions.length}件の最適化に失敗しました．成功した条件のみ表示しています．`);
                }

                if(results.length == 0) return;

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

            let prefix;
            if(artname2 == undefined) {
                prefix = `#${index+1}：${wname}/${artname1}4`;
                // （#W${r.setting.iweapon+1}/#A${r.setting.iartifact+1}/#B${r.setting.iexbuff+1}）`;
            } else {
                prefix = `#${index+1}：${wname}/${artname1}2${artname2}2`;
                // （#W${r.setting.iweapon+1}/#A${r.setting.iartifact+1}/#B${r.setting.iexbuff+1}）`;
            }

            let suffix = [];
            if(r.setting.totbund > 1
                && (r.setting.bBundleChar || r.setting.bBundleWeap
                 || r.setting.bBundleArti || r.setting.bBundleExbf
                 || r.setting.bBundleAttk
                )) {
                suffix.push(`#M${r.setting.ibund+1}`);
            }
            if(r.setting.totchar > 1 && !r.setting.bBundleChar) suffix.push(`#C${r.setting.ichar+1}`);
            if(r.setting.totweap > 1 && !r.setting.bBundleWeap) suffix.push(`#W${r.setting.iweapon+1}`);
            if(r.setting.totarti > 1 && !r.setting.bBundleArti) suffix.push(`#A${r.setting.iartifact+1}`);
            if(r.setting.totexbf > 1 && !r.setting.bBundleExbf) suffix.push(`#B${r.setting.iexbuff+1}`);

            if(suffix.length == 0)
                return prefix;
            else
                return `${prefix}(${suffix.join('/')})`;
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
            UI.showToast("原神OPT", "クリップボードにURLをコピーしました");
            copyTextToClipboard(this.savedURL());
        }.bind(this);


        this.toJS = function(){
            let obj = {};

            obj.bundle = this.bundleList.toJS();

            obj.character = {
                picked: this.characterPicker.toJS(),
                list: this.bundleList.enableCharacter() ? null : this.characterList.toJS()
            };

            if(! this.bundleList.enableAttack())
                obj.attack = this.attackSetting.toJS();

            if(! this.bundleList.enableWeapon()) {
                obj.weapons = [];
                this.comparingWeaponList().forEach(w => {
                    if(w.selected() != undefined)
                        obj.weapons.push(w.toJS());
                });
            }

            if(! this.bundleList.enableArtifact()) {
                obj.artifacts = [];
                this.comparingArtifactList().forEach(a => {
                    if(a.selected1() == undefined || a.selected2() == undefined)
                        return;

                    obj.artifacts.push(a.toJS());
                });
            }

            obj.totcost = this.optTotalCost();

            if(! this.bundleList.enableExBuff()) {
                obj.buff = this.externalBuffList.list().map(a => a.toJS());
            }

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
            this.characterPicker.fromJS(obj.character.picked);
            this.bundleList.fromJS(obj.bundle);

            if(! this.bundleList.enableCharacter()) {
                this.characterList.fromJS(obj.character.list);
            }

            if(! this.bundleList.enableAttack()) {
                this.attackSetting.fromJS(obj.attack);
            }

            if(! this.bundleList.enableWeapon()) {
                this.comparingWeaponList([]);
                obj.weapons.forEach(w => {
                    let wdata = new UI.WeaponSelector(this.selectedChar);
                    wdata.fromJS(w);
                    this.comparingWeaponList.push(wdata);
                });
            }

            if(! this.bundleList.enableArtifact()) {
                this.comparingArtifactList([]);
                obj.artifacts.forEach(a => {
                    let adata = new UI.ArtifactSelector();
                    adata.fromJS(a);
                    this.comparingArtifactList.push(adata);
                });
            }

            this.optTotalCost(obj.totcost);

            if(! this.bundleList.enableExBuff()) {
                this.externalBuffList.fromJS(obj.buff);
            }

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

    try {
        window.viewModel = new ViewModel();

        ko.applyBindings(window.viewModel);

        // 初期設定
        {
            viewModel.setShownResult("ALL");
            viewModel.bundleList.addListItem();
        }
    } catch(ex) {
        UI.showToast("原神OPT", "ページの初期化に失敗しました．キャッシュデータが古い可能性があります．");
        console.error(ex);
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
            UI.showToast("原神OPT", "URLからデータのロードに失敗しました");
            console.error(ex);
        };
    })();

    import('/js/modules/utils.mjs').then(m => window.Utils = m);
});