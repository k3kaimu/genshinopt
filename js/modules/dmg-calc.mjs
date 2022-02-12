import * as TypeDefs from './typedefs.mjs';


export class ASTNode
{
    value;
    op;
    args;
    annotate;

    constructor(value, op, args, annotate)
    {
        this.value = value;
        this.op = op;
        this.args = args;
        this.annotate = annotate;
    }


    toSimplify()
    {
        let newNode = new ASTNode(this.value, this.op, this.args, this.annotate);

        if(newNode.op == 'constant') {
            return newNode;
        }

        // 全引数を簡単化する
        {
            let newargs = [];
            newNode.args.forEach(e => {
                if(newNode.op == '+' || newNode.op == "-") {
                    if(e.value == 0)
                        return;
                    else if(Math.abs(newNode.value) >= 0.1 && Math.abs(e.value) / Math.abs(newNode.value) < 1e-6)
                        return;
                }

                if(newNode.op == '*' || newNode.op == "/") {
                    if(e.value == 1)
                        return;
                    else if(Math.abs(e.value - 1) < 1e-6)
                        return;
                }

                newargs.push(e.toSimplify());
            });
            newNode.args = newargs;
        }

        // '+' と  '*'について展開する
        if(newNode.op == '+' || newNode.op == '*') {
            let newargs = [];
            newNode.args.forEach(e => {
                if(e.op == newNode.op && e.annotate == undefined) {
                    e.args.forEach(ee => newargs.push(ee) );
                } else {
                    newargs.push(e);
                }
            });
            
            newNode.args = newargs;
        }

        // 全引数が定数かつannotateがundefinedの場合は定数を伝搬する
        {
            let isConst = true;
            newNode.args.forEach(e => {
                isConst = isConst && e.op == 'constant' && e.annotate == undefined;
            });

            if(isConst) {
                return ASTNode.constant(newNode.value, newNode.annotate);
            }
        }

        if(newNode.op == '+' || newNode.op == '*') {
            if(newNode.args.length == 1 && newNode.annotate == undefined)
                return newNode.args[0];
            else if(newNode.args.length == 0 && newNode.op == '+')
                return ASTNode.constant(0, newNode.annotate);
            else if(newNode.args.length == 0 && newNoded.op == '*')
                return ASTNode.constant(1, newNode.annotate);
        }

        if(newNode.op == 'max') {
            if(newNode.args[0] >= newNode.args[1])
                return newNode.args[0].toSimplify();
            else
                return newNode.args[1].toSimplify();
        }

        if(newNode.op == 'min') {
            if(newNode.args[0] <= newNode.args[1])
                return newNode.args[0].toSimplify();
            else
                return newNode.args[1].toSimplify();
        }

        // let newargs = [];
        // this.args.forEach(e => newargs.push(e.toSimplify()) );
        return newNode;
    }


    static textValue(value)
    {
        let fix = Number(value).toFixed(4);
        let str = "" + value;
        return fix.length < str.length ? fix : str;
    }


    toExprText(pp = undefined)
    {
        if(this.op == 'constant') {
            return ASTNode.textValue(this.value);
        }

        if(this.op == '+' || this.op == '-') {
            let str = `${this.args[0].toExprText(this.op)}`;
            this.args.slice(1).forEach(e => {
                str += ` ${this.op} ${e.toExprText(this.op)}`;
            });

            if(pp == '-' || pp == '*' || pp == '/' || pp == '**')
                return '(' + str + ')';
            else
                return str;
        }

        if(this.op == '*' || this.op == '/') {
            let str = `${this.args[0].toExprText(this.op)}`;
            this.args.slice(1).forEach(e => {
                str += ` ${this.op} ${e.toExprText(this.op)}`;
            });

            if(pp == '**' || (this.op == '*' && pp == '/'))
                return '(' + str + ')';
            else
                return str;
        }

        if(this.op == '**') {
            return `${this.args[0].toExprText(this.op)} ${this.op} ${this.args[1].toExprText(this.op)}`;
        }

        if(this.op == 'min' || this.op == 'max') {
            return `Math.${this.op}(${this.args[0].toExprText(this.op)}, ${this.args[1].toExprText(this.op)})`;
        }

        if(this.op == 'log') {
            return `Math.${this.op}(${this.args[0].toExprText(this.op)})`;
        }

        return JSON.stringify(this);
    }


    static constant(value, ctx = undefined)
    {
        return new ASTNode(value, 'constant', [value], ctx);
    }


    static add(lhs, rhs, ctx = undefined) {
        return new ASTNode(lhs.value + rhs.value, '+', [lhs, rhs], ctx);
    }

    static sub(lhs, rhs, ctx = undefined) {
        return new ASTNode(lhs.value - rhs.value, '-', [lhs, rhs], ctx);
    }

    static mul(lhs, rhs, ctx = undefined) {
        return new ASTNode(lhs.value * rhs.value, '*', [lhs, rhs], ctx);
    }

    static div(lhs, rhs, ctx = undefined) {
        return new ASTNode(lhs.value / rhs.value, '/', [lhs, rhs], ctx);
    }

    static pow(lhs, rhs, ctx = undefined) {
        return new ASTNode(Math.pow(lhs.value, rhs.value), '**', [lhs, rhs], ctx);
    }

    static max(lhs, rhs, ctx = undefined) {
        return new ASTNode(Math.max(lhs.value, rhs.value), 'max', [lhs, rhs], ctx);
    }

    static min(lhs, rhs, ctx = undefined) {
        return new ASTNode(Math.min(lhs.value, rhs.value), 'min', [lhs, rhs], ctx);
    }

    static log(arg, ctx = undefined) {
        return new ASTNode(Math.log(arg), 'log', [arg], ctx);
    }
}



// Value and Gradient Data
// 値と勾配ベクトルを保持するデータ
export class VGData
{
    static #contexts = [];

    // for debug
    static doCalcExprText = false;
    static DIM = 7;

    #value;
    #grad;
    #annotate;
    #astnode;

    constructor(value, gradVec)
    {
        this.#value = value;
        this.#grad = gradVec;    // double[7]: [rateAtk, rateDef, rateHP, crtRate, crtDmg, recharge, mastery]
        this.#annotate = null;
        this.#astnode = null;
    }

