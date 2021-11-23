'use strict';
import * as Data from '/js/modules/data.mjs';
import * as Calc from '/js/modules/dmg-calc.mjs';


$(function(){
    function CharacterSelector(selectedChar)
    {
        this.selectedChar = selectedChar;
        this.characters = Data.characters;
        this.selCharElem = ko.observable();
        this.selCharRarity = ko.observable();
        this.selCharList = ko.computed(function(){
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
        this.selWeaponList = ko.computed(function(){
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

        this.selWeaponList = ko.computed(function(){
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
            { value: "Mastery",     label:"元素熟知",           checked: ko.observable(true) },
            { value: "Recharge",    label:"元素チャージ効率",   checked: ko.observable(true) },
        ];

        this.cupMainStatus = [
            { value: "ATK%",    label: "攻撃力%",               checked: ko.observable(true) },
            { value: "DEF%",    label: "防御力%",               checked: ko.observable(false) },
            { value: "HP%",     label: "HP%",                   checked: ko.observable(false) },
            { value: "Mastery", label: "元素熟知",              checked: ko.observable(true) },
            { value: "PhyDmg",  label: "物理ダメージ",          checked: ko.observable(false) },
            { value: "ElmDmg",  label: "キャラ属性ダメージ",    checked: ko.observable(true) },
        ];

        this.hatMainStatus = [
            { value: "ATK%",    label: "攻撃力%",           checked: ko.observable(true) },
            { value: "DEF%",    label: "防御力%",           checked: ko.observable(false) },
            { value: "HP%",     label: "HP%",               checked: ko.observable(false) },
            { value: "Mastery", label: "元素熟知",          checked: ko.observable(true) },
            { value: "CrtRate", label: "会心率",            checked: ko.observable(true) },
            { value: "CrtDmg",  label: "会心ダメージ",      checked: ko.observable(true) },
            { value: "Heal",    label: "与える治癒効果",    checked: ko.observable(false) },
        ];


        this.allPatterns = ko.computed(function(){
            let dst = [];
            this.comparingWeaponList().forEach(weapon => {
                if(weapon.selectedWeapon() == undefined)
                    return;

                this.comparingArtifactList().forEach(artifact => {
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
                                    weapon: weapon.weaponViewModel(),
                                    artifactSet1: artifact.artifact1ViewModel(),
                                    artifactSet2: artifact.artifact2ViewModel(),
                                    clock: clock,
                                    cup: cup,
                                    hat: hat
                                });
                            });
                        })
                    });
                });
            });

            return dst;
        }, this);


        this.optimizedResults = ko.observableArray();

        this.optimizeAllCases = function() {
            this.optimizedResults([]);
            let allpatterns = this.allPatterns();

            allpatterns.forEach(setting => {
                let calc = new Calc.DamageCalculator();
                calc = setting.character.applyDmgCalc(calc);
                calc = setting.weapon.applyDmgCalc(calc);
                calc = setting.artifactSet1.applyDmgCalc(calc);
                calc = setting.artifactSet2.applyDmgCalc(calc);

                [setting.clock, setting.cup, setting.hat].forEach(e => {
                    calc = Data.applyDmgCalcArtifactMainStatus(calc, setting.character.parent, e.value);
                });

                let dmg = calc.calculateDmg(2.565, {isPyro: true});

                this.optimizedResults.push({dmg: dmg.value, calc: calc, setting: setting});
            });

            this.optimizedResults.sort(function(a, b){
                return -(a.dmg - b.dmg);
            });

        }.bind(this);
    }

    window.viewModel = new ViewModel();

    ko.applyBindings(window.viewModel);


    (async () => {
        await nlopt.ready
        viewModel.readyNLopt(true);
    })();
});