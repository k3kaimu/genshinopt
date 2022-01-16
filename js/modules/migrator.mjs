
class DataObjectMigrator
{
    constructor()
    {
        // this.migrationTable[i] is a function that migrate from version i to i+1.
        this.migrationTable = [];
    }


    // func: obj => obj
    appendPatch(func)
    {
        this.migrationTable.push(func);
    }


    currentVersion()
    {
        return this.migrationTable.length;
    }


    migrate(version, obj)
    {
        const MV = this.migrationTable.length;
        for(let v = version; v < MV; ++v) {
            obj = this.migrationTable[v](obj);
        }

        return obj;
    }
}


export let indexDataMigrator = new DataObjectMigrator();
export let calcDataMigrator = new DataObjectMigrator();

// index: v0 -> v1
indexDataMigrator.appendPatch(function(obj){
    let ch = obj.character;
    let at = obj.attack;

    obj.character = {
        vm: ch,
        attack: at
    };

    return obj;
});


// index: v1 -> v2
indexDataMigrator.appendPatch(function(obj){
    obj.buff.buffItems = [];
    obj.buff = [obj.buff];
    return obj;
});


// index: v2 -> v3
indexDataMigrator.appendPatch(function(obj){
    obj.character = {
        character_id: obj.character.vm.parent_id,
        settings: [{
            vm: obj.character.vm,
            attack: obj.character.attack
        }]
    };

    return obj;
});

// index: v3 -> v4
indexDataMigrator.appendPatch(function(obj){
    let newchar = {
        picked: {
            id: obj.character.character_id
        },
        list: obj.character.settings.map(e => e.vm),
    };

    let newatt = {
        id: obj.character.settings[0].attack.id
    };

    obj.character = newchar;
    obj.attack = newatt;

    return obj;
});

// index: v4 -> v5
indexDataMigrator.appendPatch(function(obj){
    obj.bundle = {
        "list": [],
        "bChar": false,
        "bAttk": false,
        "bWeap": false,
        "bArti": false,
        "bExbf": false
    };

    return obj;
});