    get value() { return this.#value; }
    get grad() { return this.#grad; }

    set value(v) {
        if(VGData.doCalcExprText)  {
            let diff = v - this.#value;
            let op = diff >= 0 ? '+' : '-';

            if(op == '+') {
                this.#astnode = ASTNode.add(this.toASTNode(), ASTNode.constant(diff, VGData.context));
            } else {
                this.#astnode = ASTNode.sub(this.toASTNode(), ASTNode.constant(diff, VGData.context));
            }
        }

        this.#value = v;
    }


    static pushContext(ctx)
    {
        this.#contexts.push(ctx);
    }


    static popContext()
    {
        this.#contexts.pop();
    }


    static get context() {
        if(VGData.#contexts.length == 0)
            return undefined;
        else
            return VGData.#contexts[VGData.#contexts.length - 1];
    }


    static zero()
    {
        return new VGData(0, [0, 0, 0, 0, 0, 0, 0]);
    }


    static constant(value)
    {
        return new VGData(value, [0, 0, 0, 0, 0, 0, 0]);
    }


    static newRateAtk(value)
    {
        return new VGData(value, [1, 0, 0, 0, 0, 0, 0]);
    }

    
    static newRateDef(value)
    {
        return new VGData(value, [0, 1, 0, 0, 0, 0, 0]);
    }


    static newRateHP(value)
    {
        return new VGData(value, [0, 0, 1, 0, 0, 0, 0]);
    }

    static newCrtRate(value)
    {
        return new VGData(value, [0, 0, 0, 1, 0, 0, 0]);
    }

    static newCrtDmg(value)
    {
        return new VGData(value, [0, 0, 0, 0, 1, 0, 0]);
    }

    static newRecharge(value)
    {
        return new VGData(value, [0, 0, 0, 0, 0, 1, 0]);
    }

    static newMastery(value)
    {
        return new VGData(value, [0, 0, 0, 0, 0, 0, 1]);
    }


    toASTNode() {
        if(this.#astnode)
            return this.#astnode;
        else
            return ASTNode.constant(this.#value);
    }


    as(annotate) {
        this.#annotate = annotate;

        if(this.#astnode == null)
            this.#astnode = ASTNode.constant(this.#value, annotate);
        else
            this.#astnode.annotate = annotate;

        return this;
    }


    dup() {
        var dst = VGData.zero();
        dst.#value = this.#value;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = this.#grad[i];
        }

        dst.#astnode = this.#astnode;

        return dst;
    }


    add_VGData(rhs) {
        var dst = VGData.zero();
        dst.#value = this.#value + rhs.#value;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = this.#grad[i] + rhs.#grad[i];
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.add(this.toASTNode(), rhs.toASTNode());
        }

        return dst;
    }


    add_number(rhs) {
        var dst = VGData.zero();
        dst.#value = this.#value + rhs;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = this.#grad[i];
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.add(this.toASTNode(), ASTNode.constant(rhs));
        }

        return dst;
    }


    // this + rhs
    add(rhs) {
        if(typeof rhs === "number")
            return this.add_number(rhs);
        else
            return this.add_VGData(rhs);
    }


    sub_VGData(rhs) {
        var dst = VGData.zero();
        dst.#value = this.#value - rhs.#value;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = this.#grad[i] - rhs.#grad[i];
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.sub(this.toASTNode(), rhs.toASTNode());
        }

        return dst;
    }

    
    sub_number(rhs) {
        var dst = VGData.zero();
        dst.#value = this.#value - rhs;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = this.#grad[i];
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.sub(this.toASTNode(), ASTNode.constant(rhs));
        }


        return dst;
    }


    // this - rhs
    sub(rhs) {
        if(typeof rhs === "number")
            return this.sub_number(rhs);
        else
            return this.sub_VGData(rhs);
    }


    mul_VGData(rhs) {
        var dst = VGData.zero();
        dst.#value = this.#value * rhs.#value;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = this.#grad[i] * rhs.#value + this.#value * rhs.#grad[i];
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.mul(this.toASTNode(), rhs.toASTNode());
        }

        return dst;
    }


    mul_number(rhs) {
        var dst = VGData.zero();
        dst.#value = this.#value * rhs;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = this.#grad[i] * rhs;
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.mul(this.toASTNode(), ASTNode.constant(rhs));
        }

        return dst;
    }


    // this * rhs
    mul(rhs) {
        if(typeof rhs === "number")
            return this.mul_number(rhs);
        else
            return this.mul_VGData(rhs);
    }


    div_VGData(rhs) {
        var dst = VGData.zero();
        dst.#value = this.#value / rhs.#value;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = (this.#grad[i] * rhs.#value - this.#value * rhs.#grad[i])/(rhs.#value * rhs.#value);
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.div(this.toASTNode(), rhs.toASTNode());
        }

        return dst;
    }


    div_number(rhs) {
        var dst = VGData.zero();
        dst.#value = this.#value / rhs;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = this.#grad[i] / rhs;
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.div(this.toASTNode(), ASTNode.constant(rhs));
        }

        return dst;
    }


    // this / rhs
    div(rhs) {
        if(typeof rhs === "number")
            return this.div_number(rhs);
        else
            return this.div_VGData(rhs);
    }


    // 逆数
    inv() {
        var dst = VGData.zero();
        dst.#value = 1 / this.#value;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = -this.#grad[i] / (this.#value * this.#value);
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.div(ASTNode.constant(1), this.toASTNode());
        }

        return dst;
    }


    // 累乗
    pow_number(num) {
        let dst = VGData.zero();
        dst.#value = Math.pow(this.#value, num);

        // d/dx f(x)^a = a f(x)^{a-1} f'(x)
        const pm1 = Math.pow(this.#value, num-1) * num;
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = pm1 * this.#grad[i]
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.pow(this.toASTNode(), ASTNode.constant(num));
        }

        return dst;
    }


    // Math.min(this, num)
    min_number(num) {
        let dst = undefined;
        if(this.#value > num) {
            dst = VGData.constant(num);
        } else {
            dst = VGData.zero().add(this);
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.min(this.toASTNode(), ASTNode.constant(num));
        }

        return dst;
    }


    // Math.max(this, num)
    max_number(num) {
        let dst = undefined;
        if(this.#value > num) {
            dst = VGData.zero().add(this);
        } else {
            dst = VGData.constant(num);
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.max(this.toASTNode(), ASTNode.constant(num));
        }

        return dst;
    }


    // natural log
    log() {
        var dst = VGData.zero();
        dst.#value = Math.log(this.#value);
        for(let i = 0; i < VGData.DIM; ++i) {
            dst.#grad[i] = this.#grad[i] / this.#value;
        }

        if(VGData.doCalcExprText) {
            dst.#astnode = ASTNode.log(this.toASTNode());
        }

        return dst;
    }


    isConstant()
    {
        let check = true;
        this.#grad.forEach(e => {
            if(e !== 0) check = false;
        });

        return check;
    }


    isConstantZero()
    {
        return this.#value === 0 && this.isConstant();
    }
}


export class Attacks
{
    constructor(damage)
    {
        this.damage = damage;
        this.chained = VGData.zero();
    }


    addChained(dmg)
    {
        this.chained = this.chained.add(dmg);
    }


    total() {
        return this.damage.add(this.chained);
    }


