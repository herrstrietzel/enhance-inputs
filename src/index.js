export {
    abs, acos, asin, atan, atan2, ceil, cos, exp, floor, hypot,
    log, max, min, pow, random, round, sin, sqrt, tan, PI
} from './constants';

//import {bindResetBtn} from './src/reset.js';
import {syncInputsWithCache, setInputValueFromSettings, saveSettingsToLocalStorage} from './localStorage.js';
import {bindSettingUpdates, bindResetBtn} from './bindUpdates.js';

import {getSettingValueFromInputs, getSettingValueFromInput} from './getSettings.js';

import {enhanceInputStyles} from './enhanceInputStyles.js';



export function enhanceInputs({
    selector = 'input',
    parent = 'main',
    storageName = 'settings'
} = {}) {


    let settings = {}
    let settingsStorage = localStorage.getItem(storageName);
    let settingsCache = settingsStorage ? JSON.parse(settingsStorage) : null
    let parentEl = document.querySelector(parent) ? document.querySelector(parent) : document;
    let inputs = parentEl.querySelectorAll(selector);

    /**
     * check defaults 
     * as specified in HTML
     */
    let defaults = settings.defaults ? settings.defaults : getSettingValueFromInputs(inputs);

    // save defaults to settings object for resetting
    settings.defaults = defaults;
    //console.log('defaults', defaults);

    


    // sync with cache
    if (settingsCache) {
        syncInputsWithCache(settingsCache, inputs)
    }

    settings = getSettingValueFromInputs(inputs, settings)


    // bind input events
    bindSettingUpdates(inputs, settings, storageName)


    // bind reset btn
    //bindResetBtn(settings, storageName)
    bindResetBtn(settings, storageName)



    // enhance styles
    inputs = document.querySelectorAll('input, select, textarea')
    enhanceInputStyles(inputs)


    return settings;

}


// Browser global
if (typeof window !== 'undefined') {
    window.enhanceInputs = enhanceInputs;
}