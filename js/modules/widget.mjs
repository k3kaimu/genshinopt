

export function buildViewHTML(target, title, innerHTML)
{
    return buildViewHTMLImpl(target, title, innerHTML);
}



export function buildViewHTMLImpl(target, title, innerHTML)
{
    return `<div class="card" data-bind="with: ${target}">
        <div class="card-header p-2">${title}</div>
        <div class="card-body p-2">
            ${innerHTML}
        </div>
    </div>`;
}


export function buildBindAttr(bindAttr)
{
    if(bindAttr == undefined)   return "";

    let dst = "";
    let keys = Object.keys(bindAttr);

    for(let i = 0; i < keys.length; ++i) {
        dst += `${keys[i]}: ${bindAttr[keys[i]]}`;
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


export function checkBoxViewHTML(observableStr, labelHTML, otherBindAttr = undefined)
{
    return `<div class="form-group m-0">
        <div class="form-check">
            <label class="form-check-label">
                <input class="form-check-input" type="checkbox" data-bind="checked: ${observableStr}, ${buildBindAttr(otherBindAttr)}">
                ${labelHTML}
            </label>
        </div>
    </div>`;
}


export function sliderViewHTML(observableStr, min, max, step, labelHTML, otherBindAttr = undefined)
{
    return `<div class="form-group row m-0">
        <label class="col-sm-5 col-form-label">${labelHTML}</label>
        <div class="col-sm-7 mt-sm-2">
        <input type="range" data-bind="value: ${observableStr}, ${buildBindAttr(otherBindAttr)}" class="form-control-range" min="${min}" max="${max}" step="${step}">
        </div>
    </div>`;
}


export function selectViewHTML(observableStr, options, labelHTML = undefined, otherBindAttr = undefined)
{
    let ops = "";
    for(let i = 0; i < options.length; ++i) {
        ops += `<option value="${options[i].value}">${options[i].label}</option>`;
    }

    if(labelHTML == undefined) {
        return `<div class="form-group m-0">
            <select class="custom-select" data-bind="value:  ${observableStr}">
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