    static expect(probs, attacks, labels)
    {
        console.assert(probs.length == attacks.length && probs.length == labels.length, `(probs.length == ${probs.length}) and (attacks.length == ${attacks.length})`);

        if(probs.length == 0)
            return new Attacks(VGData.zero());

        let newAttacks = new Attacks(VGData.zero());
        attacks.forEach((e, i) => {
            const p = probs[i];
            newAttacks.damage = newAttacks.damage.add(e.damage.as(labels[i]).mul( VGData.constant(p).as('Prob') ));
            newAttacks.chained = newAttacks.chained.add(e.chained.as(labels[i]).mul( VGData.constant(p).as('Prob') ));
        });

        return newAttacks;
    }
}


/**
 * 攻撃の特徴を表すオブジェクトです．
 * このオブジェクトは連想配列です．
 * 予約済みキー以外はデフォルトでは，この攻撃に関連するすべての攻撃に継承されます．
 * 一方で，この攻撃のみにしか影響しないキー値には末尾に`*`を付ける必要があります．
 * @typedef {Object} AttackProps
 */


/**
 * 攻撃の特徴を表すオブジェクト
 */
export class AttackInfo
{
    constructor(scale, ref, props, prob)
    {
        this.scale = scale;
        this.ref = ref;
        this.props = props;

        if(typeof prob == "number")
            this.prob = VGData.constant(prob);
        else
            this.prob = prob;
    }

    /**
     * @type {number}
     */
    scale;


    /**
     * @type {string}
     */
    ref = "atk";

    /**
     * @type {AttackProps}
     */
    props;

    /**
     * @type {VGData}
     */
    prob;
}


/** ダメージ計算式を高速化するために，AttackInfosを圧縮します
 * @param {AttackInfo[]} attackInfos 
 * @param {string} level
 * @param {DamageCalculator | undefined} calc
 * @return {AttackInfo[]}
 */
export function compressAttackInfos(attackInfos, level = "weak", calc = undefined)
{
    let probs = attackInfos.map(e => e.prob);
    let ret = [];

    attackInfos.forEach(e1 => {
        let lvl = level;

        if(lvl === "strong") {
            let d1 = calc.increaseDamage(e1.props);
            let d2 = calc.chainedAttackDmg(e1.props);
            if(!d1.isConstantZero() || !d2.isConstantZero())
                lvl = "weak";
        }

        if(lvl === "strong") {
            let totalScale = VGData.zero();

            attackInfos.forEach((e2, i2) => {
                if(isShallowEqualObject(e1.props, e2.props) && e1.ref === e2.ref) {
                    totalScale = totalScale.add(probs[i2].mul(e2.scale));
                    probs[i2] = VGData.constant(0);
                }
            });

            if(totalScale.value !== 0) {
                ret.push(new AttackInfo(1, e1.ref, {...e1.props}, totalScale));
            }
        } else { 
            let totalProb = VGData.zero();

            attackInfos.forEach((e2, i2) => {
                if(e1.scale == e2.scale && isShallowEqualObject(e1.props, e2.props) && e1.ref === e2.ref) {
                    totalProb = totalProb.add(probs[i2]);
                    probs[i2] = VGData.constant(0);
                }
            });

            if(totalProb.value !== 0) {
                ret.push(new AttackInfo(e1.scale, e1.ref, {...e1.props}, totalProb));
            }
        }
    });

    return ret;
}

runUnittest(function(){
    let input1 = [
        new AttackInfo(2, "atk", {key1: 1}, 1),
        new AttackInfo(2, "atk", {key1: 1}, 0.5),
    ];

    let output1 = compressAttackInfos(input1);
    console.assert(output1.length == 1);
    console.assert(output1[0].prob.value == 1.5);
    console.assert(output1[0].scale == 2);


    let input2 = [
        new AttackInfo(1, "atk", {key1: 1}, 1),
        new AttackInfo(2, "atk", {key1: 1}, 0.5),
        new AttackInfo(2, "atk", {key1: 2}, 0.5),
    ];

    let output2 = compressAttackInfos(input2);
    console.assert(output2.length == 3);
});



// https://wikiwiki.jp/genshinwiki/%E3%83%80%E3%83%A1%E3%83%BC%E3%82%B8%E8%A8%88%E7%AE%97%E5%BC%8F
const elementalReactionCoeffTable = [
    [8, 10, 20, 26, 33],        // lv1
    [9, 11, 22, 28, 37],
    [9, 11, 23, 29, 39],
    [10, 12, 24, 31, 42],
    [11, 13, 27, 33, 44],
    [12, 14, 29, 37, 49],
    [12, 16, 31, 39, 52],
    [13, 17, 34, 42, 57],
    [16, 18, 37, 47, 62],
    [17, 20, 40, 51, 68],
    [18, 22, 44, 56, 73],
    [20, 23, 48, 60, 81],
    [22, 27, 53, 67, 89],
    [23, 29, 58, 72, 97],
    [27, 32, 64, 80, 107],
    [29, 34, 70, 88, 118],
    [31, 38, 77, 96, 128],
    [34, 41, 83, 104, 139],
    [37, 44, 90, 112, 150],
    [40, 48, 97, 120, 161],
    [42, 51, 103, 129, 172],
    [46, 54, 110, 137, 183],
    [48, 58, 117, 146, 194],
    [51, 61, 123, 153, 206],
    [53, 64, 130, 162, 217],
    [56, 68, 136, 169, 226],
    [59, 70, 141, 177, 236],
    [61, 73, 147, 184, 246],
    [64, 78, 156, 194, 259],
    [68, 81, 163, 203, 272],
    [71, 86, 171, 213, 284],
    [74, 89, 178, 223, 298],
    [77, 92, 186, 232, 310],
    [80, 97, 193, 242, 323],
    [84, 101, 202, 253, 338],
    [88, 106, 211, 264, 352],
    [91, 110, 220, 276, 368],
    [96, 114, 230, 287, 383],
    [99, 119, 239, 299, 399],
    [103, 123, 248, 310, 414],
    [107, 129, 258, 322, 430],
    [111, 134, 269, 336, 448],
    [117, 140, 280, 350, 467],
    [121, 146, 291, 364, 487],
    [128, 153, 307, 383, 511],
    [133, 161, 322, 402, 537],
    [140, 169, 338, 422, 562],
    [147, 177, 353, 442, 590],
    [154, 184, 370, 463, 618],
    [161, 193, 388, 484, 647],
    [168, 201, 403, 504, 673],
    [174, 210, 420, 526, 700],
    [182, 218, 437, 547, 729],
    [189, 227, 453, 568, 757],
    [199, 239, 478, 598, 797],
    [208, 249, 499, 624, 832],
    [217, 260, 521, 651, 868],
    [226, 271, 543, 679, 906],
    [236, 283, 567, 709, 944],
    [246, 296, 591, 739, 986],
    [257, 308, 616, 770, 1027],
    [269, 323, 647, 808, 1078],
    [282, 339, 678, 848, 1130],
    [296, 354, 710, 888, 1184],
    [311, 374, 749, 936, 1248],
    [326, 390, 781, 977, 1302],
    [339, 407, 814, 1019, 1359],
    [353, 424, 849, 1061, 1416],
    [368, 441, 883, 1104, 1472],
    [382, 459, 918, 1148, 1531],
    [397, 477, 953, 1191, 1589],
    [412, 494, 989, 1237, 1649],
    [426, 510, 1021, 1277, 1702],
    [438, 526, 1052, 1316, 1754],
    [457, 548, 1097, 1371, 1828],
    [473, 568, 1136, 1420, 1893],
    [489, 587, 1174, 1469, 1958],
    [506, 607, 1213, 1517, 2022],
    [522, 627, 1253, 1567, 2089],
    [538, 646, 1292, 1616, 2154],
    [554, 666, 1331, 1664, 2219],
    [571, 686, 1371, 1714, 2286],
    [588, 706, 1411, 1764, 2352],
    [604, 726, 1451, 1814, 2420],
    [627, 752, 1504, 1880, 2507],
    [644, 773, 1547, 1933, 2578],
    [662, 794, 1590, 1988, 2650],
    [681, 818, 1636, 2044, 2727],
    [702, 842, 1686, 2107, 2810],
    [723, 868, 1736, 2170, 2893]];  // lv90


