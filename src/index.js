export {
    abs, acos, asin, atan, atan2, ceil, cos, exp, floor, hypot,
    log, max, min, pow, random, round, sin, sqrt, tan, PI
} from './constants';

import { enhanceDetailsOpen, enhanceDetailsSettings } from './constants';

import { bindSettingUpdates, bindResetBtn, updateAllSettings } from './bindUpdates.js';
import { getPropFromLocalStorage, saveSettingsToLocalStorage } from './localStorage';
import { getQueryParams, settingsToQueryString } from './getSettings_query';

import { injectSpriteSheet, injectIcons, injectIconSpriteMap } from "./injectIcons";
import { bindDarkmodeBtn } from './bindDarkmode';

import { translatePipeText } from './translate';
import { enhanceTabs } from './enhanceTabs';

import { enhanceDetails, enhanceDetailsAutoInit } from './enhanceDetails';
import { initDialogs } from './enhanceDialogs';


import { loadMDs } from './loadMD.js';
import { getZipUrl } from './getZip';
import { enhanceCode } from './enhance-code';

import { enhanceInputs } from './enhanceInputs_main';
import { textToAnchorUrl } from './enhanceDetails_helpers.js';
import { initDetailStates } from './enhanceDetails_state_toggle.js';



// enhance inputs ready
export let enhanceInputsReady = new Event('enhanceReady');


export function enhanceInputsAutoInit() {
    const inputWrap = document.querySelector('[data-enhance-inputs]');
    let enhanceInputsSettings = {};

    //console.log('auto');
    //window.dispatchEvent(new Event('DOMchange'));


    if (inputWrap) {
        // Parse options from data attribute
        let optionsData = {};
        let optionDataAttr = inputWrap.dataset.enhanceInputs;

        if (optionDataAttr) {
            try {
                optionsData = JSON.parse(optionDataAttr);
            } catch (err) {
                console.warn('enhance-inputs: Invalid JSON in data-enhance-inputs', err);
            }
        }

        // Merge defaults with custom options
        let options = {
            storageName: `enhance_inputs_settings`,
            parent: 'body',
            selector: 'input, select, textarea',
            cacheToUrl: false,
            getQuery: true,
            cacheToStorage: false,
            ...optionsData,
        };


        //console.log('!!!inputSampleData', inputSampleData);

        /**
         * get body bg color
         * for input background fills
         */
        let bodyColor = window.getComputedStyle(document.body).backgroundColor;
        bodyColor = (bodyColor === 'rgba(0, 0, 0, 0)' || bodyColor === 'transparent') ? 'rgb(255, 255, 255)' : bodyColor;
        document.documentElement.style.setProperty('--color-background', bodyColor)


        // Initialize
        enhanceInputsSettings = enhanceInputs(options);

        // Dispatch event to notify others that settings are ready
        const event = new CustomEvent('settingsChange');
        document.dispatchEvent(event);


        // translate
        translatePipeText();


        // darkmode
        bindDarkmodeBtn();


        // enhance tabs
        enhanceTabs();


        // enhance dialogs
        initDialogs();

        // load MDs
        loadMDs();

        // enhance codes
        enhanceCode();



        // get details settings
        let storageName = enhanceInputsSettings.storageName;

        // change details open state
        let detailsSettings = initDetailStates(storageName);

        // save to inputs obj
        enhanceInputsSettings.detailsOpen = detailsSettings

        // save to details global
        enhanceDetailsSettings.detailsOpen = detailsSettings
        enhanceDetailsSettings.storageName = storageName


        //enhance details
        enhanceDetailsAutoInit(enhanceInputsSettings);

        // save settings
        saveSettingsToLocalStorage(enhanceInputsSettings, storageName)

    }

    return enhanceInputsSettings;
}




export { enhanceInputs as enhanceInputs };
export { enhanceDetails as enhanceDetails };
export { saveSettingsToLocalStorage as saveSettingsToLocalStorage }
export { settingsToQueryString as settingsToQueryString }
export { getQueryParams as getQueryParams }

// Browser global
if (typeof window !== 'undefined') {
    window.enhanceInputs = enhanceInputs;
    window.injectIcons = injectIcons;
    window.injectIconSpriteMap = injectIconSpriteMap;
    //window.updateAllSettings = updateAllSettings;
    window.saveSettingsToLocalStorage = saveSettingsToLocalStorage;
    window.settingsToQueryString = settingsToQueryString;
    window.getQueryParams = getQueryParams;

    // addons
    window.getZipUrl = getZipUrl;
    window.enhanceDetails = enhanceDetails;


    // Initialize automatically
    const settingsInputs = enhanceInputsAutoInit();

    // Make settings globally accessible
    window.enhanceInputsSettings = settingsInputs;

}

