export {
    abs, acos, asin, atan, atan2, ceil, cos, exp, floor, hypot,
    log, max, min, pow, random, round, sin, sqrt, tan, PI
} from './constants';


import { bindSettingUpdates, bindResetBtn, updateAllSettings } from './bindUpdates.js';
import {saveSettingsToLocalStorage} from './localStorage';

import { injectSpriteSheet, injectIcons, injectIconSpriteMap } from "./injectIcons";
import { bindDarkmodeBtn } from './bindDarkmode';

import { translatePipeText } from './translate';
import { enhanceTabs } from './enhanceTabs';

import { enhanceDetails, enhanceDetailsAutoInit } from './enhanceDetails';
import { initDialogs } from './enhanceDialogs';


import { loadMDs } from './loadMD.js';
import { getZipUrl } from './getZip';
import { enhanceCode } from './enhance-code';

import {enhanceInputs} from './enhanceInputs_main';



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
        bodyColor = (bodyColor==='rgba(0, 0, 0, 0)' || bodyColor==='transparent') ? 'rgb(255, 255, 255)': bodyColor;
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

        //enhance details
        enhanceDetailsAutoInit();

    }

    return enhanceInputsSettings;
}



export {enhanceInputs as enhanceInputs};
export {enhanceDetails as enhanceDetails}; 
export {saveSettingsToLocalStorage as saveSettingsToLocalStorage}

// Browser global
if (typeof window !== 'undefined') {
    window.enhanceInputs = enhanceInputs;
    window.injectIcons = injectIcons;
    window.injectIconSpriteMap = injectIconSpriteMap;
    //window.updateAllSettings = updateAllSettings;
    window.saveSettingsToLocalStorage = saveSettingsToLocalStorage;


    // addons
    window.getZipUrl = getZipUrl;
    window.enhanceDetails = enhanceDetails;


    // Initialize automatically
    const settingsInputs = enhanceInputsAutoInit();

    // Make settings globally accessible
    window.enhanceInputsSettings = settingsInputs;

}

