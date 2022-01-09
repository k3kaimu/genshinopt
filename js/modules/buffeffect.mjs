

export class BufferEffect
{
    constructor(id, label, type)
    {
        this.id = id;
        this.label = label;
        this.type = type;       // "C": キャラ, "W": 武器, "A": 聖遺物, "F": 食料, "E": 元素共鳴
    }


    newViewModel() {
        return new BufferEffectViewModel(this);
    }
}


export class BufferEffectViewModel
{
    constructor(parent) {
        this.parent = parent;
    }


    applyDmgCalcImpl(calc)
    {
        return calc;
    }


    applyDmgCalc(calc)
    {
        return this.applyDmgCalcImpl(calc);
    }


    viewHTMLList()
    {
        return [];
    }


    toJS() {
        return {
            parent_id: this.parent.id,
        };
    }


    fromJS(obj) {

    }
}


export class ConstantBufferEffect extends BufferEffect
{
    constructor(id, label, type, targetAndValues)
    {
        super(id, label, type);
        this.buffStatus = targetAndValues;
    }


    newViewModel() {
        return new ConstantBufferEffectViewModel(this);
    }
}


export class ConstantBufferEffectViewModel extends BufferEffectViewModel
{
    constructor(parent)
    {
        super(parent);
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        Object.keys(this.parent.buffStatus).forEach(k => {
            calc[k].value += this.parent.buffStatus[k];
        });

        return calc;
    }
}


export class BufferEffectViewModelFactory extends BufferEffect
{
    constructor(id, label, type, fn)
    {
        super(id, label, type);
        this.fn = fn;
    }


    newViewModel()
    {
        return this.fn(this);
    }
}


export class CharacterBufferEffectViewModel extends BufferEffectViewModel
{
    constructor(parent)
    {
        super(parent);
        this.constell = ko.observable(6);           // 凸数, 無凸==0
        this.normalRank = ko.observable(9);         // 通常天賦
        this.skillRank = ko.observable(9);          // スキル天賦
        this.burstRank = ko.observable(9);          // 爆発天賦
    }


    maxNormalTalentRank() { return 11; }
    maxSkillTalentRank() { return 10; }
    maxBurstTalentRank() { return 10; }


    toJS() {
        let obj = super.toJS();
        obj.constell   = this.constell();
        obj.normalRank = this.normalRank();
        obj.skillRank  = this.skillRank();
        obj.burstRank  = this.burstRank();
        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.constell(obj.constell);
        this.normalRank(obj.normalRank);
        this.skillRank(obj.skillRank);
        this.burstRank(obj.burstRank);
    }
}