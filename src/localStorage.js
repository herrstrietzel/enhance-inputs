
// add to localStorage
export function saveSettingsToLocalStorage(settings = {}, storageName = '') {

    storageName = !storageName ? settings.storageName : storageName;
    //console.log('storageName', storageName);

    if (storageName) {
        let settingsJSON = JSON.stringify(settings);
        localStorage.setItem(storageName, settingsJSON)
    }
}

// add to localStorage
export function savePropToLocalStorage(storageName = '', property = '', value = '') {
    let storage = localStorage.getItem(storageName)
    if (storage) {
        let settings = JSON.parse(storage)
        // add new property
        if (settings) {
            settings[property] = value

            // save back to storage
            let json = JSON.stringify(settings)
            localStorage.setItem(storageName, json)
            
            //console.log('savePropToLocalStorage', value, settings);
        }
    }
}

// add to localStorage
export function getPropFromLocalStorage(storageName = '', property = '') {
    let storage = localStorage.getItem(storageName)
    let value = null;

    if (storage) {
        let settings = JSON.parse(storage)

        // add new property
        if (settings && settings[property] !== undefined) {
            value = settings[property]
        }

        //console.log('getPropFromLocalStorage', settings, settings['detailsOpen'], property );
    }

    return value;
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
                //console.log('input val:', value, options);

                for (let i = 0; i < options.length; i++) {
                    let option = options[i]
                    let labelVal = option.label.trim()
                    //console.log('label', labelVal);

                    // prefer label text
                    if (option.label && value == labelVal) {
                        option.selected = true;
                        break;
                    }
                    else {
                        //option.selected = value.includes(option.value) ? true : false;
                        let isSelected = value === option.value;
                        if (isSelected) {
                            break;
                        }
                        //option.checked = value.includes(option.value) ? true : false;
                    }
                }
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