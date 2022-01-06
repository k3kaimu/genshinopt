
function compressHistory(obj)
{
    return uint8ArrayToBase64(LZMA.compress(MessagePack.encode(obj)));
}


function decompressHistory(str)
{
    return MessagePack.decode(LZMA.decompress(base64ToUint8Array(str)));
}


export class History
{
    constructor(key, limit)
    {
        // localStorageのkey
        this.key = key;

        // 最大何件保存するか
        this.limit = limit;

        // キャッシュ
        this.cache = this.getHistory();
    }


    // キャッシュをlocalStorageへ保存する
    saveToStorage()
    {
        function task() {
            const len = this.cache.length;
            if(len > this.limit) {
                this.cache = this.cache.slice(len - this.limit, len);
            }

            localStorage.setItem(this.key, compressHistory(this.cache));
        }

        processTasksOnIdle([task.bind(this)], undefined);
    }


    getHistory() {
        if(this.cache)
            return this.cache.slice(0);
        else {
            let item = localStorage.getItem(this.key);

            if(item)
                return decompressHistory(item);
            else
                return [];
        }
    }


    push(...items) {
        this.cache.push(...items);
        this.saveToStorage();
    }
}


export let optimizedHistory = new History('optimizedHistory', 1000);
export let favoriteHistory = new History('favoriteHistory', 10000);
