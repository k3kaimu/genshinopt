import * as TypeDefs from './typedefs.mjs';

/**
 * @param {TypeDefs.UIItem} item 
 * @param {any} vm
 * @returns {string?}
 */
export function buildUIItem(item, vm)
{
    if(item.cond !== undefined && !item.cond(vm)) return undefined;

    switch(item.type) {
        case "checkbox":
            return checkBoxViewHTML(item.name, item.label(vm),
                    item.other ? item.other(vm) : undefined);

        case "select":
            return selectViewHTML(item.name, item.options(vm),
                    item.label ? item.label(vm) : undefined,
                    item.other ? item.other(vm) : undefined);
        
        case "radio":
            return radioViewHTML(item.name, item.options(vm),
                    item.other ? item.other(vm) : undefined);

        case "slider":
            return sliderViewHTML(item.name, item.min, item.max, item.step, item.label(vm),
                    item.other ? item.other(vm) : undefined)

        case "number":
            return inputNumberViewHTML(item.name, item.label(vm), item.other ? item.other(vm) : undefined);

        case "html":
            return item.html(vm);

        default:
            console.assert(false, `Unsupported UI type: ${item.type}`);
    }

    return undefined;
}


export function buildViewHTML(target, title, innerHTML)
{
    // return buildViewHTMLImpl(target, title, innerHTML);
    return DOMPurify.sanitize(
        buildViewHTMLImpl(target, title, innerHTML),
        {USE_PROFILES: {html: true}}
    );
}


export function buildViewHTMLWithoutCard(target, innerHTML)
{
    return DOMPurify.sanitize(
        buildViewHTMLWithoutCardImpl(target, innerHTML),
        {USE_PROFILES: {html: true}}
    );
}



export function buildViewHTMLImpl(target, title, innerHTML)
{
    if(title !== undefined)
    {
        return `<div class="card" data-bind="with: ${target}">
            <div class="card-header p-2">${title}</div>
            <div class="card-body p-2">
                ${innerHTML}
            </div>
        </div>`;
    } else {
        return `<div class="card" data-bind="with: ${target}">
            <div class="card-body p-2">
                ${innerHTML}
            </div>
        </div>`;
    }
}


export function buildViewHTMLWithoutCardImpl(target, innerHTML)
{
    return `<div data-bind="with: ${target}">
            ${innerHTML}
        </div>`;
}


export function buildBindAttr(bindAttr)
{
    if(bindAttr == undefined)   return "";

    let dst = "";
    let keys = Object.keys(bindAttr);

    for(let i = 0; i < keys.length; ++i) {
        dst += `${keys[i]}: ${bindAttr[keys[i]]},`;
    }

    return dst;
}


export function spanText(expr)
{
    return `<span data-bind="text: ${expr}"></span>`;
}


export function spanPercentage(expr, digit)
{
    return `<span data-bind="text: textPercentage(${expr} ,${digit})"></span>`;
}


export function spanPercentageFix(expr, digit)
{
    return `<span data-bind="text: textPercentageFix(${expr} ,${digit})"></span>`;
}


export function spanInteger(expr)
{
    return `<span data-bind="text: textInteger(${expr})"></span>`;
}


export function textBoxViewHTML(observableStr, labelHTML, otherBindAttr = undefined)
{
    return `<div class="form-group row m-0">
        <label class="col-5 mt-2">${labelHTML}</label>
        <div class="col-7">
            <input type="text" class="form-control" data-bind="value: ${observableStr}, ${buildBindAttr(otherBindAttr)}">
        </div>
    </div>`;
}


export function inputNumberViewHTML(observableStr, labelHTML, otherBindAttr = undefined)
{
    return `<div class="form-group row m-0">
        <label class="col-5 mt-2">${labelHTML}</label>
        <div class="col-7">
            <input type="number" class="form-control" data-bind="value: ${observableStr}, ${buildBindAttr(otherBindAttr)}">
        </div>
    </div>`;
}


