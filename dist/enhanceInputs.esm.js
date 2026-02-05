const {
    abs, acos, asin, atan, atan2, ceil, cos, exp, floor,
    log, hypot, max, min, pow, random, round, sin, sqrt, tan, PI
} = Math;

// get quer params
const queryParams = Object.fromEntries(new URLSearchParams(document.location.search));

/**
 * wrapper to get 
 * all input values
 */
function getSettingValueFromInputs(inputs, settings={}) {

    
    inputs.forEach((inp) => {
        getSettingValueFromInput(inp, settings);
    });
    return settings;
}

// update setting object from single input value
function getSettingValueFromInput(inp, settings = {}) {

    let prop = inp.name;
    let type = inp.type ? inp.type : inp.nodeName.toLowerCase();
    let isSelect = type === 'select-one' || type === 'select-multiple';
    let value = type==='number' && !inp.value ? 0 : inp.value;

    if(!prop){
        return;
    }

    // never save passwords
    if (type === 'password') {
        settings[prop] = '';

        return;
    }

    else if (type === 'textarea') {
        settings[prop] = inp.value.trim();
    }

    else if (type === 'checkbox') {
        settings[prop] = inp.checked ? true : false;
    }

    else if (isSelect) {
        let isSelectMulti = isSelect ? type === 'select-multiple' : false;
        let options = inp.options;
        let optionsSelected = Array.from(options).filter(option => option.selected);

        if (isSelectMulti) {
            settings[prop] = optionsSelected.map(option => option.value);
        } else {
            settings[prop] = optionsSelected[0].value;
        }
    }

    else if (type === 'radio') {
        let selected = document.querySelector(`[name=${prop}]:checked`);
        settings[prop] = selected ? selected.value : null;
    }
    else {
        // convert numbers

        let isNum = !isNaN(value) && value!=='';

        if(type!=='password' && type!=='file' ){
            settings[prop] = isNum ? +value : (inp.value);
        }
    }

    return settings;

}

// add to localStorage
function saveSettingsToLocalStorage(settings = {}, storageName = 'settings') {
    if (storageName) {
        let settingsJSON = JSON.stringify(settings);
        localStorage.setItem(storageName, settingsJSON);
    }
}

/**
 * sync input values with localstorage
 */
function syncInputsWithCache(settings = {}) {
    setInputValueFromSettings(settings);
}

// update input values from settings cache
function setInputValueFromSettings(settings = {}) {

    for (let name in settings) {
        let value = settings[name];
        let isBoolean = value === true || value === false;
        let inputs = name ? document.querySelectorAll(`[name=${name}]`) : [];

        inputs.forEach(inp => {

            let type = inp.type ? inp.type : inp.nodeName.toLowerCase();
            let isSelect = type === 'select-one' || type === 'select-multiple';

            if (isBoolean) {
                inp.checked = value;
            }

            else if (isSelect) {
                let options = Array.from(inp.options);
                options.forEach(option => {
                    option.selected = value.includes(option.value) ? true : false;
                });
            }

            else if (type === 'radio') {
                let isChecked = inp.value === value;
                if (isChecked) {
                    inp.checked = true;
                } else {
                    inp.checked = false;
                }
            }
            else {
                inp.value = value;
            }
        });

    }

}

function updateSettingsFromQuery(query = {}, settings = {}) {
    let settingsNew = settings;

    for (let prop in query) {
        let value = query[prop];
        value = value==='true' ? true : (value==='false'? false: value);
        settingsNew[prop] = value;
    }

    return settingsNew
}

function updateQueryParams(settings={}, replace = true) {
    let query = settingsToQueryString(settings);
    let newUrl = window.location.pathname + query;

    if (replace) {
        window.history.replaceState({}, "", newUrl);
    } else {
        window.history.pushState({}, "", newUrl);
    }
}

function settingsToQueryString(settings = {}, exclude = ["defaults"], maxLength = 8000) {
    let queryParts = [];
    let currentLength = 1; // account for leading "?"

    for (let key in settings) {
        if (!Object.prototype.hasOwnProperty.call(settings, key) || exclude.includes(key)) continue;

        let value = settings[key];
        if (value === undefined || value === null) continue;

        let addParam = (k, v) => {
            let param = encodeURIComponent(k) + "=" + encodeURIComponent(String(v).trim());
            let projectedLength = currentLength + (queryParts.length > 0 ? 1 : 0) + param.length; // +1 for '&'

            if (projectedLength <= maxLength) {
                queryParts.push(param);
                currentLength = projectedLength;
            } else {
                console.warn(`Skipping "${k}" — adding it would exceed maxLength (${maxLength}).`);
            }
        };

        if (Array.isArray(value)) {
            for (let item of value) {
                if (item !== undefined && item !== null) {
                    addParam(key, item);
                }
            }
        } else {
            let cleanValue = isNaN(value) ? String(value).trim() : value;
            addParam(key, cleanValue);
        }
    }

    return queryParts.length > 0 ? "?" + queryParts.join("&") : "";
}

// custom event for settings update
const settingsUpdate = new Event('settingsChange');

// add event listeners
function bindSettingUpdates(inputs, settings = {}, storageName = 'settings', toQuery = false) {

    inputs.forEach((inp) => {

        // prevent adding multiple events
        if (!inp.classList.contains('input-active')) {
            inp.addEventListener("input", (e) => {

                // sync 
                updateSyncedInput(inp, settings);

                getSettingValueFromInput(inp, settings);

                // update localStorage
                saveSettingsToLocalStorage(settings, storageName);

                if (toQuery) {

                    updateQueryParams(settings);

                }

                // trigger custom event

                
                // exclude elements to prevent trigger update event
                let isIgnoredInput = inp.dataset.ignore==='true';
                if(!isIgnoredInput){
                document.dispatchEvent(settingsUpdate);
                }

            });
            inp.classList.add('input-active');
        }
    });

}

function updateSyncedInput(input = null, settings = {}) {
    let inputSyncedName = input.dataset.sync;

    if (inputSyncedName) {
        let inputSynced = document.querySelector(`[name=${inputSyncedName}]`);
        if (inputSynced) {
            let val = input.value;
            inputSynced.value = val;
            settings[inputSyncedName] = val;
        }
    }

}

/**
 * reset btn
 */
function resetSettings(settings = {}) {
    if (settings.defaults) Object.assign(settings, settings.defaults);
}

function bindResetBtn(settings = {}, storageName = 'settings') {
    let btnsReset = document.querySelectorAll('#btnReset, .btnReset');

    btnsReset.forEach(btn => {
        btn.addEventListener('click', e => {

            resetSettings(settings);

            // delete local storage
            localStorage.removeItem(storageName);

            // update inputs
            setInputValueFromSettings(settings);

            // update localStorage
            saveSettingsToLocalStorage(settings, storageName);

            // delete query params
            updateQueryParams({});

            // trigger custom event
            document.dispatchEvent(settingsUpdate);

        });

    });

}

function getCurrentScriptUrl() {
    try {
        /** 2. try error API */
        let stackLines = new Error().stack.split('\n');
        let relevantLine = stackLines[1] || stackLines[2];
        if (!relevantLine) return null;

        // Extract URL using a more comprehensive regex
        let urlError = relevantLine.match(/(https?:\/\/[^\s]+)/)[1]
            .split('/')
            .slice(0, -1)
            .join('/');

        return urlError;

    } catch (e) {
        console.warn("Could not retrieve script path", e);
        return null;
    }
}

/**
 * replace CSP blocked attributes
 * like src or style to be compliant
 */
function parseCSP_Atts() {
    let cspEls = document.querySelectorAll('[data-csp-src], [data-csp-style]');

    cspEls.forEach(el => {
        let src = el.hasAttribute('data-csp-src');
        let style = el.hasAttribute('data-csp-style');

        if (src) {
            el.src = el.dataset.cspSrc;
            el.removeAttribute('data-csp-src');
        }
        if (style) {
            if(el.nodeName.toLowerCase()==='template'){
                let cssText = el.content.querySelector('style')?.textContent;
                let cssSheet = new CSSStyleSheet();
                cssSheet.replaceSync(cssText);
                document.adoptedStyleSheets = [cssSheet];

            }else {
                el.style.cssText = el.dataset.cspStyle;
                el.removeAttribute('data-csp-style');
            }
        }
    });

}

async function injectSpriteSheet(embedSprite = true, iconFile = "iconSprite_inputs.svg", debug = false) {

    debug = false;

    /**
     * load icon asset sprite or use external svg
     */
    let scriptUrl = getCurrentScriptUrl();
    let iconSpriteSVG = `${scriptUrl}/${iconFile}`;

    if (embedSprite) {
        let spriteWrapper = document.querySelector('.svgAssets');
        let sameSource = false;
        let hasWrapper = spriteWrapper ? true : false;

        if (spriteWrapper) {

            spriteWrapper.dataset.src;
            sameSource = iconFile === spriteWrapper.dataset.src;

            if (sameSource) {
                return;
            }
        }

        // add wrapper
        if (!hasWrapper) {
            spriteWrapper = document.createElement('div');
            spriteWrapper.dataset.src = iconFile;
            spriteWrapper.classList.add('svgAssets', 'sr-only');
            document.body.append(spriteWrapper);
        }

        // add icons
        let res = await fetch(iconSpriteSVG);
        if (res.ok) {
            let markup = await res.text();

            // reconvert inline styles to circumvent CSP issues
            markup = markup.replaceAll('style="', 'data-style="');
            let svgDom = new DOMParser().parseFromString(markup, 'text/html').querySelector('svg');

            // when other icons are added - check for duplicates
            if (hasWrapper) {
                let svgPrev = spriteWrapper.querySelector('svg');

                svgDom = svgPrev;
            }

            /**
             * debug/dev function to remove icons
             */
            if (debug) {

                let icons_exclude = [];

                let symbols = svgDom.querySelectorAll('symbol');
                for (let i = 0, l = symbols.length; l && i < l; i++) {
                    let symbol = symbols[i];

                    let id = symbol.id;
                    let idPre = id.split('-');

                    // prefix exclude
                    if (idPre.length > 1) {
                        idPre = idPre[0] + '-';

                        if (icons_exclude.includes(idPre)) {
                            symbol.remove();

                            continue
                        }
                    }

                    let hasSymbol = document.getElementById(id);
                    let exclude = hasSymbol || icons_exclude.includes(id);
                    if (exclude) {
                        symbol.remove();
                        console.log('remove', id);
                        continue;
                    }

                    // set default viewBox
                    let viewBox = symbol.getAttribute('viewBox');
                    if(!viewBox) symbol.setAttribute('viewBox', '0 0 24 24');

                    // append icon
                    svgDom.append(symbol);
                }

            }

            spriteWrapper.append(svgDom);

            // fix CSP styles – otherwise catched by CSP main helper
            let styled = svgDom.querySelectorAll('[data-style]');
            styled.forEach(el => {
                let style = el.dataset.style;
                el.removeAttribute('data-style');
                el.style.cssText = style;
            });

            // return filtered SVG sprite
            if (debug) {
                let svgComplete = new XMLSerializer().serializeToString(svgDom);
                console.log('svg sprite Complete', svgComplete);
            }
        }
    }

    // listen to DOM changes for new icon changes
    document.addEventListener('DOMChange', () => {
        injectIcons(embedSprite, true);
    });

    /**
     * append spritemap 
     * only for visualization
     * if "#spriteMap" element is present
     */
    injectIconSpriteMap();

    return true;

}

