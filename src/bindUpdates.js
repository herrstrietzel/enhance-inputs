
//import { settingsUpdate } from './reset.js';
//import {saveSettingsToLocalStorage} from './localStorage.js';
import { getSettingValueFromInputs, getSettingValueFromInput } from './getSettings.js';

import { syncInputsWithCache, setInputValueFromSettings, saveSettingsToLocalStorage } from './localStorage.js';

// custom event for settings update
export const settingsUpdate = new Event('settingsChange');


// add event listeners
export function bindSettingUpdates(inputs, settings = {}, storageName = 'settings') {



    inputs.forEach((inp) => {

        // prevent adding multiple events
        if (!inp.classList.contains('input-active')) {
            inp.addEventListener("input", (e) => {

                //console.log('inp', inp);

                getSettingValueFromInput(inp, settings)

                // update localStorage
                saveSettingsToLocalStorage(settings, storageName)

                // trigger custom event
                //document.dispatchEvent(new Event('settingsChange'))
                document.dispatchEvent(settingsUpdate)

            })
            inp.classList.add('input-active')
        }
    });

}


/**
 * reset btn
 */
export function resetSettings(settings = {}) {
    //return settings.defaults ? settings.defaults : settings;
    if(settings.defaults) Object.assign(settings, settings.defaults);  
}


export function bindResetBtn(settings = {}, storageName = 'settings') {
    let btnReset = document.getElementById('btnResetSettings')
    if (btnReset) {
        btnReset.addEventListener('click', e => {

            resetSettings(settings) 

            // delete local storage
            localStorage.removeItem(storageName)

            // update inputs
            setInputValueFromSettings(settings)

            // update localStorage
            saveSettingsToLocalStorage(settings, storageName)

            // trigger custom event
            document.dispatchEvent(settingsUpdate)


        })
    }
}