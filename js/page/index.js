$(function(){


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


    function ViewModel() {
        this.characters = genshinData.characters;
        this.selCharElem = ko.observable();
        this.selCharRarity = ko.observable();
        this.selectedChar = ko.observable();
        // selCharList: ko.observableArray(genshinData.characters)
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


        this.selNormalTalentRank = ko.observable();
        this.selSkillTalentRank = ko.observable();
        this.selBurstTalentRank = ko.observable();


        this.comparingWeaponList = ko.observableArray();

        this.addComparingWeapon = function()
        {
            this.comparingWeaponList.push(new ComparingWeaponData(this.selectedChar));
        }.bind(this);


        this.totalBaseHP = ko.computed(function(){
            return tryAndDefault(() => this.selectedChar().baseHP, 0)
                +  tryAndDefault(() => this.selectedWeapon().baseHP, 0);
        }, this);
    }

    viewModel = new ViewModel;

    ko.applyBindings(viewModel);    
});