// 防御補正と元素耐性補正を除いた部分の期待値計算を行う
export class DamageCalculator
{
    constructor()
    {
        this.character = undefined;
        this.weapon = undefined;
        this.characterLv = 90;
        this.enemyLv = 90;

        this.baseAtk = VGData.zero();
        this.rateAtk = VGData.zero();
        this.addAtk = VGData.zero();
        this.baseDef = VGData.zero();
        this.rateDef = VGData.zero();
        this.addDef = VGData.zero();
        this.baseHP = VGData.zero();
        this.rateHP = VGData.zero();
        this.addHP = VGData.zero();

        this.baseCrtRate = VGData.zero();
        this.baseCrtDmg = VGData.zero();

        this.baseAllDmg = VGData.zero();
        this.baseAnemoDmg = VGData.zero();
        this.baseGeoDmg = VGData.zero();
        this.baseElectroDmg = VGData.zero();
        this.basePyroDmg = VGData.zero();
        this.baseHydroDmg = VGData.zero();
        this.baseCryoDmg = VGData.zero();
        this.baseDendroDmg = VGData.zero();
        this.basePhysicalDmg = VGData.zero();
        this.baseNormalDmg = VGData.zero();     // 通常攻撃ダメージバフ
        this.baseChargedDmg = VGData.zero();    // 重撃ダメージバフ
        this.basePlungeDmg = VGData.zero();     // 落下ダメージバフ
        this.baseSkillDmg = VGData.zero();      // スキルダメージ
        this.baseBurstDmg = VGData.zero();      // 元素爆発ダメージ
        this.baseSwirlBonus = VGData.zero();            // 拡散ボーナス
        this.baseCrystalizeBonus = VGData.zero();       // 結晶化ボーナス
        this.baseVaporizeBonus = VGData.zero();         // 蒸発ボーナス
        this.baseOverloadedBonus = VGData.zero();       // 過負荷ボーナス
        this.baseMeltBonus = VGData.zero();             // 融解ボーナス
        this.baseElectroChargedBonus = VGData.zero();   // 感電ボーナス
        this.baseFrozenBonus = VGData.zero();           // 凍結ボーナス
        this.baseSuperconductBonus = VGData.zero();     // 超伝導ボーナス
        this.baseShatteredBonus = VGData.zero();        // 氷砕き
        this.baseBurningBonus = VGData.zero();          // 燃焼ボーナス

        this.baseRecharge = VGData.zero();      // 元素チャージ効率
        this.baseMastery = VGData.zero();       // 元素熟知

        this.baseRateShieldStrength = VGData.zero();    // シールド強化
        this.baseHealingBonus = VGData.zero();          // 与える治癒効果
        this.baseHealedBonus = VGData.zero();           // 受ける治癒効果

        // 聖遺物サブオプション
        this.artRateAtk = VGData.newRateAtk(0);
        this.artRateDef = VGData.newRateDef(0);
        this.artRateHP = VGData.newRateHP(0);
        this.artCrtRate = VGData.newCrtRate(0);
        this.artCrtDmg = VGData.newCrtDmg(0);
        this.artRecharge = VGData.newRecharge(0);
        this.artMastery = VGData.newMastery(0);

        // 耐性
        this.baseAllResis = VGData.constant(0.1);
        this.baseAnemoResis = VGData.zero();
        this.baseGeoResis = VGData.zero();
        this.baseElectroResis = VGData.zero();
        this.basePyroResis = VGData.zero();
        this.baseHydroResis = VGData.zero();
        this.baseCryoResis = VGData.zero();
        this.baseDendroResis = VGData.zero();
        this.basePhysicalResis = VGData.zero();

        // 敵の防御の倍率
        this.baseEnemyRateDef = VGData.constant(1);

        // 敵の防御力を無視
        this.baseIgnoreEnemyDef = VGData.constant(0);
    }


