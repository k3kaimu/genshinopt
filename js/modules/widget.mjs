

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


export function checkBoxViewHTML(observableStr, labelHTML)
{
    return `<div class="form-group m-0">
        <div class="form-check">
            <label class="form-check-label">
                <input class="form-check-input" type="checkbox" data-bind="checked: ${observableStr}">
                ${labelHTML}
            </label>
        </div>
    </div>`;
}