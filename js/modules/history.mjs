// @ts-check
/// <reference path="../main.js" />
/// <reference path="../lzma_worker-min.js" />
/// <reference path="../msgpack.min.js" />
import * as Data from '../modules/data.mjs';
import * as Migrator from '../modules/migrator.mjs';
import * as UI from '../modules/ui.mjs';
import * as Calc from '../modules/dmg-calc.mjs';


/**
 * @param {any} obj 
 * @returns {string}
 */
function compressHistory(obj)
{
    return uint8ArrayToBase64(MessagePack.encode(obj));
}


/**
 * @param {string} str 
 * @returns {any}
 */
function decompressHistory(str)
{
    return MessagePack.decode(base64ToUint8Array(str));
}


/**
 * @template T
 */
export class History
{
    /**
     * 
     * @param {string} key 
     * @param {number} limit 
     * @param {new(obj: any) => T} ctor
     * @param {Migrator.DataObjectMigrator} migrator 
     */
    constructor(key, limit, ctor, migrator)
    {
        // localStorageのkey
        this.key = key;

        // 最大何件保存するか
        this.limit = limit;

        this.migrator = migrator;

        this.ctor = ctor;

        // キャッシュ
        /** @type {T[]} */
        this.cache = this.getHistory();
    }


    // キャッシュをlocalStorageへ保存する
    saveToStorage()
    {
        /** @this {History} */
        function task() {
            const len = this.cache.length;
            if(len > this.limit) {
                this.cache = this.cache.slice(len - this.limit, len);
            }

            const datastr = compressHistory(this.cache.map(e => e.toJS()));
            const value = `${this.migrator.currentVersion()},${datastr}`;
            
            localStorage.setItem(this.key, value);
        }

        processTasksOnIdle([task.bind(this)], undefined);
    }


    /**
     * 
     * @returns {T[]}
     */
    getHistory() {
        if(this.cache)
            return this.cache.slice(0);
        else {
            const ver_and_data = (localStorage.getItem(this.key) || "").split(",");
            if(ver_and_data.length == 2) {
                const ver = Number(ver_and_data[0]);
                let data = decompressHistory(ver_and_data[1]);
                data = data.map(e => new (this.ctor)(this.migrator.migrate(ver, e)));
                return data;
            }
            else
                return [];
        }
    }


    /**
     * @param {...T} items 
     */
    push(...items) {
        this.cache.push(...items);
        this.saveToStorage();
    }
}


export class CharacterHistoryData
{
    character;      /// typeof(new CharacterViewModel().toJS())
    weapon;         /// typeof(new WeaponSelector().toJS())
    artifactSet;    /// typeof(new ArtifactSelector().toJS())
    artifactStat;   /// typeof(new ArtifactStatusSetting().toJS())
    externalBuff;   /// typeof(new ExternalBuffSetting().toJS())


    /**
     * 
     * @param {any} obj 
     */
    constructor(obj = {})
    {
        Object.assign(this, obj);
    }


    /**
     * 
     * @returns {string}
     */
    getCharacterId() {
        return this.character.parent_id;
    }


    /**
     * @returns {Calc.DamageCalculator}
     */
    makeDamageCalculator()
    {
        let calc = new Calc.DamageCalculator();

        let bundle = new UI.BundleSetting({
            bCharPicker: false,
            selectedChar: ko.observable(Data.lookupCharacter(this.character.parent_id)),
            bTalent: true,
            bAttack: false,
            bWeapon: true,
            bArtifact: true,
            bArtifactStatus: true,
            bExternalBuff: true
        });
        bundle.fromJS({
            cvmStg: this.character,
            wvmStg: this.weapon,
            avmStg: this.artifactSet,
            astats: this.artifactStat,
            exbStg: this.externalBuff,
        });

        return bundle.applyDmgCalc(calc);
    }


    toJS()
    {
        return this;
    }


    fromJS(obj)
    {
        Object.assign(this, obj);
    }
}


/**
 * キャラクターデータを新しいバージョンへ変換するためのオブジェクト
 */
let charHistoryMigrator = new Migrator.DataObjectMigrator();


/**
 * @type {History<CharacterHistoryData>}
 */
export let characterHistory;

// 読み込む
processTasksOnIdle([() => {
    characterHistory = new History("char_history", 1000, CharacterHistoryData, charHistoryMigrator);
}], undefined);
