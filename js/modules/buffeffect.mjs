

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
