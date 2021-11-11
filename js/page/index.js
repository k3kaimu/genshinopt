$(function(){

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
    }

    viewModel = new ViewModel;

    ko.applyBindings(viewModel);    
});