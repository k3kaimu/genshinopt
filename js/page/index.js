'use strict';
import * as Data from '/js/modules/data.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';
import * as Migrator from '/js/modules/migrator.mjs'


$(function(){
    function CharacterSelector(selectedChar)
    {
        this.selectedChar = selectedChar;
        this.characters = Data.characters;
        this.selCharElem = ko.observable();
        this.selCharRarity = ko.observable();
        this.selCharList = ko.pureComputed(function(){
            var list = [];
            var elem = this.selCharElem();
            var rarity = this.selCharRarity();
            

            this.characters.forEach(e => {
                if(!(elem == "ALL" || e.elem == elem))
                    return;
                
                if(!(rarity == "ALL" || e.rarity == rarity))
                    return;

                list.push(e);
            });

            return list;
        }, this);
    }


    function ComparingWeaponData(selectedChar)
    {
        this.weapons = Data.weapons;
        this.selWeaponRarity = ko.observable();
        this.selectedWeapon = ko.observable();
        this.selWeaponList = ko.pureComputed(function(){
            var list = [];
            var rarity = this.selWeaponRarity();
            var ch = selectedChar();

            this.weapons.forEach(e => {
                if(!(rarity == "ALL" || e.rarity == rarity))
                    return;

                if(ch != undefined && ch.weaponType != e.weaponType)
                    return;

                list.push(e);
            });

            return list;
        }, this);

        this.weaponViewModel = ko.observable(new Data.WeaponViewModel());
        this.selectedWeapon.subscribe(function(newWeaponData){
            if(newWeaponData == undefined) {
                this.weaponViewModel(new Data.WeaponViewModel(undefined));
            } else {
                this.weaponViewModel(newWeaponData.newViewModel());
            }
        }.bind(this));

        this.toJS  = function() {
            let obj = {};
            obj.weapon = this.weaponViewModel().toJS();
            return obj;
        }.bind(this);

        this.fromJS = function(obj) {
            this.selectedWeapon(Data.lookupWeapon(obj.weapon.parent_id));
            
            let w = this.weaponViewModel();
            w.fromJS(obj.weapon);
            this.weaponViewModel(w);
        }.bind(this);
    }


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
                if(e.selectedWeapon() == undefined)
                    removeList.push(e);
            });
            
            removeList.forEach(function(e) { this.parent.comparingWeaponList.remove(e); }.bind(this));

            this.weapons.forEach(e => {
                if(e.checked()) {
                    var wp = new ComparingWeaponData(this.parent.selectedChar);
                    wp.selectedWeapon(e.weapon);
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


    function ComparingArtifactData(parent)
    {
        this.artifacts = Data.artifacts;
        this.selectedArtifact1 = ko.observable();
        this.selectedArtifact2 = ko.observable();
        this.artifact1ViewModel = ko.observable(new Data.ArtifactViewModel(undefined));
        this.artifact2ViewModel = ko.observable(new Data.ArtifactViewModel(undefined));

        this.setViewModel = function(sel1, sel2, vm1, vm2){
            if(sel1.id == sel2.id) {
                vm1(sel1.newViewModel(4));
                vm2(new Data.ArtifactViewModel());
            } else {
                vm1(sel1.newViewModel(2));
                vm2(sel2.newViewModel(2));
            }
        }.bind(this);

        this.selectedArtifact1.subscribe(function(newArt){
            let art2 = this.selectedArtifact2();
            if(newArt == undefined) {
                this.artifact1ViewModel(new Data.ArtifactViewModel(undefined, 2));
                if(art2 != undefined)
                    this.artifact2ViewModel(art2.newViewModel(2));

                return;
            }

            if(art2 != undefined)
                this.setViewModel(newArt, art2, this.artifact1ViewModel, this.artifact2ViewModel);
            else
                this.artifact1ViewModel(newArt.newViewModel(2));
        }.bind(this));

        this.selectedArtifact2.subscribe(function(newArt){
            let art1 = this.selectedArtifact1();
            if(newArt == undefined) {
                this.artifact2ViewModel(new Data.ArtifactViewModel(undefined, 2));
                if(art1 != undefined)
                    this.artifact1ViewModel(art1.newViewModel(2));

                return;
            }

            if(art1 != undefined)
                this.setViewModel(art1, newArt, this.artifact1ViewModel, this.artifact2ViewModel);
            else
                this.artifact2ViewModel(newArt.newViewModel(2));
        }.bind(this));


        this.toJS = function(){
            let obj = {};
            obj.art1 = this.artifact1ViewModel().toJS();

            if(this.artifact2ViewModel().parent)
                obj.art2 = this.artifact2ViewModel().toJS();

            return obj;
        }.bind(this);

        this.fromJS = function(obj){
            this.selectedArtifact1(Data.lookupArtifact(obj.art1.parent_id));

            if(obj.art2 == undefined) {
                // art1と同じ
                this.selectedArtifact2(Data.lookupArtifact(obj.art1.parent_id));
            } else {
                this.selectedArtifact2(Data.lookupArtifact(obj.art2.parent_id));
            }

            let a1 = this.artifact1ViewModel();
            a1.fromJS(obj.art1);
            this.artifact1ViewModel(a1);

            if(!(obj.art2 == undefined)) {
                let a2 = this.artifact2ViewModel();
                a2.fromJS(obj.art2);
                this.artifact1ViewModel(a2);
            }
        }.bind(this);
    }


    function ExternalBuff()
    {
        this.addAtk = ko.observable();
        this.rateAtk = ko.observable();
        this.addDef = ko.observable();
        this.rateDef = ko.observable();
        this.addHP = ko.observable();
        this.rateHP = ko.observable();
        this.crtRate = ko.observable();
        this.crtDmg = ko.observable();
        this.mastery = ko.observable();
        this.dmgBuff = ko.observable();
        this.recharge = ko.observable();

        this.applyDmgCalc = function(calc){
            calc.addAtk.value += Number(this.addAtk() || 0)
            calc.rateAtk.value += Number(this.rateAtk() || 0)
            calc.addDef.value += Number(this.addDef() || 0)
            calc.rateDef.value += Number(this.rateDef() || 0)
            calc.addHP.value += Number(this.addHP() || 0)
            calc.rateHP.value += Number(this.rateHP() || 0)
            calc.baseCrtRate.value += Number(this.crtRate() || 0)
            calc.baseCrtDmg.value += Number(this.crtDmg() || 0)
            calc.baseMastery.value += Number(this.mastery() || 0)
            calc.baseAllDmg.value += Number(this.dmgBuff() || 0)
            calc.baseRecharge.value += Number(this.recharge() || 0)

            return calc;
        }.bind(this);

        this.toJS = function(){
            let obj = {};
            obj.addAtk = this.addAtk();
            obj.rateAtk = this.rateAtk();
            obj.addDef = this.addDef();
            obj.rateDef = this.rateDef();
            obj.addHP = this.addHP();
            obj.rateHP = this.rateHP();
            obj.crtRate = this.crtRate();
            obj.crtDmg = this.crtDmg();
            obj.mastery = this.mastery();
            obj.dmgBuff = this.dmgBuff();
            obj.recharge = this.recharge();
            return obj;
        }.bind(this);

        this.fromJS = function(obj) {
            this.addAtk(obj.addAtk);
            this.rateAtk(obj.rateAtk);
            this.addDef(obj.addDef);
            this.rateDef(obj.rateDef);
            this.addHP(obj.addHP);
            this.rateHP(obj.rateHP);
            this.crtRate(obj.crtRate);
            this.crtDmg(obj.crtDmg);
            this.mastery(obj.mastery);
            this.dmgBuff(obj.dmgBuff);
            this.recharge(obj.recharge);
        }.bind(this);
    }


    function ViewModel() {
        this.readyNLopt = ko.observable();

        this.selectedChar = ko.observable();
        // this.selConstellation = ko.observable();
        // this.selNormalTalentRank = ko.observable();
        // this.selSkillTalentRank = ko.observable();
        // this.selBurstTalentRank = ko.observable();
    
        this.characterSelector = new CharacterSelector(this.selectedChar);
        this.characterViewModel = ko.observable(new Data.CharacterViewModel(undefined));

        this.selectedChar.subscribe(function(newCharacter){
            if(newCharacter == undefined)
                this.characterViewModel(new Data.CharacterViewModel(undefined));
            else
                this.characterViewModel(newCharacter.newViewModel());
        }.bind(this));


        this.comparingWeaponList = ko.observableArray();

        this.addComparingWeapon = function()
        {
            this.comparingWeaponList.push(new ComparingWeaponData(this.selectedChar));
        }.bind(this);

        
        this.multiWeaponAdderModal = new MultiWeaponAdderModal(this);
        this.initMultiWeaponAdder = function(){
            this.multiWeaponAdderModal.uncheckALL();
        }.bind(this);


        this.comparingArtifactList = ko.observableArray();

        this.addComparingArtifact = function()
        {
            this.comparingArtifactList.push(new ComparingArtifactData(this));
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


        this.attackOptions = ko.pureComputed(function(){
            if(this.selectedChar() == undefined)
                return Data.CharacterData.presetAttacks;
            else
                return Object.getPrototypeOf(this.selectedChar()).constructor.presetAttacks;
        }, this);


        this.selectedAttack = ko.observable();

        this.externalBuff = new ExternalBuff();

        this.optTotalCost = ko.observable();


        this.allPatterns = ko.pureComputed(function(){
            let dst = [];
            this.comparingWeaponList().forEach((weapon, iwp) => {
                if(weapon.selectedWeapon() == undefined)
                    return;

                this.comparingArtifactList().forEach((artifact, iatft) => {
                    if(artifact.selectedArtifact1() == undefined
                    || artifact.selectedArtifact2() == undefined) {
                        return;
                    }

                    this.clockMainStatus.forEach(clock => {
                        if(! clock.checked()) return;

                        this.cupMainStatus.forEach(cup => {
                            if(! cup.checked()) return;

                            this.hatMainStatus.forEach(hat => {
                                if(! hat.checked()) return;

                                dst.push({
                                    character: this.characterViewModel(),
                                    attack: this.selectedAttack(),
                                    weapon: weapon.weaponViewModel(),
                                    iweapon: iwp,
                                    artifactSet1: artifact.artifact1ViewModel(),
                                    artifactSet2: artifact.artifact2ViewModel(),
                                    iartifact: iatft,
                                    clock: clock,
                                    cup: cup,
                                    hat: hat,
                                    exbuff: this.externalBuff,
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

            if(allpatterns.length > 200) {
                $('#optimizationProgress').modal('show');
            }

            let tasks = [];
            let results = [];

            allpatterns.forEach(setting => {
                function task(){
                    let calc = new Calc.DamageCalculator();
                    calc = setting.character.applyDmgCalc(calc);
                    calc = setting.weapon.applyDmgCalc(calc);
                    calc = setting.artifactSet1.applyDmgCalc(calc);
                    calc = setting.artifactSet2.applyDmgCalc(calc);

                    calc.addAtk.value += 311;
                    calc.addHP.value += 4780;   

                    [setting.clock, setting.cup, setting.hat].forEach(e => {
                        calc = Data.applyDmgCalcArtifactMainStatus(calc, setting.character.parent, e.value);
                    });

                    calc = setting.exbuff.applyDmgCalc(calc);

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
                        return calc.calculate(attackType.dmgScale(setting.character), attackType.attackProps).total();
                    }

                    let x0 = [0, 0, 0, 0, 0, 0, 0];

                    if(total_cost == 0) {
                        results.push({dmg: objfunc(x0).value, calc: calc, setting: setting});
                    } else {
                        let opt = applyOptimize(calc, objfunc, total_cost, nlopt.Algorithm.LD_SLSQP, x0, 1e-3, 1000);
                        
                        console.assert(opt.opt_result.success);
                        setArg(opt.opt_result.x);
                        results.push({dmg: opt.value, calc: opt.calc, setting: setting});
                    }

                    if(results.length % 10 == 0)
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
                $('#optimizationProgress').modal('hide');
                $("html,body").animate({scrollTop:$('#scrollTargetAfterOptimization').offset().top});

                const encodedURL = `${location.pathname}?ver=${Migrator.indexDataMigrator.currentVersion()}&data=${encodeToURI(this.toJS())}`;
                this.savedURL(`${location.protocol}//${location.host}${encodedURL}`);
                history.replaceState('', '', encodedURL);
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
                return "#" + (index+1) + " : " + wname + "(#W" + (iw+1) + ")/" + artname1 + '4' + "(#A" + (ia+1) + ")";
            } else {
                return "#" + (index+1) + " : " + wname + "(#W" + (iw+1) + ")/" + artname1 + '2' + artname2 + "2(#A" + (ia+1) + ")";
            }
        }.bind(this);

        this.textCardBodyOptimizedResult = function(index, r) {
            let line1 = "メイン：";
            line1 += r.setting.clock.label + "/" + r.setting.cup.label + "/" + r.setting.hat.label;

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

        this.showOptResultsLimit = ko.observable();

        this.shownOptimizedResults = ko.pureComputed(function(){
            let arr = this.optimizedResults();
            let len = arr.length;
            let lim = this.showOptResultsLimit();

            // DOMを遅延して構築するために必要
            function EachResultViewModel(e) {
                this.isOpen = ko.observable(false);
                this.toggle = function() {
                    this.isOpen(!this.isOpen());
                }.bind(this);

                this.dmgExpected = {};
                Object.getPrototypeOf(e.setting.character.parent).constructor.presetAttacks.forEach(attackType => {
                    this.dmgExpected[attackType.label] = e.calc.calculate(attackType.dmgScale(e.setting.character), attackType.attackProps).total();
                });
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

            obj.character = this.characterViewModel().toJS();
            obj.weapons = [];
            this.comparingWeaponList().forEach(w => {
                obj.weapons.push(w.toJS());
            });

            obj.artifacts = [];
            this.comparingArtifactList().forEach(a => {
                obj.artifacts.push(a.toJS());
            });

            obj.attack = {id: this.selectedAttack().id};
            obj.totcost = this.optTotalCost();
            obj.buff = this.externalBuff.toJS();

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

            return obj;

        }.bind(this);


        this.fromJS = function(obj){
            this.selectedChar(Data.lookupCharacter(obj.character.parent_id));
            let charVM = this.characterViewModel();
            charVM.fromJS(obj.character);
            this.characterViewModel(charVM);

            this.comparingWeaponList([]);
            obj.weapons.forEach(w => {
                let wdata = new ComparingWeaponData(this.selectedChar);
                wdata.fromJS(w);
                this.comparingWeaponList.push(wdata);
            });

            this.comparingArtifactList([]);
            obj.artifacts.forEach(a => {
                let adata = new ComparingArtifactData(this);
                adata.fromJS(a);
                this.comparingArtifactList.push(adata);
            });

            this.attackOptions().forEach(e => {
                if(e.id == obj.attack.id)
                    this.selectedAttack(e);
            });

            this.optTotalCost(obj.totcost);
            this.externalBuff.fromJS(obj.buff);

            this.clockMainStatus.forEach(c => {
                c.checked(obj.clock[c.value]);
            });

            this.cupMainStatus.forEach(c => {
                c.checked(obj.cup[c.value]);
            });

            this.hatMainStatus.forEach(c => {
                c.checked(obj.hat[c.value]);
            });

        }.bind(this);
    }

    window.viewModel = new ViewModel();

    ko.applyBindings(window.viewModel);

    function loadDataFromURI(version, uri)
    {
        let migrated = Migrator.indexDataMigrator.migrate(version, decodeFromURI(uri));
        viewModel.fromJS(migrated);
    }

    function encodeDataToURI()
    {
        return encodeToURI(viewModel.toJS());
    }


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

    (async () => {
        await nlopt.ready
        viewModel.readyNLopt(true);
    })();
});