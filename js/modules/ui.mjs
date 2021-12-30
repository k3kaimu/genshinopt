import * as Data from '/js/modules/data.mjs';


export function CharacterSelector()
{
    this.selected = ko.observable();
    this.characters = Data.characters;
    this.elem = ko.observable();
    this.rarity = ko.observable();
    this.options = ko.pureComputed(function(){
        var list = [];
        var elem = this.elem();
        var rarity = this.rarity();
        

        this.characters.forEach(e => {
            if(!(elem == "ALL" || e.elem == elem))
                return;
            
            if(!(rarity == "ALL" || e.rarity == rarity))
                return;

            list.push(e);
        });

        return list;
    }, this);

    this.viewModel = ko.observable(new Data.CharacterViewModel(undefined));

    this.selected.subscribe(function(newCharacter){
        if(newCharacter == undefined)
            this.viewModel(new Data.CharacterViewModel(undefined));
        else
            this.viewModel(newCharacter.newViewModel());
    }.bind(this));

    this.attackOptions = ko.pureComputed(function(){
        if(this.selected() == undefined)
            return [];
        else
            return this.viewModel().presetAttacks();
    }, this);

    this.selectedAttack = ko.observable();

    this.toJS = function() {
        let obj = {};
        obj.vm = this.viewModel().toJS();
        obj.attack = {id: this.selectedAttack().id};

        return obj;
    }.bind(this);

    this.fromJS = function(obj) {
        this.selected(Data.lookupCharacter(obj.vm.parent_id));
        let charVM = this.viewModel();
        charVM.fromJS(obj.vm);
        this.viewModel(charVM);

        this.attackOptions().forEach(e => {
            if(e.id == obj.attack.id)
                this.selectedAttack(e);
        });
    }.bind(this);
}


export function WeaponSelector(selectedChar)
{
    this.weapons = Data.weapons;
    this.rarity = ko.observable();
    this.selected = ko.observable();
    this.options = ko.pureComputed(function(){
        var list = [];
        var rarity = this.rarity();
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

    this.viewModel = ko.observable(new Data.WeaponViewModel());
    this.selected.subscribe(function(newWeaponData){
        if(newWeaponData == undefined) {
            this.viewModel(new Data.WeaponViewModel(undefined));
        } else {
            this.viewModel(newWeaponData.newViewModel());
        }
    }.bind(this));

    this.toJS  = function() {
        let obj = {};
        obj.weapon = this.viewModel().toJS();
        return obj;
    }.bind(this);

    this.fromJS = function(obj) {
        this.selected(Data.lookupWeapon(obj.weapon.parent_id));
        
        let w = this.viewModel();
        w.fromJS(obj.weapon);
        this.viewModel(w);
    }.bind(this);
}


export function ArtifactSelector()
{
    this.artifacts = Data.artifacts;
    this.selected1 = ko.observable();
    this.selected2 = ko.observable();
    this.viewModel1 = ko.observable(new Data.ArtifactViewModel(undefined));
    this.viewModel2 = ko.observable(new Data.ArtifactViewModel(undefined));

    this.setViewModel = function(sel1, sel2, vm1, vm2){
        if(sel1.id == sel2.id) {
            vm1(sel1.newViewModel(4));
            vm2(new Data.ArtifactViewModel());
        } else {
            vm1(sel1.newViewModel(2));
            vm2(sel2.newViewModel(2));
        }
    }.bind(this);

    this.selected1.subscribe(function(newArt){
        let art2 = this.selected2();
        if(newArt == undefined) {
            this.viewModel1(new Data.ArtifactViewModel(undefined, 2));
            if(art2 != undefined)
                this.viewModel2(art2.newViewModel(2));

            return;
        }

        if(art2 != undefined)
            this.setViewModel(newArt, art2, this.viewModel1, this.viewModel2);
        else
            this.viewModel1(newArt.newViewModel(2));
    }.bind(this));

    this.selected2.subscribe(function(newArt){
        let art1 = this.selected1();
        if(newArt == undefined) {
            this.viewModel2(new Data.ArtifactViewModel(undefined, 2));
            if(art1 != undefined)
                this.viewModel1(art1.newViewModel(2));

            return;
        }

        if(art1 != undefined)
            this.setViewModel(art1, newArt, this.viewModel1, this.viewModel2);
        else
            this.viewModel2(newArt.newViewModel(2));
    }.bind(this));


    this.toJS = function(){
        let obj = {};
        obj.art1 = this.viewModel1().toJS();

        if(this.viewModel2().parent)
            obj.art2 = this.viewModel2().toJS();

        return obj;
    }.bind(this);

    this.fromJS = function(obj){
        this.selected1(Data.lookupArtifact(obj.art1.parent_id));

        if(obj.art2 == undefined) {
            // art1と同じ
            this.selected2(Data.lookupArtifact(obj.art1.parent_id));
        } else {
            this.selected2(Data.lookupArtifact(obj.art2.parent_id));
        }

        let a1 = this.viewModel1();
        a1.fromJS(obj.art1);
        this.viewModel1(a1);

        if(!(obj.art2 == undefined)) {
            let a2 = this.viewModel2();
            a2.fromJS(obj.art2);
            this.viewModel2(a2);
        }
    }.bind(this);
}