async function injectIcons(embedSprite = true, promise = false, iconFile = "iconSprite_inputs.svg", iconSpriteSVG = '') {

    let iconTargets = document.querySelectorAll('[data-icon]');

    if (!iconSpriteSVG) {
        let scriptUrl = getCurrentScriptUrl();
        iconSpriteSVG = `${scriptUrl}/${iconFile}`;
    }

    await promise;

    for (let i = 0, l = iconTargets.length; l && i < l; i++) {

        let el = iconTargets[i];
        injectIcon(el, embedSprite, iconSpriteSVG);
    }

}

function injectIcon(el = null, embedSprite = true, iconSvg = 'iconSprite_inputs.svg') {

    // get ID and position
    let iconIDs = el.dataset.icon ? el.dataset?.icon.split(' ') : [];

    // already processed or no icons – skip
    if (el.classList.contains('icn-inj') || !iconIDs.length) {
        return;
    }

    let multiIcons = iconIDs.length > 1;
    let iconID = iconIDs[0];

    // symbol references
    let useRefFile = !embedSprite ? iconSvg : '';
    let useRefs = iconIDs.map(id => { return `${useRefFile}#${id}` });
    let symbol = embedSprite ? document.getElementById(iconID) : null;

    /**
     * check types to add wrapping elements
     * replacing input box outline 
     */

    let iconPosition = el.dataset.iconPos ? el.dataset.iconPos : 'left';
    let pos = iconPosition === 'left' ? 'afterbegin' : 'beforeend';
    let posClass = `icn-pos-${iconPosition}`;

    // check if already wrapped
    let wrap = el.closest('.icn-wrp');
    let iconMarkup = ``;

    // viewBox exceptions for external use refs
    let viewBoxLookup = {
        'checkbox-switch': '0 0 36 24',
    };

    // multiple icons
    if (multiIcons) {

        for (let i = 0, l = iconIDs.length; i < l; i++) {
            let ref = useRefs[i];
            let vB = symbol ? (symbol.getAttribute('viewBox') || '0 0 24 24' ) : (viewBoxLookup[iconID] ? viewBoxLookup[iconID] : '0 0 24 24');
            iconMarkup += `<svg class="icn-svg icn-${iconID} ${posClass}  icn-svg-${i}" viewBox="${vB}"><use  href="${ref}"/></svg>`;

        }
    }
    // single icon
    else {

        let vB = symbol ? (symbol.getAttribute('viewBox') || '0 0 24 24') : '0 0 24 24';

        let ref = useRefs[0];
        iconMarkup = `<svg class="icn-svg icn-${iconID} ${posClass}" viewBox="${vB}"><use  href="${ref}"/></svg>`;

    }

    if (!wrap) iconMarkup = `<span class="icn-wrp icn-wrp-${iconID} icn-wrp-${iconPosition}">${iconMarkup}</span>`;

    // add class to indicate injection
    el.insertAdjacentHTML(pos, iconMarkup);
    el.removeAttribute('data-icon');
    el.removeAttribute('data-icon-pos');
    el.classList.add('icn-inj');

}

/**
 * append spritemap for visualization
 * helps to find all available icons
 * or to edit certain icons
 */
function injectIconSpriteMap() {

    let spriteMapEl = document.getElementById('spriteMap');
    if (!spriteMapEl) return;

    let spriteWrap = document.querySelector('.svgAssets');
    let symbols = spriteWrap.querySelectorAll('symbol');

    spriteMapEl.classList.add('spritemap', 'grd', 'grd-3', 'grd-md-5', 'grd-ld-8');

    symbols.forEach(symbol => {

        let col = document.createElement('div');
        col.classList.add('col');

        let ns = 'http://www.w3.org/2000/svg';
        let svg = document.createElementNS(ns, 'svg');
        let viewBoxAtt = symbol.getAttribute('viewBox') || '0 0 24 24';
        let viewBox = viewBoxAtt.split(' ').map(Number);
        let [ ,, width, height ] = viewBox;
        svg.setAttribute('data-id', symbol.id);
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('xmlns', ns);
        svg.setAttribute('viewBox', viewBoxAtt);
        svg.classList.add('icn-svg', `icn-${symbol.id}`);

        let children = [...symbol.children];

        children.forEach(child => {
            let clone = child.cloneNode(true);
            svg.append(clone);
        });
        col.append(svg);
        col.insertAdjacentHTML('beforeend', `<p class="icon-label">${symbol.id}</p>`);
        spriteMapEl.append(col);
    });

    // document.body.append(spriteMap)

}

function bindDarkmodeBtn() {
    // dark mode toggle
    let inputDarkmode = document.getElementById('inputDarkmode');
    if (inputDarkmode) {
        inputDarkmode.addEventListener('input', (e) => {
            if (inputDarkmode.checked) {
                document.body.classList.add('darkmode');
            }
            else {
                document.body.classList.remove('darkmode');
            }
        });
    }

}

/**
* translate
**/

function translatePipeText(parentEl=null, currentLang='') {

    parentEl = parentEl ? parentEl : document.body;

    if(!currentLang){
         currentLang = new URL(document.location).searchParams.get('lng') ? new URL(document.location).searchParams.get('lng') : 'de';
    }

    let dataBlocks = parentEl.querySelectorAll('[data-lang]');
    dataBlocks.forEach(el=>{
        let lang = el.dataset.lang;
        if(lang!==currentLang) el.remove();
    });

    let elsToTranslate = parentEl ? textNodesInEl(parentEl) : [];
    if (elsToTranslate.length) {

        for (var i = 0; i < elsToTranslate.length; i++) {
            var node = elsToTranslate[i];
            node.nodeName;
            if (node.nodeType === 3) {

                let text = node.parentNode.innerText;

                if (text && text.includes(' || ')) {
                    let txtArr = text.split(' || ').map(val => { return val.trim() });
                    if (currentLang == 'de') {
                        text = txtArr[0];
                    }
                    else if (currentLang == 'en') {
                        text = '' + txtArr[1].replaceAll(' *', '');
                    }
                    node.textContent = text;
                }
            }
        }
    }

    /**
     * Get text nodes in element
     * based on:
     * https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page#10730777
     */
    function textNodesInEl(node) {
        let textNodes = [];
        for (node = node.firstChild; node; node = node.nextSibling) {
            if (node.nodeType == 3) {
                textNodes.push(node);
            }
            else {
                textNodes = textNodes.concat(textNodesInEl(node));
            }
        }
        // filter empty text nodes
        textNodes = textNodes.filter(node => node.textContent.trim());
        return textNodes;
    }

}

function enhanceTabs() {

    let tabGroups = document.querySelectorAll('[data-tabs]');

    tabGroups.forEach((g, i) => {

        g.classList.add('tab-group');
        let tabPanels = g.querySelectorAll('[role="tabpanel"]');
        let labels = [];

        tabPanels.forEach((tabPanel, t) => {
            let label = tabPanel.children[0];
            let labelText = label.textContent;
            labels.push(labelText);
            label.remove();
            let idTabPanel = `tabPanel-${i}-${t}`;
            let idLabel = `tab-${i}-${t}`;
            tabPanel.setAttribute('aria-labelledby', idLabel);
            tabPanel.id = idTabPanel;
            tabPanel.classList.add('tab-panel');
        });

        let tabList = `<div role="tablist" class="tablist" aria-labelledby="tablist-${i}" class="tablist">`;

        labels.forEach((label, l) => {
            let selected = l === 0 ? true : false;
            let tabindex = selected ? '' : ' tabindex="-1" ';
            tabList +=
                `<button class="btn-tab" id="tab-${i}-${l}" type="button" role="tab" 
                aria-selected="${selected}" 
                ${tabindex}
                aria-controls="tabPanel-${i}-${l}">
                    <span class="btn-tab-inner">${label}</span>
            </button>`;
        });

        tabList += `</div>`;
        g.insertAdjacentHTML("afterbegin", tabList);

    });

    let tablists = document.querySelectorAll('[role=tablist]');
    for (var i = 0; i < tablists.length; i++) {
        initTabsAria(tablists[i]);
    }

}

/**
 * Accessible Tabs (function-based)
 * Based on W3C ARIA Authoring Practices example
 * Extended to auto-activate tab if its panel gains focus (e.g., via find-in-page)
 */
