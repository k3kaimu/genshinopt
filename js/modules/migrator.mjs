
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