    postCopyDup()
    {
        this.baseAtk = this.baseAtk.dup();
        this.rateAtk = this.rateAtk.dup();
        this.addAtk = this.addAtk.dup();
        this.baseDef = this.baseDef.dup();
        this.rateDef = this.rateDef.dup();
        this.addDef = this.addDef.dup();
        this.baseHP = this.baseHP.dup();
        this.rateHP = this.rateHP.dup();
        this.addHP = this.addHP.dup();

        this.baseCrtRate = this.baseCrtRate.dup();
        this.baseCrtDmg = this.baseCrtDmg.dup();

        this.baseAllDmg = this.baseAllDmg.dup();
        this.baseAnemoDmg = this.baseAnemoDmg.dup();
        this.baseGeoDmg = this.baseGeoDmg.dup();
        this.baseElectroDmg = this.baseElectroDmg.dup();
        this.basePyroDmg = this.basePyroDmg.dup();
        this.baseHydroDmg = this.baseHydroDmg.dup();
        this.baseCryoDmg = this.baseCryoDmg.dup();
        this.baseDendroDmg = this.baseDendroDmg.dup();
        this.basePhysicalDmg = this.basePhysicalDmg.dup();
        this.baseNormalDmg = this.baseNormalDmg.dup();
        this.baseChargedDmg = this.baseChargedDmg.dup();
        this.basePlungeDmg = this.basePlungeDmg.dup();
        this.baseSkillDmg = this.baseSkillDmg.dup();
        this.baseBurstDmg = this.baseBurstDmg.dup();
        this.baseSwirlBonus = this.baseSwirlBonus.dup();
        this.baseCrystalizeBonus = this.baseCrystalizeBonus.dup();
        this.baseVaporizeBonus = this.baseVaporizeBonus.dup();
        this.baseOverloadedBonus = this.baseOverloadedBonus.dup();
        this.baseMeltBonus = this.baseMeltBonus.dup();
        this.baseElectroChargedBonus = this.baseElectroChargedBonus.dup();
        this.baseFrozenBonus = this.baseFrozenBonus.dup();
        this.baseSuperconductBonus = this.baseSuperconductBonus.dup();
        this.baseShatteredBonus = this.baseShatteredBonus.dup();
        this.baseBurningBonus = this.baseBurningBonus.dup();

        this.baseRecharge = this.baseRecharge.dup();
        this.baseMastery = this.baseMastery.dup();

        this.baseRateShieldStrength = this.baseRateShieldStrength.dup();
        this.baseHealingBonus = this.baseHealingBonus.dup();
        this.baseHealedBonus = this.baseHealedBonus.dup();

        this.artRateAtk = this.artRateAtk.dup();
        this.artRateDef = this.artRateDef.dup();
        this.artRateHP = this.artRateHP.dup();
        this.artCrtRate = this.artCrtRate.dup();
        this.artCrtDmg = this.artCrtDmg.dup();
        this.artRecharge = this.artRecharge.dup();
        this.artMastery = this.artMastery.dup();

        this.baseAllResis = this.baseAllResis.dup();
        this.baseAnemoResis = this.baseAnemoResis.dup();
        this.baseGeoResis = this.baseGeoResis.dup();
        this.baseElectroResis = this.baseElectroResis.dup();
        this.basePyroResis = this.basePyroResis.dup();
        this.baseHydroResis = this.baseHydroResis.dup();
        this.baseCryoResis = this.baseCryoResis.dup();
        this.baseDendroResis = this.baseDendroResis.dup();
        this.basePhysicalResis = this.basePhysicalResis.dup();

        this.baseEnemyRateDef = this.baseEnemyRateDef.dup();
        this.baseIgnoreEnemyDef = this.baseIgnoreEnemyDef.dup();
    }


    /** 攻撃リストに関連するすべての攻撃を返します．
     * この関数はオーバーライドしないでください．
     * @param {AttackInfo[]} attackInfos
     * @return {AttackInfo[]} 
     */
    getAllAttackInfos(attackInfos)
    {
        /** @type {AttackInfo[]} */
        let infos = [];
        attackInfos.forEach(info => {
            this.modifyAttackInfo(info).forEach(modinfo => {
                infos.push(modinfo);
                console.assert(modinfo.props.isAttack !== undefined);

                // この攻撃自体が連鎖攻撃かチェイン不可能ならば連鎖の計算はしない
                if(modinfo.props.isAttack && (modinfo.props.isChained || ("isChainable" in modinfo.props && modinfo.props.isChainable === false)))
                    return;

                this.chainedAttackInfos(modinfo).forEach(e => {
                    e.props.isChained = true;
                    infos.push(this.modifyAttackInfo(e));
                });
            });
        });

        return infos.flat(10);
    }


    /** ダメージ自体の特性を変更します．
     * この関数は継承によって，同一引数に対して複数回呼び出される可能性があるため，
     * 冪等である必要があります．
     * @param {AttackInfo} attackInfo 
     * @return {AttackInfo[]}
     */
    modifyAttackInfo(attackInfo)
    {
        if(attackInfo.props.isAttack === undefined) {
            attackInfo.props = {...attackInfo.props, isAttack: true};
        }

        return [attackInfo];
    }

    /** あるダメージに起因して発生する追加ダメージの計算をするためのattackPropsと倍率を返します
     * この関数は継承によって，同一引数に対して複数回呼び出される可能性があるため，
     * 冪等である必要があります．
     * @param {AttackInfo} parentAttackInfo 
     * @return {AttackInfo[]}
     */
    chainedAttackInfos(parentAttackInfo)
    {
        return [];
    }


    /** ダメージ計算をします．引数のAttackInfoのprobは無視されます
     * この関数は継承によって，同一引数に対して複数回呼び出される可能性があるため，
     * 冪等である必要があります．また，probの和は1である必要があります．
     * @param {AttackInfo} info
     * @returns {Attacks}
     */
    calculate(info)
    {
        console.assert(info.props.isAttack === true);

        let dmg = undefined;

        if(hasAnyPropertiesWithSameValue(info.props, {
            isSuperconduct: true, isSwirl: true, isElectroCharged: true,
            isShattered: true, isOverloaded: true
        })) {
            // 溶解・蒸発以外の元素反応ダメージ
            dmg = this.calculateElementalReactionDmg(info.props);
        } else {
            // 一般のダメージ計算と溶解・蒸発の元素反応ダメージ
            dmg = this.calculateNormalDmg(info);
        }

        let attack = new Attacks(dmg);

        if(hasAllPropertiesWithSameValue(info.props, {isChainable: false})) {
            // 追撃が発生しない
            return attack;
        } else {
            // 追撃の計算
            attack.addChained(this.chainedAttackDmg(info.props));
            return attack;
        }
    }


    // 蒸発・融解以外の元素反応のダメージ計算
    calculateElementalReactionDmg(attackProps)
    {
        var reactType = undefined;
        var bonus = VGData.zero();
        let resis = undefined;
        if(attackProps.isSuperconduct)      { reactType = 0; resis = this.calculateTotalResistanceBonus({isCryo: true});        bonus = bonus.add(this.superconductBonus()); }
        if(attackProps.isSwirl)             { reactType = 1; resis = this.calculateTotalResistanceBonus(attackProps);           bonus = bonus.add(this.swirlBonus()); }
        if(attackProps.isElectroCharged)    { reactType = 2; resis = this.calculateTotalResistanceBonus({isElectro: true});     bonus = bonus.add(this.electroChargedBonus()); }
        if(attackProps.isShattered)         { reactType = 3; resis = this.calculateTotalResistanceBonus({isPhysical: true});    bonus = bonus.add(this.shatteredBonus()); }
        if(attackProps.isOverloaded)        { reactType = 4; resis = this.calculateTotalResistanceBonus({isPyro: true});        bonus = bonus.add(this.overloadedBonus()); }

        // レベルごとの係数を参照
        var coef = VGData.constant(elementalReactionCoeffTable[this.characterLv - 1][reactType]);
        console.assert(!(reactType == undefined), attackProps + " is not an elemental reaction.");

        var masteryBonus = this.mastery().mul(16).div(this.mastery().add(2000));

        return coef.mul(masteryBonus.add(1).add(bonus))
                .mul(resis.as('Resis'));
    }