function initTabsAria(groupNode) {
    let tabs = [...groupNode.querySelectorAll('[role=tab]')];
    let tabpanels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

    let firstTab = tabs[0];
    let lastTab = tabs[tabs.length - 1];

    function setSelectedTab(currentTab, setFocus = true) {
        tabs.forEach((tab, i) => {
            let isSelected = tab === currentTab;
            tab.setAttribute('aria-selected', String(isSelected));
            tab.tabIndex = isSelected ? 0 : -1;

            tabpanels[i].classList.toggle('sr-only', !isSelected);

            if (isSelected && setFocus) {
                tab.focus();
            }
        });
    }

    function setSelectedToPreviousTab(currentTab) {
        let index = tabs.indexOf(currentTab);
        let newTab = currentTab === firstTab ? lastTab : tabs[index - 1];
        setSelectedTab(newTab);
    }

    function setSelectedToNextTab(currentTab) {
        let index = tabs.indexOf(currentTab);
        let newTab = currentTab === lastTab ? firstTab : tabs[index + 1];
        setSelectedTab(newTab);
    }

    function onKeydown(event) {
        let tgt = event.currentTarget;
        let handled = false;

        switch (event.key) {
            case 'ArrowLeft':
                setSelectedToPreviousTab(tgt);
                handled = true;
                break;
            case 'ArrowRight':
                setSelectedToNextTab(tgt);
                handled = true;
                break;
            case 'Home':
                setSelectedTab(firstTab);
                handled = true;
                break;
            case 'End':
                setSelectedTab(lastTab);
                handled = true;
                break;
        }

        if (handled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    // --- Initialization ---
    tabs.forEach((tab, i) => {
        let panel = tabpanels[i];

        tab.tabIndex = -1;
        tab.setAttribute('aria-selected', 'false');

        tab.addEventListener('keydown', onKeydown);
        tab.addEventListener('click', e => setSelectedTab(e.currentTarget));

        panel.addEventListener('focusin', () => {
            console.log('focusin');
            setSelectedTab(tab, false);
        });
    });

    setSelectedTab(firstTab, false);

    document.addEventListener('selectionchange', (e) => {
        let sel = document.getSelection();

        if (!sel || sel.rangeCount === 0) return;

        let node = sel.anchorNode;
        if (!node) return;

        let panel = node.nodeType === Node.ELEMENT_NODE
            ? node.closest('[role="tabpanel"]')
            : node.parentElement?.closest('[role="tabpanel"]');

        if (panel && panel.classList.contains('sr-only')) {
            let i = tabpanels.indexOf(panel);
            if (i >= 0) setSelectedTab(tabs[i], false);
        }
    });

    // Optional return API

}

const summaryIcons = {
    'arrow-right': `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`,
    'chevron': `<svg stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" ><path d="m8.3 4.5 7.5 7.5-7.5 7.5" /></svg>`
};

/**
 * helpers
 */
function getDetailsCSSOptions(el) {
    let els = ['details', 'summary'];
    let options = {
        right: false,
        round: false,
        plus: false,
        icon: '',
        type: ''
    };

    let hasOptions = false;
    if (!el) return {}

    let classList = [...el.classList];

    classList.forEach(cl => {
        let preArr = cl.split('-');
        let prop = preArr[1];
        let val = preArr[preArr.length - 1];

        if (els.includes(preArr[0])) {
            if (options.hasOwnProperty(prop)) {
                if(prop===val) {
                    options[prop] = true;
                }else {
                    options[prop] = val;
                }
                hasOptions = true;
            }
        }
    });

    
    return hasOptions ? options : {};
}

function replaceUmlauts(str) {
    const umlautMap = {
        'ä': 'ae',
        'ö': 'oe',
        'ü': 'ue',
        'Ä': 'Ae',
        'Ö': 'Oe',
        'Ü': 'Ue',
        'ß': 'ss'
    };

    return str.replace(/[äöüÄÖÜß]/g, function (match) {
        return umlautMap[match];
    });
}

// helper sanitize text for anchors
function textToAnchorUrl(text) {
    text = replaceUmlauts(text);
    let anchorId = text.trim().toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

    if (!isNaN(anchorId.substr(0, 1))) anchorId = 'a-' + anchorId;
    return anchorId;
}

function bindDetailsOpenbtns() {

    let btns = document.querySelectorAll('button[data-details], a[data-details]');

    btns.forEach(btn => {

        if (!btn.classList.contains('btn-active')) {

            let targetIds = btn.dataset.details.split(' ').filter(Boolean);
            let toggle = btn.dataset.detailsToggle || '';

            let targets = targetIds.map(id => document.getElementById(id));
            if (btn.nodeName.toLocaleLowerCase() === 'button') {
                btn.type = 'button';
            }

            btn.addEventListener('click', (e) => {
                // no spcific target
                if (!targetIds.length) {
                    let parent = btn.parentNode.closest('[data-details]') || btn.parentNode.closest('.details-enhanced');
                    let detailsOpen = parent.querySelectorAll('details[open]');
                    let detailsClosed = parent.querySelectorAll('details:not([open])');

                    let detailsRest = detailsOpen.length > detailsClosed.length ? detailsOpen : detailsClosed;
                    let mode = toggle === 'expand' || toggle === 'collapse' ? toggle : 'toggle';
                    targets = mode === 'expand' ? detailsClosed : (mode === 'collapse' ? detailsOpen : detailsRest);
                }

                toggleDetails(targets);
            });

            btn.classList.add('btn-active');

        }
    });
}

function closeDetails(parentEl = null, exclude=null) {
    parentEl = parentEl ? parentEl : document.body;
    let details = parentEl.querySelectorAll('details[open]');
    toggleDetails(details, exclude);
}

function toggleDetails(details = null, exclude=null) {
    details.forEach(detail => {

        let nodeName = detail.nodeName.toLowerCase();
        let summary = nodeName === 'summary' ? detail : detail.querySelector('summary');
        if(!exclude || summary!==exclude){
            summary.dispatchEvent(new Event('click'));
        }
    });
}

function bindDetailsEvents(detail, detailsContent, summary, expanded, type = '') {

    let parent = detail.parentNode.closest('[data-details]') || detail.parentNode.closest('.details-enhanced');

    // prevent duplicate events
    if (!summary.classList.contains('summary-active')) {

        /**
         * events and 
         * animation
         */

        // toggle open state after transition end
        detailsContent.addEventListener("transitionend", (e) => {

            if (!expanded) {
                detail.open = false;
            } else {
                detailsContent.classList.add("details-content-open");
            }
        });

        // toggle states on click
        summary.addEventListener("click", (e) => {
            e.preventDefault();
            let current = e.currentTarget;
            let detail = current.closest("details");
            let detailsContent = current.parentNode.querySelector('.details-content');
            let summaryMarker = current.querySelector('.summary-marker');

            // close others in accordion mode
            if(type==='accordion'){
                closeDetails(parent, summary);
            }
        
            // collapse
            if (expanded) {
                expanded = false;
                detail.classList.remove("details-expanded");
                detailsContent.classList.remove("details-content-expanded");
                detailsContent.classList.remove("details-content-open");

                summary.classList.remove("summary-expanded");
                summaryMarker.classList.replace("summary-marker-expanded", "summary-marker-collapsed");

            }
            // expand
            else if (!expanded) {
                expanded = true;
                detail.open = true;
                summary.classList.add("summary-expanded");
                summaryMarker.classList.replace("summary-marker-collapsed", "summary-marker-expanded");

                // tiny delay for expand transition
                setTimeout(() => {
                    detail.classList.add("details-expanded");
                    detailsContent.classList.add("details-content-expanded");
                }, 10);

            }

        });

        summary.classList.add('summary-active');

    }

}

function enhanceDetailsAutoInit() {
    let detailsToEnhance = document.querySelectorAll('.details-enhanced, [data-details], [data-enhance-inputs]');
    if (detailsToEnhance.length) {
        enhanceDetails();
    }
}

function enhanceDetails(options = {}) {

    // default options
    options = {
        ...{
            target: 'body',
            icon: '',
            round: false,
            right: false,
            plus: false
        },
        ...options
    };
    let { target, icon, round, right } = options;

    // selector el
    let selection = document.querySelector(target);

    // details wraps
    let details = selection.querySelectorAll('details');

    // current hash
    let hash = window.location.hash.replace('#', '');

    /**
     *  loop through details
     */

    for(let i=0, l=details.length; l&&i<l; i++ ){

        let detail = details[i];

        // prevent duplicate initialization
        if(detail.classList.contains('details-enhanced-active')){
            continue
        }

        /**
         * skip if 
         * already processed
         */
        let processed = detail.querySelector('.details-content') ? true : false;
        if (processed) return false;

        let classModifiers = '', summarMarkerStyle = '', summarMarkerAlignment = '', summaryMarkerState = '';

        /**
        * all wrap detail's content: 
        * outer wrap for grid display context
        * and inner for hidden overflow
        */
        let detailsContent = document.createElement("div");
        detailsContent.classList.add("details-content");
        let detailsContentInner = document.createElement("div");
        detailsContentInner.classList.add("details-content-inner");

        let children = [...detail.children];
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.nodeName.toLowerCase() !== "summary") detailsContentInner.append(child);
        }
        detailsContent.append(detailsContentInner);
        detail.append(detailsContent);

        /**
        * add anchor ids - if not present
        * add expanded classes for
        * auto expand targeted details by hash/anchor id
        * expand current hash
        */

        let summary = detail.querySelector('summary');
        let anchorID = summary.id;
        if (!summary.id) {
            anchorID = textToAnchorUrl(summary.textContent);

            // if ID is already reserved - add numeric suffix
            if (document.getElementById(anchorID)) {
                let len = document.querySelectorAll(`#${anchorID}`).length;
                anchorID = `${anchorID}-${len + 1}`;
            }
            summary.id = anchorID;
        }

        if (hash === anchorID) detail.open = true;
        let expanded = detail.hasAttribute("open");

        // expand when "open" attribute is set
        if (expanded) {
            detail.classList.add("details-expanded");
            summary.classList.add("summary-expanded");
            summaryMarkerState = 'summary-marker-expanded';
            detailsContent.classList.add("details-content-expanded");
        } else {
            summaryMarkerState = 'summary-marker-collapsed';
        }

        /**
         * merge options from data attribute
         * css class applied to parent, details
         * or summary element
         */

        let summaryOptions = getDetailsCSSOptions(summary);
        let summaryDataAtt = summary.dataset.details || summary.dataset.summary;
        let summaryDataOptions = summaryDataAtt ? JSON.parse(summaryDataAtt) : {};

        summaryOptions = {
            ...summaryOptions,
            ...summaryDataOptions
        };

        let optionsFinal = summaryOptions;

        if (!Object.keys(summaryOptions).length) {
            // get custom parent options
            let dataParent = detail.closest('[data-details]');
            let optionsDataDetails = dataParent ? JSON.parse(dataParent.dataset.details) : {};

            // CSS option parent
            let cssInitEl = detail.closest('.details-enhanced');
            let cssOptions = cssInitEl ? getDetailsCSSOptions(cssInitEl) : {};

            optionsFinal = {
                ...cssOptions,
                ...optionsDataDetails
            };
        }

        let { icon, round, right, plus, type='' } = optionsFinal;

        /** 
         * add toggle icon
         * 1. add round background
         * 2. customize icon
         */

        // custom icon from icon object or svg markup in icon property
        let markerIconCustom = summaryIcons[icon] ? summaryIcons[icon] : (icon ? icon : '');

        // round background
        if (round) {
            classModifiers = ' summary-marker-round';
        }

        // plus/minus style
        if ((icon == '+' || icon == 'plus' || plus)) {
            markerIconCustom = '';
            summarMarkerStyle = 'summary-marker-plus';
        }

        // right or left alignment
        if (right) {
            summarMarkerAlignment = 'summary-marker-right';
        }

        // custom svg icon
        if (markerIconCustom) summarMarkerStyle = 'summary-marker-icon';

        let markerIcon = `<span class="summary-marker ${classModifiers} ${summarMarkerStyle} ${summarMarkerAlignment} ${summaryMarkerState}" aria-hidden="true" focusable="false">${markerIconCustom}</span>`;
        summary.insertAdjacentHTML("afterbegin", markerIcon);

        detail.classList.add('details', 'details-enhanced', 'details-enhanced-active');
        summary.classList.add("summary");

        // add event listeners
        bindDetailsEvents(detail, detailsContent, summary, expanded, type);

    }

    bindDetailsOpenbtns();

}

