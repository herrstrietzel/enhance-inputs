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

import { injectIcons } from "./injectIcons";
import { bindDarkmodeBtn } from './bindDarkmode';


// get quer params
const queryParams = Object.fromEntries(new URLSearchParams(document.location.search));


/**
 * new version
 */

export function enhanceInputs({
    selector = 'input, select, textarea',
    parent = 'main',
    //save updates to URL query
    cacheToUrl = true,
    // save settings to local storage
    cacheToStorage = true,
    storageName = 'settings',
    embedSprite = true,
} = {}) {

    //console.log('enhanceInputs');


    let settings = {}
    storageName = cacheToStorage ? storageName : '';
    let settingsStorage = storageName ? localStorage.getItem(storageName) : '';
    let settingsCache = settingsStorage ? JSON.parse(settingsStorage) : {}
    let parentEl = document.querySelector(parent) ? document.querySelector(parent) : document;
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
    if (cacheToStorage && Object.values(settingsCache).length) {
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
    enhanceInputStyles(inputs, embedSprite)

    bindDarkmodeBtn();

    return settings;

}



// Browser global
if (typeof window !== 'undefined') {
    window.enhanceInputs = enhanceInputs;
    window.injectIcons = injectIcons;
}