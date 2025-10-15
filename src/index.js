export {
    abs, acos, asin, atan, atan2, ceil, cos, exp, floor, hypot,
    log, max, min, pow, random, round, sin, sqrt, tan, PI
} from './constants';

//import {bindResetBtn} from './src/reset.js';
import { syncInputsWithCache, setInputValueFromSettings, saveSettingsToLocalStorage } from './localStorage.js';
import { bindSettingUpdates, bindResetBtn } from './bindUpdates.js';

import { getSettingValueFromInputs } from './getSettings.js';
import { updateSettingsFromQuery } from './getSettings_query.js';

import { enhanceInputStyles } from './enhanceInputStyles.js';

import {injectSpriteSheet, injectIcons } from "./injectIcons";
import { bindDarkmodeBtn } from './bindDarkmode';


// get quer params
const queryParams = Object.fromEntries(new URLSearchParams(document.location.search));
let enhanceInputsSettings = {};


export function enhanceInputsAutoInit() {
    const inputWrap = document.querySelector('[data-enhance-inputs]');
    let enhanceInputsSettings = {};

    if (inputWrap) {
        // Parse options from data attribute
        let optionsData = {};
        const optionDataAttr = inputWrap.dataset.enhanceInputs;

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
            cacheToStorage: false,
            ...optionsData,
        };

        // Initialize
        enhanceInputsSettings = enhanceInputs(options);

        // Dispatch event to notify others that settings are ready
        const event = new CustomEvent('settingsChange');
        document.dispatchEvent(event);
    }

    return enhanceInputsSettings;
}



/**
 * new version
 */

export function enhanceInputs({
    selector = 'input, select, textarea',
    parent = 'body',
    //save updates to URL query
    cacheToUrl = true,
    // save settings to local storage
    cacheToStorage = true,
    storageName = 'settings',
    embedSprite = true,
} = {}) {


    // load sprite sheet
    let spritePromise = injectSpriteSheet(embedSprite);


    /**
     * retrieve cached settings
     */
    let settingsStorage = '';
    let settingsCache = {};

    if(cacheToStorage){
        if(!storageName){
            /** generate location specific local storage name */
            let location = window.location;
            let pathName = location.pathname.split('/').filter(Boolean).slice(0, 2).join('_');
            storageName = `${location.hostname}_${pathName}`;
            //console.log('storageName:', storageName);
        }

        try{
            settingsStorage = localStorage.getItem(storageName);
            settingsCache = settingsStorage ? JSON.parse(settingsStorage) : {};

        } catch{
            console.warn('No valid settings JSON');
        }
    }


    let settings = {}
    let parentEl = document.querySelector(parent) ? document.querySelector(parent) : document.body;
    let inputs = parentEl.querySelectorAll(selector);

    /**
     * check defaults 
     * as specified in HTML
     */
    let defaults = settings.defaults ? settings.defaults : getSettingValueFromInputs(inputs);

    // save defaults to settings object for resetting
    settings.defaults = defaults;

    /**
     * get settings from query
     * and update inputs
     */
    if (cacheToUrl && Object.values(queryParams).length) {

        let settingsQuery = updateSettingsFromQuery(queryParams, settings)

        settingsCache = {
            ...settingsCache,
            ...settingsQuery
        }

        // take query cache for syncing
        if (!cacheToStorage) {
            syncInputsWithCache(settingsCache, inputs)
        }
    }


    // sync with cache - update inputs
    if (cacheToStorage && Object?.values(settingsCache).length) {
        //console.log('settingsCache',  settingsCache);
        syncInputsWithCache(settingsCache, inputs)
    }

    settings = getSettingValueFromInputs(inputs, settings)


    // bind input events
    bindSettingUpdates(inputs, settings, storageName, cacheToUrl)


    // bind reset btn
    bindResetBtn(settings, storageName)


    /**
     * enhance styles by wrapping
     * and adding extra buttons
     */
    enhanceInputStyles(inputs)

    bindDarkmodeBtn();


    /**
     * add icons
     */
    //await spritePromise;
    //console.log('spritePromise', spritePromise);
    injectIcons(embedSprite, spritePromise);


    return settings;

}



// Browser global
if (typeof window !== 'undefined') {
    window.enhanceInputs = enhanceInputs;
    window.injectIcons = injectIcons;

    // Initialize automatically
    const settingsInputs = enhanceInputsAutoInit();

    // Make settings globally accessible
    window.enhanceInputsSettings = settingsInputs;

}