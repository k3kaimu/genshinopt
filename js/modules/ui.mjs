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
