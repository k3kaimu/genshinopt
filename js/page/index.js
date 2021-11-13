$(function(){


    function CharacterSelector(selectedChar)
    {
        this.selectedChar = selectedChar;
        this.characters = genshinData.characters;
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
        this.weapons = genshinData.weapons;
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
    }


    function MultiWeaponAdderModal(parent)
    {
        this.parent = parent;
        this.selWeaponRarity = ko.observable();


        this.weapons = [];
        genshinData.weapons.forEach(e => {
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


    function ViewModel() {
        this.selectedChar = ko.observable();
        this.characterSelector = new CharacterSelector(this.selectedChar);

        this.selConstellation = ko.observable();
        this.selNormalTalentRank = ko.observable();
        this.selSkillTalentRank = ko.observable();
        this.selBurstTalentRank = ko.observable();


        this.comparingWeaponList = ko.observableArray();

        this.addComparingWeapon = function()
        {
            this.comparingWeaponList.push(new ComparingWeaponData(this.selectedChar));
        }.bind(this);

        
        this.multiWeaponAdderModal = new MultiWeaponAdderModal(this);
        this.initMultiWeaponAdder = function(){
            this.multiWeaponAdderModal.uncheckALL();
        }.bind(this);

        this.totalBaseHP = ko.computed(function(){
            return tryAndDefault(() => this.selectedChar().baseHP, 0)
                +  tryAndDefault(() => this.selectedWeapon().baseHP, 0);
        }, this);
    }

    viewModel = new ViewModel;

    ko.applyBindings(viewModel);    
});