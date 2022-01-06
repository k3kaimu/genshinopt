

export class BufferEffect
{
    constructor(id, label, type)
    {
        this.id = id;
        this.label = label;
        this.type = type;
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
    constructor(id, label, type, target, value)
    {
        super(id, label, type);
        this.buffStatus = target;
        this.buffValue = value;
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

        calc[this.parent.buffStatus].value += this.parent.buffValue;

        return calc;
    }
}
