
import {queryParams} from './constants.js';
import { syncInputsWithCache, setInputValueFromSettings, saveSettingsToLocalStorage } from './localStorage.js';
import { bindSettingUpdates, bindResetBtn, updateAllSettings } from './bindUpdates.js';

import { getSettingValueFromInputs } from './getSettings.js';
import { updateSettingsFromQuery } from './getSettings_query.js';

import { enhanceInputStyles } from './enhanceInputStyles.js';

import { injectSpriteSheet, injectIcons, injectIconSpriteMap } from "./injectIcons";
import { parseCSP_Atts } from './csp';

import { addUI_elements } from './addUI_els';
import { loadSamples } from './loadSamples.js';



export function enhanceInputs({
    selector = 'input, select, textarea',

    parent = '[data-enhance-inputs]',
    //save updates to URL query
    cacheToUrl = true,
    getQuery = true,
    // save settings to local storage
    cacheToStorage = true,
    storageName = 'settings',
    embedSprite = true,
    icons = 'inputs'
} = {}) {


    /**
     * load samples
     * for selects
     */
    loadSamples(parent)

    /**
     * add default UI element
     * e.g reset button, darkmode, print or language toggle
     */
    addUI_elements()


    // load only base icons or all
    let iconFile = icons !== 'all' ? "iconSprite_inputs.svg" : "iconSprite.svg";

    // load sprite sheet async
    let spritePromise = injectSpriteSheet(embedSprite, iconFile);

    /**
     * retrieve cached settings
     */
    let settingsStorage = '';
    let settingsCache = {};

    if (cacheToStorage) {
        if (!storageName) {
            /** generate location specific local storage name */
            let location = window.location;
            let pathName = location.pathname.split('/').filter(Boolean).slice(0, 2).join('_');
            storageName = `${location.hostname}_${pathName}`;
            //console.log('storageName:', storageName);
        }

        try {
            settingsStorage = localStorage.getItem(storageName);
            settingsCache = settingsStorage ? JSON.parse(settingsStorage) : {};

        } catch {
            console.warn('No valid settings JSON');
        }
    }


    let settings = {}
    let parentEl = document.querySelector(parent) ? document.querySelector(parent) : document.body;
    let inputs = parentEl.querySelectorAll(selector);

    // default button style 
    let buttons = parentEl.querySelectorAll('button');
    buttons.forEach(btn => {
        if (!btn.getAttribute('class')) {
            btn.classList.add('btn-default', 'wdt-100', 'txt-cnt')
        }
    })

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
    if ((cacheToUrl || getQuery) && Object.values(queryParams).length) {

        //console.log('queryParams', queryParams);
        let settingsQuery = updateSettingsFromQuery(queryParams, settings)

        //console.log('settingsQuery', settingsQuery);

        settingsCache = {
            ...settingsCache,
            ...settingsQuery
        }

        // take query cache for syncing
        if (!cacheToStorage) {
            syncInputsWithCache(settingsCache, inputs)
        }

        //console.log('settingsFinal', settings);
        settings.getQuery = true

    }


    // sync with cache - update inputs
    if (cacheToStorage && Object?.values(settingsCache).length) {
        //console.log('settingsCache',  settingsCache);
        syncInputsWithCache(settingsCache, inputs)
    }

    settings = getSettingValueFromInputs(inputs, settings)

    // include strorage name
    if(cacheToStorage) {
        settings.storageName = storageName
    }



    // bind input events
    bindSettingUpdates(inputs, settings, storageName, cacheToUrl)


    // bind reset btn
    bindResetBtn(settings, storageName)


    /**
     * enhance styles by wrapping
     * and adding extra buttons
     */
    enhanceInputStyles(inputs);


    /**
     * add icons if 
     * spritesheet is ready
     */

    (async () => {
        await spritePromise;
        injectIcons(embedSprite, spritePromise);

    })();


    // fix inline attributes to comply with CSP
    parseCSP_Atts();


    // toggle visibility
    const showEnhanced = () => {
        let hidden = document.querySelectorAll('.enhance-inputs-init');
        hidden.forEach(el => {
            el.classList.remove('enhance-inputs-init')
        })
    }


    // Wait until DOM ready
    window.addEventListener('DOMContentLoaded', async () => {
        await spritePromise;
        window.dispatchEvent(new Event('enhanceReady'));
        parentEl.classList.add('enhance-inputs-ready');
        showEnhanced();
    });


    //console.log('!!!enhance');
    return settings;

}