function initDraggables(limitToParent = false, draggableClass = "draggable") {
    let draggables = document.querySelectorAll('.draggable');
    draggables.forEach(el => {
        makeDraggable(el, limitToParent, draggableClass);
    });
}

function makeDraggable(
  el,
  limitToParent = false,
  draggableClass = "draggable"
) {
  let active = null;
  let svg = el.parentNode.closest("svg");
  let pt;
  let parent = el.parentNode;

  // transforms
  let mtx = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    translateX = 0,
    translateY = 0;

  // get svg user space coordinates
  const screen2SVG = (svg, x, y, mtx = null) => {
    let pt = new DOMPoint(x, y);
    mtx = mtx ? mtx : svg.getScreenCTM().inverse();
    return pt.matrixTransform(mtx);
  };

  // Parse current CSS transform (matrix)
  const getMatrix = (el) => {
    let mtx = getComputedStyle(el).transform;
    return new DOMMatrix(mtx);
  };

  // Apply absolute translation (not incremental)
  function applyTransform(el, mtx) {
    el.style.transform = `matrix(${mtx.a}, ${mtx.b}, ${mtx.c}, ${mtx.d}, ${mtx.e}, ${mtx.f})`;
  }

function start(e) {
    const handle = e.target.closest('.drag-handle');
    const dragTarget = e.target.closest('.' + draggableClass);

    // Not clicking any draggable
    if (!dragTarget) return;

    // Only start if this click belongs to our draggable
    if (dragTarget !== el) return;

    // Check if this draggable contains ANY handles
    const hasHandle = !!el.querySelector('.drag-handle');

    // CASE 1: Clicked a handle → always allow
    if (handle && handle.closest('.' + draggableClass) === el) ;
    // CASE 2: Clicked directly on the draggable (empty background) → allow
    else if (e.target === el) ;
    // CASE 3: Clicked inside child content → allow only if there are NO handles
    else if (!hasHandle) ;
    // Otherwise: block drag
    else {
        return;
    }

    // --- START DRAG LOGIC ---
    active = el;

    pt = { x: e.clientX, y: e.clientY };
    if (svg) pt = screen2SVG(svg, pt.x, pt.y);

    mtx = getMatrix(el);

    mtx.e = pt.x - mtx.e;
    mtx.f = pt.y - mtx.f;
    translateX = mtx.e;
    translateY = mtx.f;

    e.preventDefault();
}

  function move(e) {
    if (!active) return;
    e.preventDefault();

    // original mouse coordinates
    let pt = { x: e.clientX, y: e.clientY };

    // check element in point
    if (limitToParent) {
      let els = document.elementsFromPoint(pt.x, pt.y);

      if (!els.includes(parent)) {
        return;
      }
    }

    // convert screen to svg coordinates
    if (svg) pt = screen2SVG(svg, pt.x, pt.y);

    // get deltas
    let dx = pt.x - translateX;
    let dy = pt.y - translateY;

    // store delta values
    el.dataset.delta = [dx, dy].join(" ");

    // update matrix and apply
    mtx.e = dx;
    mtx.f = dy;
    applyTransform(active, mtx);

    
  }

  function end() {
    active = null;
  }

  el.addEventListener("mousedown", start);
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", end);
}

function initDialogs(dialogSelector = "[data-dialog]") {

    let dialogBtns = document.querySelectorAll(dialogSelector);
    if (!dialogBtns.length) return false;

    /**
     * add dialog UI
     */

    dialogBtns.forEach(dialogBtn => {
        let selector = dialogBtn.dataset.dialog;
        let dataSrc = dialogBtn.dataset.dialogSrc;
        let dialogTitle = dialogBtn.dataset.dialogTitle;
        let dialog = document.querySelector(`${selector}`);

        // no dialog - exit
        if (!dialog) return false;

        // make draggable
        dialog.classList.add('draggable');

        let dialogWrap = dialog.closest('.dialog-wrap');
        let dialogHeader = dialog.querySelector('.dialog-header');
        let btnClose = dialog.querySelector('.dialog-btn-close');
        let iframe = dialog.querySelector('.iframe-dialog');
        let dialogContent = dialog.querySelector('.dialog-content');

        // get transition timings from computed style
        let style = getComputedStyle(dialog);
        let duration = parseFloat(style.getPropertyValue("transition-duration")) * 1000;
        let delay = parseFloat(style.getPropertyValue("transition-delay")) * 1000;

        if (!dialogWrap) {
            dialogWrap = document.createElement('div');
            dialogWrap.classList.add('dialog-wrap');
            dialog.parentNode.insertBefore(dialogWrap, dialog);
            dialogWrap.append(dialog);
        }

        if (!dialogContent) {
            let children = [...dialog.children];
            dialogContent = document.createElement('div');
            dialogContent.classList.add('dialog-content',);
            dialog.append(dialogContent);
            dialogContent.append(...children);
        }

        if (!dialogHeader) {
            dialogHeader = document.createElement('header');
            dialogHeader.classList.add('dialog-header', 'drag-handle');
            dialogHeader.insertAdjacentHTML('afterbegin', `<p class="dialog-header-title ">${dialogTitle}</p>`);
            dialog.insertBefore(dialogHeader, dialog.children[0]);
        }

        if (!btnClose) {

            btnClose = document.createElement('button');
            btnClose.classList.add('dialog-btn-close');
            btnClose.type = 'button';
            btnClose.setAttribute('aria-label', 'Close dialog');
            btnClose.textContent = '×';
            dialogHeader.append(btnClose);

        }

        if (dataSrc && !iframe) {
            iframe = document.createElement('iframe');
            iframe.classList.add('iframe-dialog', 'brd-non', 'wdt-100', 'min-hgt-75vh');
            dialogContent.append(iframe);
            dialogWrap.classList.add('dialog-wrap-iframe');

        }

        // make it scrollable
        dialogContent.classList.add('scrollbar', 'scroll-content');

        // open dialog modally
        dialogBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            let dialogSrc = dialogBtn.dataset.dialogSrc;

            // load page in iframe
            if (dialogSrc && iframe) {
                iframe.src = dialogSrc;
                iframe.addEventListener("load", function () {
                    dialogWrap.classList.add("dialog-active");
                });
            } else {
                dialogWrap.classList.add("dialog-active");
            }

            // show modal
            dialog.showModal();

        });

        // "Close" button closes the dialog
        btnClose.addEventListener("click", () => {
            closeDialog(dialog, dialogWrap, duration, delay);
        });

        // close on backdrop click
        dialog.addEventListener("click", (e) => {

            let {
                left,
                top,
                right,
                bottom,
                width,
                height
            } = dialog.getBoundingClientRect();

            if (dialog.open) {
                let pt = { x: e.clientX, y: e.clientY };
                // is outsite bbox
                if (pt.x > right || pt.x < left || pt.y > bottom || pt.y < top) {
                    closeDialog(dialog, dialogWrap, duration, delay);
                }
            }
        });

        // make draggable
        initDraggables();

    });

    /**
     * close dialogs on ESC
     */

    document.addEventListener('keyup', function (event) {
        if (event.key === "Escape" || event.keyCode == 27) {
            closeDialogs();
        }
    });

}

function closeDialog(dialog, dialogWrap, duration, delay) {
    dialogWrap.classList.remove("dialog-active");

    // delay close to enable backdrop transition
    setTimeout(() => {
        dialog.close();
    }, (duration + delay));
}

function closeDialogs() {
    let dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {

        let dialogWrap = dialog.closest('.dialog-wrap');

        // get transition timings from computed style
        let style = getComputedStyle(dialog);
        let duration = parseFloat(style.getPropertyValue("transition-duration")) * 1000;
        let delay = parseFloat(style.getPropertyValue("transition-delay")) * 1000;

        closeDialog(dialog, dialogWrap, duration, delay);

    });
}

async function loadMDs() {

    let mdTargets = document.querySelectorAll("[data-md]");

    if (mdTargets.length && typeof makeMDP !== 'function') {
        console.warn('no md parser available');
    }

    for (let i = 0, len = mdTargets.length; len && i < len; i++) {
        let target = mdTargets[i];
        let mdUrl = target.dataset.md;
        let markdown = mdUrl
            ? await (await fetch(mdUrl)).text()
            : target.innerHTML.trim();

        let mdp = makeMDP();
        let html = mdp.render(markdown);
        target.innerHTML = html;

        let anchors = target.querySelectorAll('[id]');
        anchors.forEach(el=>{
            el.id = el.id.toLocaleLowerCase();
        });

    }
}

