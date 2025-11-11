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

import { injectSpriteSheet, injectIcons, injectIconSpriteMap } from "./injectIcons";
import { bindDarkmodeBtn } from './bindDarkmode';
import { parseCSP_Atts } from './csp';

import { addUI_elements } from './addUI_els';
import {translatePipeText} from './translate';
import { enhanceTabs } from './enhanceTabs';


// get quer params
const queryParams = Object.fromEntries(new URLSearchParams(document.location.search));


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
     * add default UI element
     * e.g reset button, darkmode, print or language toggle
     */
    addUI_elements()


    // load only base icons or all
    let iconFile = icons !== 'all' ? "iconSprite_inputs.svg" : "iconSprite.svg";

    // load sprite sheet
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
    if ( (cacheToUrl || getQuery) && Object.values(queryParams).length) {

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

    // darkmode
    bindDarkmodeBtn();


    // enhance tabs
    enhanceTabs();



    /**
     * enhance styles by wrapping
     * and adding extra buttons
     */
    enhanceInputStyles(inputs)



    /**
     * add icons
     */
    injectIcons(embedSprite, spritePromise);

    // additional icons
    (async () => {
        await spritePromise;
        let spritePromise2 = injectSpriteSheet(embedSprite, 'iconSprite.svg');
        injectIcons(embedSprite, spritePromise2);

    })();


    // fix inline attributes to comply with CSP
    parseCSP_Atts();



    // listen to new icon changes
    window.addEventListener('DOMchange', () => {
        //window.dispatchEvent(new Event('enhanceReady'));
        injectIcons(embedSprite, true);
        //console.log('domChange');
    });


    // translate
    translatePipeText();

    // ensure listeners have time to register
    if (document.readyState === 'complete') {
        // Everything already loaded — just fire now
        window.dispatchEvent(new Event('enhanceReady'));
        window.dispatchEvent(new Event('DOMchange'));
        parentEl.classList.add('enhance-inputs-ready');
    } else {
        // Wait until DOM ready
        window.addEventListener('DOMContentLoaded', () => {
            window.dispatchEvent(new Event('enhanceReady'));
            window.dispatchEvent(new Event('DOMchange'));
            parentEl.classList.add('enhance-inputs-ready');
        });
    }
    return settings;

}





// Browser global
if (typeof window !== 'undefined') {
    window.enhanceInputs = enhanceInputs;
    window.injectIcons = injectIcons;
    window.injectIconSpriteMap = injectIconSpriteMap;

    // Initialize automatically
    const settingsInputs = enhanceInputsAutoInit();

    // Make settings globally accessible
    window.enhanceInputsSettings = settingsInputs;

}