    // 一般のダメージ計算（蒸発・融解のボーナスを含む）
    // このメソッドのオーバーライドは非推奨
    // 引数のAttackInfoのprobは無視されます
    calculateNormalDmg(info)
    {
        let attackProps = info.props;
        if(attackProps == undefined)
            attackProps = {};

        var dmgbuff = this.calculateTotalDmgBuff(attackProps);

        let dmg = this[info.ref](attackProps).mul(VGData.constant(info.scale).as('TalentDMGScale'))
                    .add(this.increaseDamage(attackProps).as('incDMG'));

        if(attackProps.isForcedCritical || false)
        {
            // critical
            dmg = dmg.mul(this.crtDmg(attackProps).as('CrtDMG').add(1));
        }
        else if(attackProps.isForcedNonCritical || false)
        {
            // not critical
            dmg = dmg;  // Nop
        }
        else
        {
            // expected value
            dmg = dmg.mul(this.crtRate(attackProps).as('CrtRate').min_number(1).max_number(0).mul(this.crtDmg(attackProps).as('CrtDMG')).add(1));
        }
        
        // damage buffs
        dmg = dmg.mul(dmgbuff.as('DMGBuff').add(1));
        
        return dmg
                .mul(this.calculateVaporizeMeltBonus(attackProps).as('VapMeltBonus'))
                .mul(this.calcAttenuationByEnemy(attackProps).as('LvlAtt'))
                .mul(this.calculateTotalResistanceBonus(attackProps).as('Resis'));
    }


    // シナバースビンドルなどの，そもそものダメージを増加させる効果
    increaseDamage(attackProps) {
        return VGData.zero();
    }

    // 古華・試作など，一定の条件での追撃
    // attackPropsがisChainable: falseでは発火しない
    // parentAttackPropsは追撃の発生元となった攻撃のattackProps
    // 非推奨
    chainedAttackDmg(parentAttackProps) {
        return VGData.zero();
    }


    atk(attackProps) { return this.baseAtk.as('baseAtk').mul(this.rateAtk_(attackProps).add(1)).add(this.addAtk.as('addAtk')); }
    rateAtk_(attackProps) { return this.rateAtk.add(this.artRateAtk.as('artRateAtk')).as('rateAtk'); }
    
    def(attackProps) { return this.baseDef.as('baseDef').mul(this.rateDef_(attackProps).add(1)).add(this.addDef.as('addDef')); }
    rateDef_(attackProps) { return this.rateDef.add(this.artRateDef.as('artRateDef')).as('rateDef'); }
    
    hp(attackProps) { return this.baseHP.mul(this.rateHP_(attackProps).add(1)).add(this.addHP); }
    rateHP_(attackProps) { return this.rateHP.add(this.artRateHP); }

    crtRate(attackProps) { return this.baseCrtRate.add(this.artCrtRate); }
    crtDmg(attackProps) { return this.baseCrtDmg.add(this.artCrtDmg); }

    allDmgBuff(attackProps) { return this.baseAllDmg; }
    anemoDmgBuff(attackProps) { return this.baseAnemoDmg; }
    geoDmgBuff(attackProps) { return this.baseGeoDmg; }
    electroDmgBuff(attackProps) { return this.baseElectroDmg; }
    pyroDmgBuff(attackProps) { return this.basePyroDmg; }
    hydroDmgBuff(attackProps) { return this.baseHydroDmg; }
    cryoDmgBuff(attackProps) { return this.baseCryoDmg; }
    dendroDmgBuff(attackProps) { return this.baseDendroDmg; }
    physicalDmgBuff(attackProps) { return this.basePhysicalDmg; }
    normalDmgBuff(attackProps) { return this.baseNormalDmg; }
    chargedDmgBuff(attackProps) { return this.baseChargedDmg; }
    plungeDmgBuff(attackProps) { return this.basePlungeDmg; }
    skillDmgBuff(attackProps) { return this.baseSkillDmg; }
    burstDmgBuff(attackProps) { return this.baseBurstDmg; }
    swirlBonus(attackProps) { return this.baseSwirlBonus; }
    crystalizeBonus(attackProps) { return this.baseCrystalizeBonus; }
    vaporizeBonus(attackProps) { return this.baseVaporizeBonus; }
    overloadedBonus(attackProps) { return this.baseOverloadedBonus; }
    meltBonus(attackProps) { return this.baseMeltBonus; }
    electroChargedBonus(attackProps) { return this.baseElectroChargedBonus; }
    frozenBonus(attackProps) { return this.baseFrozenBonus; }
    shatteredBonus(attackProps) { return this.baseShatteredBonus; }
    superconductBonus(attackProps) { return this.baseSuperconductBonus; }
    burningBonus(attackProps) { return this.baseBurningBonus; }

    allResis(attackProps) { return this.baseAllResis; }
    anemoResis(attackProps) { return this.baseAnemoResis; }
    geoResis(attackProps) { return this.baseGeoResis; }
    electroResis(attackProps) { return this.baseElectroResis; }
    pyroResis(attackProps) { return this.basePyroResis; }
    hydroResis(attackProps) { return this.baseHydroResis; }
    cryoResis(attackProps) { return this.baseCryoResis; }
    dendroResis(attackProps) { return this.baseDendroResis; }
    physicalResis(attackProps) { return this.basePhysicalResis; }

    recharge(attackProps) { return this.baseRecharge.add(this.artRecharge); }
    mastery(attackProps) { return this.baseMastery.add(this.artMastery); }

    enemyRateDef(attackProps) { return this.baseEnemyRateDef; }
    ignoreEnemyDef(attackProps) { return this.baseIgnoreEnemyDef; }

    calculateTotalDmgBuff(attackProps) {
        var dmgbuff = this.allDmgBuff(attackProps);
        if(attackProps.isAnemo)     dmgbuff = dmgbuff.add(this.anemoDmgBuff(attackProps));
        if(attackProps.isGeo)       dmgbuff = dmgbuff.add(this.geoDmgBuff(attackProps));
        if(attackProps.isElectro)   dmgbuff = dmgbuff.add(this.electroDmgBuff(attackProps));
        if(attackProps.isPyro)      dmgbuff = dmgbuff.add(this.pyroDmgBuff(attackProps));
        if(attackProps.isHydro)     dmgbuff = dmgbuff.add(this.hydroDmgBuff(attackProps));
        if(attackProps.isCryo)      dmgbuff = dmgbuff.add(this.cryoDmgBuff(attackProps));
        if(attackProps.isDendro)    dmgbuff = dmgbuff.add(this.dendroDmgBuff(attackProps));
        if(attackProps.isPhysical)  dmgbuff = dmgbuff.add(this.physicalDmgBuff(attackProps));
        if(attackProps.isNormal)    dmgbuff = dmgbuff.add(this.normalDmgBuff(attackProps));
        if(attackProps.isCharged)   dmgbuff = dmgbuff.add(this.chargedDmgBuff(attackProps));
        if(attackProps.isPlunge)    dmgbuff = dmgbuff.add(this.plungeDmgBuff(attackProps));
        if(attackProps.isSkill)     dmgbuff = dmgbuff.add(this.skillDmgBuff(attackProps));
        if(attackProps.isBurst)     dmgbuff = dmgbuff.add(this.burstDmgBuff(attackProps));

        return dmgbuff;
    }