// create zip
async function getZipUrl(files = {}) {

    const fetchBinary = async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
            console.warn("could't fetch resource");
            return null;
        }
        return new Uint8Array(await res.arrayBuffer());
    };

    const encoder = new TextEncoder();

    for (let name in files) {
        let val = files[name];

        let isString = typeof val === 'string';
        let ext = isString && !val.includes('<') && !val.includes('>') ? val.split('.').slice(-1)[0].toLowerCase() : '';
        let isUrl = isString && (val.startsWith('http') || val.startsWith('.') || (ext && ext.length < 5));

        if (isString) {
            if (isUrl) {
                let binary = await fetchBinary(val);
                if (binary) {
                    files[name] = binary;
                } else {
                    delete files[name];
                }
            }
            else {
                files[name] = encoder.encode(val);
            }
        }
    }

    let zip = UZIP.encode(files);
    let blob = new Blob([zip]);
    let url = URL.createObjectURL(blob);
    return url
}

function getCodeLang(el) {
    let classes = Array.from(el.classList);
    let classLang = classes.find((c) => c.startsWith("lang-") || c.startsWith("language-")) ||
        "";
    classLang = classLang ? classLang.split("-")[1] : "";
    let lang = el.dataset.codeLang || (classLang ? classLang : "html");
    return lang;

}

function enhanceCode() {
    let els = [...document.querySelectorAll("[data-code], [class*=language-], pre[class*=lang-]")];

    for (let i = 0, l = els.length; l && i < l; i++) {
        let el = els[i];

        // get language from class
        let classes = Array.from(el.classList) || [];
        let lang = getCodeLang(el);

        let nodeName = el.nodeName.toLowerCase();
        let raw = nodeName === "textarea" ? el.value : el.innerHTML;

        // remove indentation
        raw = stripIndent(raw);

        // don't transform if its already pre or code
        let pre = el.closest("pre");
        let code = el.querySelector("code");

        if (!pre) pre = document.createElement("pre");
        pre.classList.add(
            ...classes,
            `language-${lang}`,
            "pre-prism",
            "scroll-content"
        );

        if (!code) {
            code = document.createElement("code");
            code.textContent = raw;
            pre.append(code);

            // Clean replacement
            el.replaceWith(pre);
        }

        normalizePreCodeSpacing(pre);
        code.textContent = stripIndent(code.textContent);

        addCodeUI(pre, code, lang);

        // Build elements safely
        code.classList.add(`language-${lang}`, "code-prism");
    }
    bindCodeSelectAll();
}

function bindCodeSelectAll(selector = 'code') {
    let els = document.querySelectorAll(selector);
    els.forEach(el => {
        el.setAttribute('tabindex', '0');
        bindElementSelectAll(el);
    });
}