export function checkBoxViewHTML(observableStr, labelHTML, otherBindAttr = undefined)
{
    return `<div class="form-group m-0">
        <div class="form-check">
            <label class="form-check-label" data-bind="${buildBindAttr(otherBindAttr)}">
                <input class="form-check-input" type="checkbox" data-bind="checked: ${observableStr}, ${buildBindAttr(otherBindAttr)}">
                ${labelHTML}
            </label>
        </div>
    </div>`;
}


export function sliderViewHTML(observableStr, min, max, step, labelHTML, otherBindAttr = undefined)
{
    if(labelHTML == undefined) {
        return `<div class="mt-sm-2">
        <input type="range" data-bind="value: ${observableStr}, ${buildBindAttr(otherBindAttr)}" class="form-control-range" min="${min}" max="${max}" step="${step}">
        </div>`
    } else {
        return `<div class="form-group row m-0">
            <label class="col-sm-5 col-form-label">${labelHTML}</label>
            <div class="col-sm-7 mt-sm-2">
            <input type="range" data-bind="value: ${observableStr}, ${buildBindAttr(otherBindAttr)}" class="form-control-range" min="${min}" max="${max}" step="${step}">
            </div>
        </div>`;
    }
}


export function selectViewHTML(observableStr, options, labelHTML = undefined, otherBindAttr = undefined)
{
    let ops = "";
    for(let i = 0; i < options.length; ++i) {
        ops += `<option value="${options[i].value}">${options[i].label}</option>`;
    }

    if(labelHTML == undefined) {
        return `<div class="form-group m-0">
            <select class="custom-select" data-bind="value: ${observableStr}, ${buildBindAttr(otherBindAttr)}">
                ${ops}
            </select>
        </div>`;
    } else {
        return `<div class="form-group row m-0">
            <label class="col-5 mt-2">${labelHTML}</label>
            <div class="col-7">
            <select class="form-control" data-bind="value: ${observableStr}, ${buildBindAttr(otherBindAttr)}">
                ${ops}
            </select>
            </div>
        </div>`;
    }
}


export function radioViewHTML(observableStr, options, otherBindAttr = undefined)
{
    let uid = genUniqueId();

    let inputs = "";
    for(let i = 0; i < options.length; ++i) {
        inputs += `<div class="form-check">
            <label class="form-check-label">
                <input class="form-check-input" type="radio" name="radio_generated_${uid}" value="${options[i].value}" data-bind="checked: ${observableStr}, ${buildBindAttr(otherBindAttr)}">
                ${options[i].label}
            </label>
        </div>`;
    }

    return `<div class="form-group m-0">
        ${inputs}
    </div>`;
}


export const levelOptionsForCharWeapon = [
    {value: "70", label: "70/未突破"},
    {value: "70+", label: "70/突破"},
    {value: "71", label: "71"},
    {value: "72", label: "72"},
    {value: "73", label: "73"},
    {value: "74", label: "74"},
    {value: "75", label: "75"},
    {value: "76", label: "76"},
    {value: "77", label: "77"},
    {value: "78", label: "78"},
    {value: "79", label: "79"},
    {value: "80", label: "80/未突破"},
    {value: "80+", label: "80/突破"},
    {value: "81", label: "81"},
    {value: "82", label: "82"},
    {value: "83", label: "83"},
    {value: "84", label: "84"},
    {value: "85", label: "85"},
    {value: "86", label: "86"},
    {value: "87", label: "87"},
    {value: "88", label: "88"},
    {value: "89", label: "89"},
    {value: "90", label: "90"},
];


export const levelOptionsForEnemy = [
    {value: "70", label: "70"},
    {value: "71", label: "71"},
    {value: "72", label: "72"},
    {value: "73", label: "73"},
    {value: "74", label: "74"},
    {value: "75", label: "75"},
    {value: "76", label: "76"},
    {value: "77", label: "77"},
    {value: "78", label: "78"},
    {value: "79", label: "79"},
    {value: "80", label: "80"},
    {value: "81", label: "81"},
    {value: "82", label: "82"},
    {value: "83", label: "83"},
    {value: "84", label: "84"},
    {value: "85", label: "85"},
    {value: "86", label: "86"},
    {value: "87", label: "87"},
    {value: "88", label: "88"},
    {value: "89", label: "89"},
    {value: "90", label: "90"},
];