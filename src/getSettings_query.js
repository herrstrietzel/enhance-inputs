
import { normalizeStr } from './string_helpers';

export function updateSettingsFromQuery(query = {}, settings = {}) {
    let settingsNew = settings;

    for (let prop in query) {
        let value = query[prop];
        value = value==='true' ? true : (value==='false'? false: value);
        settingsNew[prop] = value
    }

    //console.log('settingsNew', settingsNew);

    return settingsNew
}


export function updateQueryParams(settings={}, replace = true) {
    let query = settingsToQueryString(settings);
    let newUrl = window.location.pathname + query;

    if (replace) {
        window.history.replaceState({}, "", newUrl);
    } else {
        window.history.pushState({}, "", newUrl);
    }
}

export function settingsToQueryString(settings = {}, exclude = ["defaults"], maxLength = 8000) {
    let queryParts = [];
    let currentLength = 1; // account for leading "?"

    for (let key in settings) {
        if (!Object.prototype.hasOwnProperty.call(settings, key) || exclude.includes(key)) continue;

        let value = settings[key];
        if (value === undefined || value === null) continue;

        let addParam = (k, v) => {
            let param = encodeURIComponent(k) + "=" + encodeURIComponent(String(v).trim());
            let projectedLength = currentLength + (queryParts.length > 0 ? 1 : 0) + param.length; // +1 for '&'

            if (projectedLength <= maxLength) {
                queryParts.push(param);
                currentLength = projectedLength;
            } else {
                console.warn(`Skipping "${k}" — adding it would exceed maxLength (${maxLength}).`);
            }
        };

        if (Array.isArray(value)) {
            for (let item of value) {
                if (item !== undefined && item !== null) {
                    addParam(key, item);
                }
            }
        } else {
            let cleanValue = isNaN(value) ? String(value).trim() : value;
            addParam(key, cleanValue);
        }
    }

    return queryParts.length > 0 ? "?" + queryParts.join("&") : "";
}







export function setInputsFromQuery(sel = '.input', query = {}) {
    let inputs = document.querySelectorAll(sel);

    inputs.forEach(inp => {
        let name = inp.name.toLowerCase();
        let type = inp.type || inp.nodeName.toLowerCase();
        let queryVal = query[name] ? query[name] : '';

        if (!queryVal) return;


        let sanitize = !queryVal.includes('@') && isNaN(queryVal.substring(0, 2));
        queryVal = sanitize ? normalizeStr(queryVal) : queryVal;
        //console.log('name', name, 'val:', queryVal);

        if (type === 'checkbox' || type === 'radio') {
            inp.checked = inp.value === queryVal;
        }

        if (type === 'select-one') {
            //console.log('queryVal', queryVal);
            setSelectValue(inp, queryVal)
        }

        else {
            inp.value = queryVal;
        }
    });
}


// check whether the option value or label exists
export function setSelectValue(selectEl, value) {
    let hasValue = false
    const options = [...selectEl.options]
    let hasOptionValue = options.find(option => option.value === value);
    let hasOptionLabel = !hasOptionValue ? options.find(option => option.label === value) : null;

    if (hasOptionValue || hasOptionLabel) {
        if (hasOptionValue) {
            selectEl.value = value;
        }
        else if (hasOptionLabel) {
            selectEl.value = hasOptionLabel.value;
        }
        hasValue = true;
    }
    return hasValue;
}