    calculateVaporizeMeltBonus(attackProps) {
        if(attackProps.isVaporize || attackProps.isMelt) {
            var reactBonus = this.mastery(attackProps).mul(25).div(this.mastery(attackProps).add(1400).mul(9));
            if(attackProps.isVaporize)      reactBonus = reactBonus.add(this.vaporizeBonus(attackProps));
            if(attackProps.isMelt)          reactBonus = reactBonus.add(this.meltBonus(attackProps));

            var reactScale = 1;
            if((attackProps.isHydro) && (attackProps.isVaporize)) reactScale = 2;     // 炎 -> 水
            if((attackProps.isPyro) && (attackProps.isVaporize))  reactScale = 1.5;   // 水 -> 炎
            if((attackProps.isPyro) && (attackProps.isMelt))      reactScale = 2;     // 氷 -> 炎
            if((attackProps.isCryo) && (attackProps.isMelt))      reactScale = 1.5;   // 炎 -> 氷

            // 元々が物理か蒸発・溶解が発生しない元素
            if(reactScale == 1) {
                return VGData.constant(1);
            }

            return reactBonus.add(1).mul(reactScale);
        } else {
            return VGData.constant(1);
        }
    }


    calculateTotalResistanceBonus(attackProps) {
        var dmgResis = this.allResis(attackProps);
        if(attackProps.isAnemo)     dmgResis = dmgResis.add(this.anemoResis(attackProps));
        if(attackProps.isGeo)       dmgResis = dmgResis.add(this.geoResis(attackProps));
        if(attackProps.isElectro)   dmgResis = dmgResis.add(this.electroResis(attackProps));
        if(attackProps.isPyro)      dmgResis = dmgResis.add(this.pyroResis(attackProps));
        if(attackProps.isHydro)     dmgResis = dmgResis.add(this.hydroResis(attackProps));
        if(attackProps.isCryo)      dmgResis = dmgResis.add(this.cryoResis(attackProps));
        if(attackProps.isDendro)    dmgResis = dmgResis.add(this.dendroResis(attackProps));
        if(attackProps.isPhysical)  dmgResis = dmgResis.add(this.physicalResis(attackProps));

        if(dmgResis.value < 0) {
            return VGData.constant(1).sub(dmgResis.mul(0.5));
        } else if(dmgResis.value < 0.75) {
            return VGData.constant(1).sub(dmgResis);
        } else {
            return VGData.constant(1).div(dmgResis.mul(4).add(1));
        }
    }


    calculateHealing(baseValue)
    {
        return this.baseHealingBonus.add(1).mul(this.baseHealedBonus.add(1)).mul(baseValue);
    }


    // https://wikiwiki.jp/genshinwiki/%E8%81%96%E9%81%BA%E7%89%A9#ParamSubOps
    calcSubOptionCost(x)
    {
        return  VGData.newRateAtk(x[0]).div(0.047)
                .add(VGData.newRateDef(x[1]).div(0.058))
                .add(VGData.newRateHP(x[2]).div(0.047))
                .add(VGData.newCrtRate(x[3]).div(0.031))
                .add(VGData.newCrtDmg(x[4]).div(0.062))
                .add(VGData.newRecharge(x[5]).div(0.052))
                .add(VGData.newMastery(x[6]).div(19))
                .mul(6.2);
    }


    // https://wikiwiki.jp/genshinwiki/%E8%81%96%E9%81%BA%E7%89%A9#ParamSubOps
    calcUpperBounds(cost, objfunc)
    {
        var rect = [
            cost / 6.2 * 0.047,
            cost / 6.2 * 0.058,
            cost / 6.2 * 0.047,
            cost / 6.2 * 0.031,
            cost / 6.2 * 0.062,
            cost / 6.2 * 0.052,
            cost / 6.2 * 19];

        var grad = objfunc([0, 0, 0, 0, 0, 0, 0]).grad;
        for(let i = 0; i < VGData.DIM; ++i)
            if(grad[i] < 1e-4)
                rect[i] = 0;
        
        return rect;
    }


    calcAttenuationByEnemy(attackProps)
    {
        let rateDef = this.enemyRateDef(attackProps).mul(VGData.constant(1).sub(this.ignoreEnemyDef(attackProps)));
        return (rateDef.mul(this.enemyLv + 100).add(this.characterLv + 100)).inv().mul(this.characterLv + 100);
    }


    applyExtension(exFn) {
        let Calc = Object.getPrototypeOf(this).constructor;
        let NewCalc = exFn(Calc);
        return Object.assign(new NewCalc(), this);
    }


    /**
     * 
     * @param {TypeDefs.TalentEffect | TypeDefs.WeaponEffect} effect 
     * @param {*} viewModel
     * @returns {Calc.DamageCalculator}
     */
    applyEffect(effect, viewModel) {
        let vmdata = viewModel.toJS();
        let calc = this;

        if(effect.cond(viewModel)) {
            effect.list.forEach(e => {
                if(e.isDynamic) {
                    if(e.target == "addChainedAttackInfo")
                    {
                        calc = calc.applyExtension(Klass => class extends Klass {
                            chainedAttackInfos(info) {
                                let ret = super.chainedAttackInfos(info);

                                if(e.condAttackProps(info.props)) {
                                    let adds = [e.value(vmdata, this, info)].flat(10);
                                    ret.push(...adds);
                                } else {
                                    return ret;
                                }

                                return ret;
                            }
                        });
                    }
                    else if(e.target == "modifyAttackInfo")
                    {
                        calc = calc.applyExtension(Klass => class extends Klass {
                            modifyAttackInfo(attackInfo) {
                                return super.modifyAttackInfo(attackInfo).map(info => {
                                    if(e.condAttackProps(info.props)) {
                                        return e.value(vmdata, this, info)
                                    } else {
                                        return info;
                                    }
                                }).flat(10);
                            }
                        });
                    }
                    else
                    {
                        // TODO: もっと上手い解決方法はないか？
                        let ctx = VGData.context;
                        eval(`calc = calc.applyExtension(Klass => class extends Klass {
                            ${e.target}(attackProps) {
                                if(e.condAttackProps(attackProps)) {
                                    let v = e.value(vmdata, this, attackProps);
                                    if(typeof v == 'number')
                                        v = VGData.constant(v);

                                    return super.${e.target}(attackProps).add(v.as(ctx));
                                } else
                                    return super.${e.target}(attackProps);
                            }});`);
                    }
                } else {
                    calc[e.target].value += e.value(viewModel);
                }
            });
        }

        return calc;
    }
}


