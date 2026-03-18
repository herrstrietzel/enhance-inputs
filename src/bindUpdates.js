
//import { settingsUpdate } from './reset.js';
//import {saveSettingsToLocalStorage} from './localStorage.js';
import { getSettingValueFromInputs, getSettingValueFromInput } from './getSettings.js';

import { syncInputsWithCache, setInputValueFromSettings, saveSettingsToLocalStorage } from './localStorage.js';

import { updateQueryParams, settingsToQueryString } from './getSettings_query.js';
import { enhanceDetailsSettings } from './constants.js';

// custom event for settings update
export const settingsUpdate = new Event('settingsChange');
export const settingsUpdateSecondary = new Event('settingsChangeSecondary');


// add event listeners
export function bindSettingUpdates(inputs, settings = {}, storageName = 'settings', toQuery = false) {

    inputs.forEach((inp) => {

        // prevent adding multiple events
        if (!inp.classList.contains('input-active')) {
            inp.addEventListener("input", (e) => {

                // sync 
                updateSyncedInput(inp, settings);

                //console.log('inp', inp);
                getSettingValueFromInput(inp, settings)

                // update localStorage
                saveSettingsToLocalStorage(settings, storageName)

                if (toQuery) {
                    //let queryStr = settingsToQueryString(settings)
                    //console.log('queryStr', queryStr);
                    updateQueryParams(settings)

                }


                // trigger custom event
                //document.dispatchEvent(new Event('settingsChange'))

                // exclude elements to prevent trigger update event
                //let isIgnoredInput = inp.dataset.ignore === 'true';
                let isIgnoredInput = inp.dataset.ignore || false;
                let isSecondary = inp.dataset.secondary || false;

                /*
                console.log(inp.dataset, isIgnoredInput, isSecondary);
                if (isSecondary) {
                    console.log('second');
                }
                */

                if (!isIgnoredInput && !isSecondary) {
                    document.dispatchEvent(settingsUpdate)
                }
                else if (isSecondary) {
                    document.dispatchEvent(settingsUpdateSecondary)
                }
                

            })
            inp.classList.add('input-active')
        }
    });

}


export function updateAllSettings(inputs, settings = {}, storageName = 'settings', toQuery = false) {

    inputs.forEach((inp) => {

        // sync 
        updateSyncedInput(inp, settings);

        //console.log('inp', inp);
        getSettingValueFromInput(inp, settings)

        // trigger custom event
        document.dispatchEvent(settingsUpdate)

    });



}

export function updateSyncedInput(input = null, settings = {}) {
    let inputSyncedName = input.dataset.sync;

    if (inputSyncedName) {
        let inputSynced = document.querySelector(`[name=${inputSyncedName}]`)
        //console.log('inputSynced', inputSynced);
        if (inputSynced) {
            let val = input.value
            if (input.type === 'checkbox') {
                inputSynced.checked = input.checked;
            } else {
                inputSynced.value = val;
            }
            settings[inputSyncedName] = val;
        }
    }

}


/**
 * reset btn
 */
export function resetSettings(settings = {}) {

    if (settings.defaults) {
        Object.assign(settings, settings.defaults);
        // reset details open states
        settings.detailsOpen={}
    }
    //return settings;
}


export function bindResetBtn(settings = {}, storageName = 'settings') {
    let btnsReset = document.querySelectorAll('#btnReset, .btnReset');


    btnsReset.forEach(btn => {
        btn.addEventListener('click', e => {

            //settings = {}
            resetSettings(settings)

            // delete local storage
            //localStorage.setItem(storageName, {})
            localStorage.removeItem(storageName)

            // update inputs
            setInputValueFromSettings(settings)

            // reset open details
            //enhanceDetailsSettings.detailsOpen = {}

            // update localStorage
            saveSettingsToLocalStorage(settings, storageName)

            // delete query params
            updateQueryParams({})


            //console.log(settings, enhanceDetailsSettings.detailsOpen);

            // trigger custom event
            document.dispatchEvent(settingsUpdate)

        })

    })

}