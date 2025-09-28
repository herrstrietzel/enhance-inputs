
// add to localStorage
export function saveSettingsToLocalStorage(settings = {}, storageName = 'settings') {
    if (storageName) {
        let settingsJSON = JSON.stringify(settings);
        localStorage.setItem(storageName, settingsJSON)
    }
}



/**
 * sync input values with localstorage
 */
export function syncInputsWithCache(settings = {}) {
    setInputValueFromSettings(settings)
}


// update input values from settings cache
export function setInputValueFromSettings(settings = {}) {

    for (let name in settings) {
        let value = settings[name];
        let isBoolean = value === true || value === false;
        let inputs = name ? document.querySelectorAll(`[name=${name}]`) : [];

        inputs.forEach(inp => {

            let type = inp.type ? inp.type : inp.nodeName.toLowerCase();
            let isSelect = type === 'select-one' || type === 'select-multiple'

            //checkboxes
            if (isBoolean) {
                inp.checked = value
            }

            else if (isSelect) {
                let options = Array.from(inp.options);
                options.forEach(option => {
                    option.selected = value.includes(option.value) ? true : false;
                })
            }

            else if (type === 'radio') {
                let isChecked = inp.value === value;
                if (isChecked) {
                    inp.checked = true
                } else {
                    inp.checked = false
                }
            }
            else {
                inp.value = value
            }
        });

    }

}