function bindElementSelectAll(el) {
    el.addEventListener("keydown", (e) => {
        const isSelectAll = (e.key === "a" || e.key === "A") && (e.ctrlKey || e.metaKey);

        if (isSelectAll) {
            e.preventDefault();
            // Create a selection covering the block's contents
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(el);

            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
}

function addCodeUI(pre, code, lang = "html") {

    let uiWrap = `<header class="pre-header">
       <p class="pre-p p-code-lang" tabindex="-1">${lang}</p>
       <button type="button" class="pre-btn btn-copy" aria-label="copy code" title="copy code" data-icon="copy">
       </button>
        </header>`;

    pre.insertAdjacentHTML("afterbegin", uiWrap);

    let btnCopy = pre.querySelector(".btn-copy");
    bindCopyBtn(btnCopy, pre, "code");
}

function bindCopyBtn(btn, parent, sel = "") {
    if (!btn || !sel) return;
    // events already attached
    if (btn.classList.contains("btn-active")) return;

    let code = parent.querySelector(sel);
    let input = parent.querySelector(".input-copy");
    const inIframe = window.self !== window.top;

    // create hidden textarea if clipboard API is not available
    if (!input && inIframe) {
        input = document.createElement("textarea");
        input.classList.add('sr-only');

        input.setAttribute("tabindex", "-1");
        parent.append(input);
    }

    btn.addEventListener("click", (e) => {
        let text = code.textContent;

        if (!inIframe && navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {

            // populate textarea with pre content to enable copying
            if (input) {
                input.value = text;
                input.focus();
                input.select();
                document.execCommand("copy");
            }
        }
    });

    btn.classList.add("btn-active");
}

function normalizePreCodeSpacing(pre) {
  if (!pre) return;

  // Trim whitespace right after <pre> and before <code>
  const first = pre.firstChild;
  if (first && first.nodeType === Node.TEXT_NODE) {
    first.textContent = first.textContent.replace(/^\s+/, "");
  }

  // Trim whitespace right before </pre>, after </code>
  const last = pre.lastChild;
  if (last && last.nodeType === Node.TEXT_NODE) {
    last.textContent = last.textContent.replace(/\s+$/, "");
  }
}

function stripIndent(str) {
    // Normalize newlines
    str = str.replace(/\r\n/g, "\n");
    let lines = str.split("\n");

    // Find the first non-empty line
    let firstLine = lines.find((line) => line.trim() !== "");

    if (!firstLine) {
        return str; // string is empty or whitespace only
    }

    // Detect indentation from the first non-empty line
    const match = firstLine.match(/^(\s+)/);
    if (!match) {
        // First line has no indentation → nothing to strip
        return str.trim();
    }

    const indentSize = match[1].length;
    const regex = new RegExp(`^\\s{${indentSize}}`);

    // Strip that indentation from all lines
    let out = lines.map((line) => line.replace(regex, "")).join("\n");

    // Remove extra blank lines at start/end
    return out.replace(/^\n+|\n+$/g, "");
}

/**
 * add mouse controls
 * to number fields
 */

function enhanceNumberFields(selector = '[data-enhance-inputs]') {

    let numberFields = document.querySelectorAll(`${selector} input[type=number]`);

    for (let i = 0, len = numberFields.length; len && i < len; i++) {
        let input = numberFields[i];
        enhanceNumberField(input);

    }
}

function enhanceNumberField(input) {

    let wrap = input.closest(".input-wrap-number");

    if(!wrap){
        wrap = document.createElement('div');
        wrap.classList.add('input-wrap-number');
        input.parentNode.insertBefore(wrap, input);
        wrap.append(input);
    }

    let btnsNum = wrap.querySelector('.input-number-btns');
    if (btnsNum) return;

    let {min=0, max=100, step=1, value=0} = input;
    let maxLen = max ? max.toString().length : 0;
    let stepLen = step ? step.toString().length : 0;
    stepLen = stepLen>1 ? stepLen : 0;
    input.value=value;

    let charLen = maxLen + stepLen;

    if (charLen) {
        input.classList.add(`input-number-${charLen}`);
    }

    // convert type number to text
    input.type = "text";

    input.title = !input.title ? "Use Mousewheel or arrow keys to change values" : input.title;
    input.classList.add('input-number', 'no-focus');

    /**
     * add plus minus buttons
     */

    let btns = `<div class="input-number-btns">
        <button type="button" class="input-number-btn input-number-btn-minus no-focus">&minus;</button>
        <button type="button" class="input-number-btn input-number-btn-plus no-focus">+</button>
        </div>`;

    wrap.insertAdjacentHTML('beforeend', btns);

    // add event listeners
    bindNumberEvents(input);
}

function bindNumberEvents(input, syncInput = null) {

    function safeCalculation(input) {
        const cleanValue = input.value
            .replace(/,/g, ".")
            .replace(/[^0-9+\-*/.\se]/g, "");

        try {
            const result = Function(`'use strict'; return (${cleanValue})`)();
            if (!isNaN(result)) {
                input.value = result;
            }
        } catch (e) {
            console.warn("Invalid calculation");
        }
    }

    let wrap = input.closest(".input-wrap-number");

    let min = input.min ? +input.min : -Infinity;
    let max = input.max ? +input.max : Infinity;
    let step = input.step ? +input.step : 1;

    input.addEventListener("change", () => safeCalculation(input));

    let btnMinus = wrap.querySelector('.input-number-btn-minus');
    let btnPlus = wrap.querySelector('.input-number-btn-plus');

    btnMinus.addEventListener('click', e => {
        let newVal = +(+input.value - step).toFixed(12);
        input.value = newVal>= min ?  newVal : min;

        upDateSynced(syncInput, input);
        input.dispatchEvent(new Event('input'));

    });

    btnPlus.addEventListener('click', e => {
        let newVal = +(+input.value + step).toFixed(12);
        input.value = newVal<=max ? newVal : max;
        upDateSynced(syncInput, input);
        input.dispatchEvent(new Event('input'));

    });

    if (syncInput) {
        input.addEventListener('input', e => {

            syncInput.value = input.value;

        });
        input.addEventListener('keyup', e => {

            upDateSynced(syncInput, input);

        });

        input.addEventListener('blur', e => {

            upDateSynced(syncInput, input);
        });
    }

    function upDateSynced(syncInput = null, input) {
        if (syncInput) {

            syncInput.value = input.value;
            syncInput.dispatchEvent(new Event('input'));
        }
    }

    input.addEventListener("keydown", (e) => {
        let val = +input.value;
        let newVal = val;

        if (
            e.keyCode == 38 ||
            e.keyCode == 39 ||
            e.keyCode == 40 ||
            e.keyCode == 37
        ) {
            // up or right arrow = increase
            if (e.keyCode == 38 || e.keyCode == 39) {
                newVal += step;
            }
            // down or left arrow = decrease
            else if (e.keyCode == 40 || e.keyCode == 37) {
                newVal -= step;
            }

            if (newVal < min) newVal = min;
            if (newVal > max) newVal = max;
            input.value = +newVal.toFixed(8);
            input.dispatchEvent(new Event('input'));
        }
    });

    input.addEventListener("wheel", (e) => {
        if (document.activeElement === input) {
            e.preventDefault(); // allowed because passive:false
            let offY = e.deltaY * 0.05;
            let val = +input.value;
            offY = round(offY / step) * step;
            let newVal = +(val - offY).toFixed(8);

            if (newVal < min) newVal = min;
            if (newVal > max) newVal = max;
            input.value = newVal;

            input.dispatchEvent(new Event("input"));
            upDateSynced(syncInput, input);

        }
    }, { passive: false });

    // synced input
    if (syncInput) {
        syncInput.addEventListener('input', e => {
            input.value = syncInput.value;

            input.dispatchEvent(new Event('input'));

        });
    }

}

// Initialize the triple click listener globally

function enhanceRangeInputs(selector = '[data-enhance-inputs]') {

    let inputs = document.querySelectorAll(`${selector} input[type=range].input-range-num, ${selector} input[data-type=range-number]`);

    for (let i = 0, len = inputs.length; len && i < len; i++) {
        let input = inputs[i];

        input.classList.add('input-range-num');
        enhanceRangeInput(input);

    }

}

function enhanceRangeInput(input) {

    let wrap = input.closest(".input-wrap-range");

    if(!wrap){
        wrap = document.createElement('div');
        wrap.classList.add('input-wrap-range');
        input.parentNode.insertBefore(wrap, input);
        wrap.append(input);
    }

    wrap.classList.add('input-wrap-range-num');

    let btnsNum = wrap.querySelector('.input-number-btns');
    if (btnsNum) return;

    let {min=0, max=100, step=1, value=0} = input;
    let maxLen = max ? max.toString().length : 0;
    let stepLen = step ? step.toString().length : 0;
    stepLen = stepLen>1 ? stepLen : 0;
    let charLen = maxLen + stepLen;

    if (charLen) {
        input.classList.add(`input-number-${charLen}`);
    }

    // add number field
    let inputNumberMarkup =
        `<div class="input-wrap input-wrap-boxed input-wrap-number">
            <input type="text" class="input input-active input-number-${charLen} input-number no-focus" 
            name="num1" min="${min}" max="${max}" step="${step}" value="${value}" >
            <div class="input-number-btns">
                <button type="button" class="input-number-btn input-number-btn-minus no-focus">−</button>
                <button type="button" class="input-number-btn input-number-btn-plus no-focus">+</button>
            </div>
        </div>`;

    wrap.insertAdjacentHTML('beforeend', inputNumberMarkup);

    let inputNumber = wrap.querySelector('.input-number');
    let sync = input;
    bindNumberEvents(inputNumber, sync);

}

function enhancePasswordFields(selector = '[data-enhance-inputs]'){

    let inputs = document.querySelectorAll(`${selector} input[type=password]`);

    for (let i = 0, len = inputs.length; len && i < len; i++) {
        let input = inputs[i];
        enhancePasswordField(input);
    }

}

function enhancePasswordField(input) {
    let wrap = input.closest('.input-wrap');

    // add button

    let btnHTML = `<button type="button" class="icon-wrap btn-non btn-password btn-password" title="Show password">
    <span class="icn-wrp icon-wrap icn-wrp-multi icn-pos-left" data-icon="eye-slash eye" ></span>
    </button>`;
    wrap.insertAdjacentHTML('beforeend', btnHTML);

    let btn = wrap.querySelector('.btn-password');
    btn.addEventListener('click', (e)=>{

        let input = wrap.querySelector('input');
        let {type} = input;
        let icnWrp = btn.querySelector('.icn-wrp-multi');

        if(type==='password'){
            input.type='text';
            icnWrp.classList.add('icn-wrp-multi-1');
        }else {
            input.type='password';
            icnWrp.classList.remove('icn-wrp-multi-1');
        }

    });

}

function enhanceColorInputs(selector = '[data-enhance-inputs]') {

    let inputs = document.querySelectorAll(`${selector} input[type=color]`);

    for (let i = 0, l = inputs.length; l && i < l; i++) {
        let input = inputs[i];
        enhanceColorInput(input);
    }

}

function enhanceColorInput(input) {

    let wrap = input.closest(".input-wrap-color");

    if (!wrap) {
        wrap = document.createElement("div");
        wrap.classList.add('input-wrap', 'input-wrap-color');
        input.parentNode.insertBefore(wrap, input);
        wrap.append(input);
    }

    let colorInput = wrap.querySelector('.input-color-value');

    if (colorInput) return;

    let colorInputHTML =
`<span class="input-color-value-span">
    <input type="text" class="input-color-value" value="" title="Enter color value" >
</span>`;

    let label = document.createElement('label');
    label.classList.add('label-input-color');
    input.classList.add('sr-only');
    label.append(input);

    label.insertAdjacentHTML('afterbegin', `<span class="input-color-value-preview" ></span>`);
    wrap.append(label);

    wrap.insertAdjacentHTML('afterbegin', colorInputHTML);
    bindColorInput(input, wrap);

}

function bindColorInput(input, wrap = null) {
    if (!wrap) return;

    // numeric input
    let inputValue = wrap.querySelector(".input-color-value");
    inputValue.value = input.value;

    // tempory el for color conversions
    let colorEl = wrap.querySelector('.input-color-value-preview');
    colorEl.style.backgroundColor = input.value;
    let rbga = [];

    // native color picker
    input.addEventListener('input', (e) => {
        let colorVal = input.value;
        rbga = hexToRgbaArray(colorVal);
        let rgbVal = rbga.length === 4 ? `rgba(${rbga.join(', ')})` : `rgb(${rbga.join(', ')})`;
        inputValue.value = rgbVal;
        colorEl.style.backgroundColor = rgbVal;

    });

    inputValue.addEventListener('input', (e) => {

        let value = inputValue.value;
        colorEl.style.backgroundColor = value;

        let style = window.getComputedStyle(colorEl);
        let color = style.backgroundColor.replace(/[rgb|rgba|\(|\)]/g, '').split(', ').map(Number);

        color.length === 4 ? color[3] : 1;

        let rgbaHex = rgbaArrayToHex(color);
        let rgbaHexHtml = rgbaHex.substring(0, 7);

        // full rgba value
        input.value = rgbaHexHtml;

    });

    function hexToRgbaArray(hex) {
        if (typeof hex !== 'string' || !hex.startsWith('#')) {
            throw new Error('Expected a hex color string starting with "#"');
        }

        // Remove #
        let value = hex.slice(1).trim();

        // Expand shorthand forms (#rgb or #rgba → #rrggbb or #rrggbbaa)
        if (value.length === 3 || value.length === 4) {
            value = value.split('').map(c => c + c).join('');
        }

        if (value.length !== 6 && value.length !== 8) {
            throw new Error('Invalid hex color format');
        }

        let hasAlpha = value.length === 8;

        // Parse RGB
        let r = parseInt(value.slice(0, 2), 16);
        let g = parseInt(value.slice(2, 4), 16);
        let b = parseInt(value.slice(4, 6), 16);
        let a = hasAlpha ? parseInt(value.slice(6, 8), 16) / 255 : 1;

        return hasAlpha ? [r, g, b, a] : [r, g, b];
    }

    function rgbaArrayToHex(rgba) {
        if (!Array.isArray(rgba) || (rgba.length !== 3 && rgba.length !== 4)) {
            throw new Error('Expected an array of 3 (RGB) or 4 (RGBA) numeric values');
        }

        let hasAlpha = rgba.length === 4;

        let [r, g, b, a = 1] = rgba;
        let toHex = v => round(v).toString(16).padStart(2, '0');

        let baseHex =
            '#' +
            [r, g, b, a]
                .map(toHex)
                .join('')
                .toLowerCase();

        if (!hasAlpha) {
            console.log('alpha', rgba);
            baseHex = baseHex.substring(0, baseHex.length - 2);
        }
        return baseHex;
    }

}

function enhanceFileinputs(selector = '[data-enhance-inputs]', labelFileBtn = "Upload File", labelFileBtnDrop = "Drop File") {

    let inputs = document.querySelectorAll(`${selector} input[type=file]`);

    for (let i = 0, l = inputs.length; l && i < l; i++) {
        let input = inputs[i];
        let wrap = input.closest(".input-wrap-file");

        // skip for textarea toolbars
        let hasHeader = input.closest('.input-wrap-textarea-header');
        if (hasHeader) continue

        if (!wrap) {
            wrap = document.createElement("div");
            wrap.classList.add('input-wrap', 'input-wrap-file');
            input.parentNode.insertBefore(wrap, input);
            wrap.append(input);

        }

        let icons = wrap.querySelector('.icn-svg');
        let btnCustom = wrap.querySelector('.btn-file-custom');
        if (btnCustom || icons) continue;

        // hide default btn
        input.classList.add("sr-only");

        // take label text from data attribute
        labelFileBtn = input.dataset.label ? input.dataset.label : labelFileBtn;

        // add new UI elements
        let fileUiHTML = `<div class="btn-default btn-file btn-file-custom " type="button" aria-hidden="true" >
        <span class="icn-wrp icn-wrp-file" data-icon="arrow-up-tray" data-icon-pos="left"></span>
            <span class="label-file">${labelFileBtn}</span><span class="label-file label-drop">${labelFileBtnDrop}</span>
          </div>
          <p class="input-file-info"></p>`;

        wrap.insertAdjacentHTML("beforeend", fileUiHTML);

        // bind custom buttons
        bindFileInput(wrap);

        // bind drop area
        bindFileInputDropArea(wrap);
    }

}

function bindFileInput(wrap = null) {
    if (!wrap) return;

    let input = wrap.querySelector("input[type=file]");
    let btnFile = wrap.querySelector(".btn-file");

    // prevent duplicate event listeners
    if (btnFile.classList.contains('input-active')) return;

    let isWrappedInLabel = input.closest('label');

    // don't delegate click if wrapped in label
    if(!isWrappedInLabel){
        btnFile.addEventListener("click", (e) => {
            let inputFile = wrap.querySelector("input[type=file]");
            inputFile.click();

        });
    }

    // custom event - add file info
    input.addEventListener("input", (e) => {
        let fileInfoEl = wrap.querySelector(".input-file-info");
        let files = [...e.currentTarget.files];

        let fileInfo = [];
        files.forEach((file) => {
            let { name, size } = file;
            fileInfo.push(`${name} (${+(size / 1024).toFixed(1)} KB)`);
        });

        let fileText = '<ul class="input-file-ul">' + fileInfo.map(file => { return `<li class="input-file-li">${file}</li>` }).join(' ') + '</ul>';
        fileInfoEl.innerHTML = fileText;
    });

    btnFile.classList.add('input-active');

}

function bindFileInputDropArea(dropArea = null, inputFile = null, dragOverClass = 'input-file-drag-over') {

    // prevent duplicate event listeners
    if (!dropArea || dropArea.classList.contains('droparea-active')) return;

    // if input is in drop area or in parent element
    inputFile = inputFile ? inputFile : dropArea.querySelector("input[type=file]");

    let accepted = inputFile.accept ? inputFile.accept.split(',').filter(Boolean).map(type => type.trim()) : ['.txt', '.svg'];

    // Add event listeners for drag and drop events
    ["dragenter", "dragover"].forEach((event) => {
        dropArea.addEventListener(event, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add(dragOverClass);
        });
    });

    ["dragleave", "drop"].forEach((event) => {
        dropArea.addEventListener(event, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove(dragOverClass);
        });
    });

    // Handle drop event to assign file to the file input
    dropArea.addEventListener("drop", (e) => {

        let fileInfo = dropArea.querySelector('.input-file-info');
        if (fileInfo) fileInfo.textContent = '';

        let files = e.dataTransfer.files;

        let filesFiltered = new DataTransfer();

        for (let i = 0, l = files.length; i < l; i++) {
            let file = files[i];
            let type = file.type ? '.' + file.type.split('/').slice(-1) : null;
            // get type from extension
            let ext = '.' + file.name.split('.').slice(-1);

            if (accepted.includes(type) || accepted.includes(ext)) {
                filesFiltered.items.add(file);
            } else {
                console.warn('File type not allowed', type, ext, accepted);
            }

        }

        if (filesFiltered.files.length > 0) {

            inputFile.files = filesFiltered.files;

            // Trigger a change event on the file input to notify any listeners
            let changeEvent = new Event("input");
            inputFile.dispatchEvent(changeEvent);

        } else {
            if (fileInfo) fileInfo.textContent = 'Invalid filetype';
        }
    });

    dropArea.classList.add('droparea-active');
}

function enhanceTextareas(selector = '[data-enhance-inputs]') {

    let inputs = document.querySelectorAll(`${selector} textarea`);

    for (let i = 0, l = inputs.length; l && i < l; i++) {
        let input = inputs[i];
        enhanceTextarea(input);
    }

}

function enhanceTextarea(el = null, classWrap = 'input-wrap-textarea', classWrapHeader = 'input-wrap-textarea-header', classWrapToolbar = 'input-wrap-textarea-header-toolbar') {

    let wrap = el.closest(`.${classWrap}`);
    let isCode = el.closest('[class*=language-]');

    // ignore code textareas
    if(isCode) return;

    if (!wrap) {
        wrap = document.createElement('div');
        wrap.classList.add(classWrap, 'input-wrap', 'input-wrap-boxed', 'input-wrap-textarea');
        el.parentNode.insertBefore(wrap, el);
    }

    let header = wrap.querySelector(`${classWrapHeader}`);

    if (header) {
        return
    }

    // disable spell check
    el.spellcheck = false;
    el.classList.add('input-textarea', 'no-focus', 'scrollbar', 'scroll-content', 'scroll-content-notrack', 'scroll-content-thin', 'scroll-content-hover');

    // search for label
    let hasLabelWrap = wrap.nodeName.toLowerCase() === 'label';
    let prevSibling = !hasLabelWrap ? wrap.previousElementSibling : null;
    let hasLabelPrev = !hasLabelWrap ? (prevSibling?.nodeName.toLowerCase() === 'label' || false) : false;

    let label = hasLabelWrap ? wrap : (hasLabelPrev ? prevSibling : null);

    if (label) {
        label.classList.add('label-textarea');
    }

    let accept = el.getAttribute('accept') || '.txt,.svg';

    // create header
    let hasTools = el.dataset.tools;

    if(hasTools || hasLabelWrap){
        header = document.createElement('header');
        header.classList.add(classWrapHeader);
        wrap.append(header);
    }

    // add label to toolbar
    if (hasLabelWrap) {
        let labelSpan = wrap.querySelector('.label-span');
        if (labelSpan) header.append(labelSpan);
    }

    // file name for downloads
    let filename = el.dataset.file || 'output.txt';
    let dataTools = el.dataset.tools;
    let tools = dataTools ? dataTools.split(' ') : [];

    if (!tools.length) return;

    let html = `<div class="${classWrapToolbar}">`;

    // map to icon names
    let icons = {

        copy: 'copy',
        download: 'arrow-down-tray',
        upload: 'arrow-up-tray',
        delete: 'x-mark',
    };

    tools.forEach(tool => {

        if (tool !== 'size') {
            html += `<button type="button" data-icon="${icons[tool]}" class="btn btn-non btn-toolbar btn-${tool}" data-tooltip="${tool}" data-btn="${tool}"></button>`;
        }
        else if (tool == 'size') {
            html += `<span class="textarea-toolbar-span textarea-toolbar-span-size usr-slc-non"></span>`;
        }

        // add hidden inputs
        if (tool === 'download') {
            html += `<a href="" class="sr-only link-download" download="${filename}"></div>`;
        }

        if (tool === 'upload') {
            html += `<input type="file" class="sr-only input-file" accept="${accept}" tabindex="-1" >`;
        }
    });

    header.insertAdjacentHTML('beforeend', html);

    // add toolbar funcionality
    bindTextAreaToolbar(header, classWrap, classWrapHeader, classWrapToolbar);

}

/**
 * add tools
 */

function bindTextAreaToolbar(header = null, classWrap = '', classWrapHeader = '', classWrapToolbar = '') {

    let btns = header.querySelectorAll('.btn-toolbar');

    // size indicator
    let textareaSizeIndicator = header.querySelector('.textarea-toolbar-span-size');

    const getTextareaByteSize = (textarea) => {
        let len = textarea.value.trim().length;
        let kb = len / 1024;
        let mb = kb / 1024;
        let bytesize = kb < 1024 ? kb : mb;
        let unit = kb < 1024 ? 'KB' : 'MB';
        return +bytesize.toFixed(3) + ' ' + unit
    };

    const trackTextareaValue = (textarea, sizeEl) => {
        let lastValue = textarea.value;

        function checkForChanges() {
            if (textarea.value !== lastValue) {
                lastValue = textarea.value;
                sizeEl.textContent = getTextareaByteSize(textarea);
            }
            requestAnimationFrame(checkForChanges);
        }

        requestAnimationFrame(checkForChanges);
    };

    let textarea = textareaSizeIndicator?.closest(`.${classWrap}`)?.querySelector('textarea');

    if (textarea) {
        textareaSizeIndicator.textContent = getTextareaByteSize(textarea);
        trackTextareaValue(textarea, textareaSizeIndicator);
    }

    btns.forEach(btn => {
        let type = btn.dataset.btn;
        let parent = btn.closest(`.${classWrap}`);
        let fileInput = parent.querySelector('input[type=file]');
        let textarea = parent.querySelector('textarea');

        if (type === 'upload') {

            bindFileInputDropArea(textarea, fileInput);

            if (!fileInput.classList.contains('input-active')) {

                fileInput.addEventListener('input', async (e) => {
                    let current = e.currentTarget;
                    let textarea = current.closest(`.${classWrap}`).querySelector('textarea');
                    let file = current.files[0];

                    if (file) {

                        let cnt = await file.text();
                        textarea.value = cnt;

                        textarea.dispatchEvent(new Event('input'));
                    }
                });

                fileInput.classList.add('input-active');
            }

        }

        if (!btn.classList.contains('input-active')) {

            const inIframe = window.self !== window.top;

            btn.addEventListener('click', e => {
                let current = e.currentTarget;
                let parent = current.closest(`.${classWrap}`);
                let textarea = parent.querySelector('textarea');
                let text = textarea.value;

                if (type === 'copy') {

                    if (!inIframe && navigator.clipboard && window.isSecureContext) {

                        navigator.clipboard.writeText(text);

                    } else {

                        textarea.focus();
                        textarea.select();
                        document.execCommand('copy');
                    }

                }

                else if (type === 'download') {
                    let linkDownload = parent.querySelector('.link-download');
                    let mime = linkDownload.getAttribute('download') ? linkDownload.getAttribute('download').split('.').slice(-1)[0] : 'plain';
                    let objectUrl = URL.createObjectURL(new Blob([text], { type: `text/${mime}` }));

                    linkDownload.href = objectUrl;
                    linkDownload.click();
                }

                else if (type === 'upload') {
                    let fileInput = parent.querySelector('input[type=file]');
                    fileInput.click();
                }

                else if (type === 'delete') {
                    textarea.value = '';

                }

            });

            btn.classList.add('input-active');
        }

    });
}

function addInfos(selector = '[data-enhance-inputs] [data-info]') {

    let infoEls = document.querySelectorAll(`${selector}`);

    for (let i = 0; i < infoEls.length; i++) {

        let el = infoEls[i];
        if (el.classList.contains('has-info')) continue;

        let isButton = el.nodeName.toLowerCase() === 'button';
        let wrp = isButton ? el : el.closest('.input-wrap');

        let infoText = el.dataset.info;
        let btnInfo =
            `
        <button type="button" class="btn-info" data-icon="question" aria-label="show info">
        </button>
        <div class="tooltip-info tooltip-hidden-info">
            ${infoText}
        </div>`;

        
        if (!wrp) {
            wrp = document.createElement('div');
            wrp.classList.add('input-wrap', 'input-wrap-inline');
            el.parentNode.insertBefore(wrp, el);
            wrp.append(el);
        }

        wrp.insertAdjacentHTML('beforeend', btnInfo);

        let btn = wrp.querySelector('.btn-info');
        if(btn){
            btn.addEventListener('click', (e) => {
                if (!btn.classList.contains('btn-info-active')) {
                    btn.classList.add('btn-info-active');
                } else {
                    btn.classList.remove('btn-info-active');
                }
            });
    
            btn.addEventListener('blur', (e) => {
                    btn.classList.remove('btn-info-active');
            });
        }
    }

}

function addToolTips(selector = '[data-enhance-inputs] [data-tooltip]') {

    let titeleEls = document.querySelectorAll(`${selector}`);

    for (let i = 0; i < titeleEls.length; i++) {

        let el = titeleEls[i];
        if (el.classList.contains('has-tooltip')) continue;

        let isButton = el.nodeName.toLowerCase() === 'button';
        let wrp = isButton ? el : el.closest('.input-wrap');
        let tooltipLabel = el.dataset.tooltip;

        if (!wrp) {
            wrp = document.createElement('div');
            wrp.classList.add('input-wrap', 'input-wrap-inline');
            el.parentNode.insertBefore(wrp, el);
            wrp.append(el);
        }

        let tooltip =
            `<div class="tooltip tooltip-hidden">
        ${tooltipLabel}
        </div>`;

        el.setAttribute('aria-label', tooltipLabel);
        el.removeAttribute('title');

        el.classList.add('has-tooltip');
        wrp.insertAdjacentHTML('beforeend', tooltip);

    }

}

/**
 * wrap input elements
 * to add new functionality
 */
async function enhanceInputStyles(inputs = []) {

    let inputsInline = ['radio', 'checkbox', 'range', 'submit'];
    let classNameWrap = 'input-wrap';
    let classNameInput = 'input';

    for (let i = 0, l = inputs.length; l && i < l; i++) {

        let input = inputs[i];
        let nodeName = input.nodeName.toLowerCase();
        let type = input.type ? input.type : nodeName;
        let label = input.closest('label');
        if(label) label.classList.add('label');

        input.classList.add(`input`, `${classNameInput}-${type}`);

        // ignore hidden fields
        if (type === 'hidden') continue;

        // wrap elements
        let wrap = label ? label : document.createElement('div');
        wrap.classList.add(`${classNameWrap}`, `${classNameWrap}-${type}`);

        // boxed inputs - all but checkboxes and radio
        if (!inputsInline.includes(type)) {
            wrap.classList.add(`${classNameWrap}-boxed`);
        }

        // wrap label text
        if (label) {
            let labelSpan = document.createElement('span');
            labelSpan.classList.add('label-span', `label-span-${type}`);
            let textNode = [...label.childNodes].find(node => node.nodeType === 3 && node.textContent.trim());

            if(textNode){
                input.parentNode.insertBefore(labelSpan, textNode);
                labelSpan.append(textNode);

            }

            if (label.dataset.icon) {
                label.classList.add('input-wrap-icon');
            }
        }

        if (!label) {

            // filter out code textareas
            let isCode = nodeName === 'textarea' && input.closest('[class*=language-]');
            if(!isCode){
                input.parentNode.insertBefore(wrap, input);
                wrap.append(input);
            }
        }

        

        /**
         * add icons
         */
        let isPicker = type === 'select-one' || type === 'date' || type === 'time' || type === 'datetime-local';
        if (isPicker) {
            input.classList.add('input-picker');
            wrap.classList.add('input-wrap-picker');
        }

        if (type !== 'checkbox' && type !== 'radio' && type !== 'number') {
            input.classList.add('input-wide');
            wrap.classList.add('input-wrap-wide');
        }

        let inputIcons = {
            checkbox: 'checkbox checkbox-checked',
            'checkbox-switch': 'checkbox-switch checkbox-switch-checked',
            radio: 'radio radio-checked',
            'select-one': 'chevron-down',
            date: 'calendar',
            'datetime-local': 'calendar',
            time: 'clock',
            search: 'magnifying-glass'
        };

        let { icon = '', iconPos = 'left' } = input.dataset;
        let dataType = input.dataset.type || null;

        if (inputIcons[type] || icon) {
            type = dataType ? dataType : type;
            let iconNames = icon ? icon : inputIcons[type];
            let dataImg = input.dataset.img;

            // use img instead of icon
            if(dataImg){
                let alt = dataImg.split('/').slice(-1)[0].split('.')[0];
                let imgEl = 
                `<span class="icn-wrp img-wrp"><img class="img-inline" data-csp-src="${dataImg}" alt="${alt}"></span>`;
                input.insertAdjacentHTML('beforebegin', imgEl);

            }else {

                // remove data att
                input.removeAttribute('data-icon');
                wrap.classList.add('input-wrap-icon');
    

                let classPicker = isPicker ? 'icn-input-picker' : '';
    
                if (type === 'select-one' || type === 'date' || type === 'time') iconPos = 'right';
                let injectPos = iconPos === 'left' ? 'beforebegin' : 'afterend';
    
                let iconArr = iconNames.split(' ');
                let wrapClass = iconArr.length > 1 ? 'icn-wrp-multi' : '';
                let iconWrp = `<span class="icn-wrp icn-wrp ${wrapClass} ${classPicker} icn-pos-${iconPos} " data-icon="${iconNames}" ></span>`;
    
                input.insertAdjacentHTML(injectPos, iconWrp);
            }

        }

    }

    enhanceColorInputs();

    // password fields
    enhancePasswordFields();

    // range fields
    enhanceRangeInputs();

    // enhance number field mouse controls
    enhanceNumberFields();

    // add tools to textareas
    enhanceTextareas();

    // file inputs
    enhanceFileinputs();

    // add tooltips or info boxes
    addToolTips();
    addInfos();

}

function addUI_elements(){

    let uiEls = document.querySelectorAll('[data-ui]');

    uiEls.forEach(el=>{

        let {ui} = el.dataset;
        let html = '';
        let classes = ['input-wrap-ui', `input-wrap-ui-${ui}`];

        if(ui==='reset'){
            html = `<button class="btn-default btn-neg wdt-100 txt-cnt" id="btnReset" type="button" data-icon="arrow-path"
            data-icon-pos="left">Reset
            settings</button>`;
        }

        else if(ui==='dark' || ui==='darkmode'){

            html = `<label><input type="checkbox" data-icon="sun moon" id="inputDarkmode" name="darkmode">Darkmode</label>`;
        }

        else if(ui==='lang' || ui==='lng' || ui==='language'){
            let langAtt = el.dataset.uiLang || el.dataset.uiLanguage || el.dataset.uiLng;
            let langs = langAtt? langAtt.split(' ').filter(Boolean).map(lng=>lng.toLowerCase()) : ['de' ];
            let className = el.dataset.mode ? el.dataset.mode : '';
            if(className) classes.push(className);

            el.classList.add('input-ui', `input-ui-${className}`);
            langs.forEach((lng, i)=>{
                let checked = i===0 ? 'checked' : '';
                html += ` <label ><input type="radio" name="lang" value="${lng}" ${checked}>${lng.toUpperCase()}</label>`;
            });
        }

        el.classList.add(...classes);
        el.removeAttribute('data-ui');
        el.insertAdjacentHTML("beforeend", html);

        
    });

}

function loadSamples(parent = null) {

    parent = document.querySelector(parent) || document.body;

    // check if global var exist
    if (typeof inputSampleData === 'object' || typeof window.inputSampleData === 'object') {
        let selects = parent.querySelectorAll('[data-options]');

        // add optiions
        selects.forEach(select => {

            let prop = select.dataset.options;
            let items = inputSampleData[prop];

            if(items){

                for(let key in items ){
                    let option = new Option(key, items[key]);
                    select.append(option);
    
                }
            }

        });
    }
}

function enhanceInputs({
    selector = 'input, select, textarea',

    parent = '[data-enhance-inputs]',

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
    loadSamples(parent);

    /**
     * add default UI element
     * e.g reset button, darkmode, print or language toggle
     */
    addUI_elements();

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

        }

        try {
            settingsStorage = localStorage.getItem(storageName);
            settingsCache = settingsStorage ? JSON.parse(settingsStorage) : {};

        } catch {
            console.warn('No valid settings JSON');
        }
    }

    let settings = {};
    let parentEl = document.querySelector(parent) ? document.querySelector(parent) : document.body;
    let inputs = parentEl.querySelectorAll(selector);

    // default button style 
    let buttons = parentEl.querySelectorAll('button');
    buttons.forEach(btn => {
        if (!btn.getAttribute('class')) {
            btn.classList.add('btn-default', 'wdt-100', 'txt-cnt');
        }
    });

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

        let settingsQuery = updateSettingsFromQuery(queryParams, settings);

        settingsCache = {
            ...settingsCache,
            ...settingsQuery
        };

        // take query cache for syncing
        if (!cacheToStorage) {
            syncInputsWithCache(settingsCache);
        }
    }

    // sync with cache - update inputs
    if (cacheToStorage && Object?.values(settingsCache).length) {

        syncInputsWithCache(settingsCache);
    }

    settings = getSettingValueFromInputs(inputs, settings);

    // include strorage name
    if(cacheToStorage) {
        settings.storageName = storageName;
    }

    // bind input events
    bindSettingUpdates(inputs, settings, storageName, cacheToUrl);

    // bind reset btn
    bindResetBtn(settings, storageName);

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
            el.classList.remove('enhance-inputs-init');
        });
    };

    // Wait until DOM ready
    window.addEventListener('DOMContentLoaded', async () => {
        await spritePromise;
        window.dispatchEvent(new Event('enhanceReady'));
        parentEl.classList.add('enhance-inputs-ready');
        showEnhanced();
    });

    return settings;

}