/**
 * AttackPropsを作成します．
 * @param {AttackProps} props 
 * @returns {AttackProps}
 */
export function newAttackProps(parentProps = {})
{
    let ret = deleteAllAttackTypeFromAttackProps(parentProps);
    ret = deleteAllElementFromAttackProps(ret);

    let keys = Object.keys(ret);
    keys.forEach(k => {
        if(k.endsWith('*'))
            deleteProperties(ret, [k]);
    });

    return ret;
}

runUnittest(function(){
    console.assert(newAttackProps({ isSkill: true }).isSkill === undefined);
    console.assert(newAttackProps({ isAnemo: true }).isAnemo === undefined);
    console.assert(newAttackProps({ "isSomeProps": true }).isSomeProps === true);
    console.assert(newAttackProps({ "isSomeProps*": true }).isSomeProps === undefined);
});


/**
 * @param {AttackProps} props 
 * @returns {AttackProps}
 */
export function deleteAllElementFromAttackProps(props)
{
    const elmnt = ["isAnemo", "isGeo", "isElectro", "isPyro", "isHydro", "isCryo", "isDendro", "isPhysical"];
    const react = ["isVaporize", "isMelt", "isSuperconduct", "isSwirl", "isElectroCharged", "isShattered", "isOverloaded"];

    props = deleteProperties(shallowDup(props), elmnt);
    props = deleteProperties(props, react);
    return props;
}


/**
 * @param {AttackProps} props 
 * @returns {AttackProps}
 */
export function deleteAllAttackTypeFromAttackProps(props)
{
    const types = ["isNormal", "isCharged", "isPlunge", "isSkill", "isBurst", "isHeal", "isAttack"];

    return deleteProperties(shallowDup(props), types);
}


/**
 * @param {{prob: number, ...}[]} propsAndProbs 
 * @return {{prob: number, ...}[]}
 */
export function mergeProbabilityObject(valueAndProbs, pred)
{
    let probs = valueAndProbs.map(e => e.prob);
    let ret = [];
    valueAndProbs.forEach(e1 => {
        let totalProbs = 0;
        valueAndProbs.forEach((e2, i2) => {
            if(pred(e1, e2)) {
                totalProbs += probs[i2];
                probs[i2] = 0;
            }
        });

        if(totalProbs != 0) {
            let newObj = {...e1};
            newObj.prob = totalProbs;
            ret.push(newObj);
        }
    });

    return ret;
}


/**
 * @param {{attackProps: Object, prob: number}[]} propsAndProbs 
 * @return {{attackProps: Object, prob: number}[]}
 */
export function mergeAttackProps(propsAndProbs)
{
    return mergeProbabilityObject(propsAndProbs, (a, b) => isShallowEqualObject(a.attackProps, b.attackProps));
}


/**
 * @param {VGData} baseCrtRate
 * @param {number} incP
 * @return {VGData}
 */
export function royalCriticalRate(baseCrtRate, incP)
{
    const p = baseCrtRate;
    const x = incP;

    let r = VGData.constant(1);
    let ret = VGData.constant(0);
    for(let n = 1; n < 6; ++n) {
        const q = p.add((n-1) * x).min_number(1);
        ret = ret.add(q.mul(n).mul(r));
        r = r.mul(VGData.constant(1).sub(q));
    }

    const p5 = p.add(5*x).min_number(1);
    ret = ret.add(r.mul(p5.mul(5).add(1)).div(p5));
    return ret.inv();
}



export function makeOptimizer(calc, objfunc, total_cost, algorithm, tol, maxEval)
{
    const opt = new nlopt.Optimize(algorithm, 7);

    opt.setMaxObjective((x, grad) => {
        var dmg = objfunc(x);
        dmg = dmg.log();

        if(grad) {
            for(let i = 0; i < VGData.DIM; ++i)
                grad[i] = dmg.grad[i];
        }

        return dmg.value;
    }, tol);

    
    opt.addInequalityConstraint((x, grad) => {
        var cost = calc.calcSubOptionCost(x);
        if(grad) {
            for(let i = 0; i < VGData.DIM; ++i)
                grad[i] = cost.grad[i];
        }

        return cost.value - total_cost;
    }, tol);

    opt.setUpperBounds(calc.calcUpperBounds(total_cost, objfunc));
    opt.setLowerBounds([0, 0, 0, 0, 0, 0, 0]);
    opt.setMaxeval(maxEval);

    return opt;
}



export async function applyOptimize(calc, objfunc, total_cost, algorithm, x0, tol, maxEval, retry = 3) {
    let doCalcExprTextLast = VGData.doCalcExprText;
    VGData.doCalcExprText = false;
    let returnValue = undefined;
    let failed = 0;

    while(returnValue == undefined && failed < retry) {
        try {
            const opt = makeOptimizer(calc, objfunc, total_cost, algorithm, tol, maxEval);
            let result = opt.optimize(x0);

            returnValue = {success: result.success, opt_result: result, calc: calc, value: Math.exp(result.value)};
        } catch(ex) {
            console.log(ex);
            console.log("reload NLopt-js");
            reload_js('/js/nlopt-js.js');
            await nlopt.ready;
            ++failed;
            console.log(failed);
        }
    }

    VGData.doCalcExprText = doCalcExprTextLast;
    return returnValue;
}



export async function applyGlobalOptimize(calc, objfunc, total_cost, globalAlgorithm, localAlgorithm, x0, tol, maxEvalGlobal, maxEvalLocal)
{
    function globalObjFunc(x)
    {
        let opt = applyOptimize(calc, objfunc, total_cost, localAlgorithm, x, tol, maxEvalLocal, 1);

        if(opt.success)
            return objfunc(opt.opt_result.x);
        else
            return objfunc(x0);
    }

    let ret = await applyOptimize(calc, globalObjFunc, total_cost, globalAlgorithm, x0, tol, maxEvalGlobal);

    if(ret.success) {
        // 大域最適化の結果を使って局所最適化をする
        return applyOptimize(calc, objfunc, total_cost, localAlgorithm, ret.opt_result.x, tol, maxEvalLocal);
    } else {
        // 大域最適化は諦めて，局所最適化アルゴリズムに任せる
        return applyOptimize(calc, objfunc, total_cost, localAlgorithm, x0, tol, maxEvalLocal);
    }
}