// enhance inputs ready
let enhanceInputsReady = new Event('enhanceReady');

function enhanceInputsAutoInit() {
    const inputWrap = document.querySelector('[data-enhance-inputs]');
    let enhanceInputsSettings = {};

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

        /**
         * get body bg color
         * for input background fills
         */
        let bodyColor = window.getComputedStyle(document.body).backgroundColor;
        bodyColor = (bodyColor==='rgba(0, 0, 0, 0)' || bodyColor==='transparent') ? 'rgb(255, 255, 255)': bodyColor;
        document.documentElement.style.setProperty('--color-background', bodyColor);

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

        enhanceDetailsAutoInit();

    }

    return enhanceInputsSettings;
}

// Browser global
if (typeof window !== 'undefined') {
    window.enhanceInputs = enhanceInputs;
    window.injectIcons = injectIcons;
    window.injectIconSpriteMap = injectIconSpriteMap;

    window.saveSettingsToLocalStorage = saveSettingsToLocalStorage;

    // addons
    window.getZipUrl = getZipUrl;
    window.enhanceDetails = enhanceDetails;

    // Initialize automatically
    const settingsInputs = enhanceInputsAutoInit();

    // Make settings globally accessible
    window.enhanceInputsSettings = settingsInputs;

}

export { PI, abs, acos, asin, atan, atan2, ceil, cos, enhanceDetails, enhanceInputs, enhanceInputsAutoInit, enhanceInputsReady, exp, floor, hypot, log, max, min, pow, random, round, saveSettingsToLocalStorage, sin, sqrt, tan };
