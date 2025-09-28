(function (exports) {
    'use strict';

    const {
        abs, acos, asin, atan, atan2, ceil, cos, exp, floor,
        log, hypot, max, min, pow, random, round, sin, sqrt, tan, PI
    } = Math;

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
        let value = inp.value;

        if (type === 'checkbox') {
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
            let isNum = parseFloat(value).toString() === value;

            if(type!=='password'){
                settings[prop] = isNum ? +value : inp.value;
            }
        }

        return settings;

    }

    // custom event for settings update
    const settingsUpdate = new Event('settingsChange');

    // add event listeners
    function bindSettingUpdates(inputs, settings = {}, storageName = 'settings') {

        inputs.forEach((inp) => {

            // prevent adding multiple events
            if (!inp.classList.contains('input-active')) {
                inp.addEventListener("input", (e) => {

                    getSettingValueFromInput(inp, settings);

                    // update localStorage
                    saveSettingsToLocalStorage(settings, storageName);

                    // trigger custom event

                    document.dispatchEvent(settingsUpdate);

                });
                inp.classList.add('input-active');
            }
        });

    }

    /**
     * reset btn
     */
    function resetSettings(settings = {}) {

        if(settings.defaults) Object.assign(settings, settings.defaults);  
    }

    function bindResetBtn(settings = {}, storageName = 'settings') {
        let btnReset = document.getElementById('btnResetSettings');
        if (btnReset) {
            btnReset.addEventListener('click', e => {

                resetSettings(settings); 

                // delete local storage
                localStorage.removeItem(storageName);

                // update inputs
                setInputValueFromSettings(settings);

                // update localStorage
                saveSettingsToLocalStorage(settings, storageName);

                // trigger custom event
                document.dispatchEvent(settingsUpdate);

            });
        }
    }

    /**
     * enhance textareas
     */

    function enhanceTextarea() {

        let classWrap = 'input-wrap-textarea';
        let classWrapHeader = 'input-wrap-textarea-header';
        let classWrapToolbar = 'input-wrap-textarea-header-toolbar';

        addtextareaTools(classWrap, classWrapHeader, classWrapToolbar);

    }

    /**
     * add tools
     */

    function addtextareaTools(classWrap = '', classWrapHeader = '', classWrapToolbar = '') {
        let textareas = document.querySelectorAll('[data-tools]');

        for (let i = 0, len = textareas.length; i < len; i++) {
            let el = textareas[i];

            let parent = el.closest(`.${classWrap}`);
            if (parent) {
                continue;
            }

            el.spellcheck = false;

            // search for previous label
            let prevSibling = el.previousElementSibling;
            let label = prevSibling && prevSibling.nodeName.toLowerCase() === 'label' ? prevSibling : null;
            label.classList.add('label-textarea');
            let accept = el.getAttribute('accept');

            // create outer wrapper
            let wrap = document.createElement('div');
            wrap.classList.add(classWrap, 'input-wrap-boxed', 'input-wrap-wide');
            el.parentNode.insertBefore(wrap, el);
            el.classList.add('input-textarea', 'no-focus');

            // create header
            let header = document.createElement('header');
            header.classList.add(classWrapHeader);
            wrap.append(header);

            // add label
            if (label) header.append(label);

            // move textarea to wrap
            wrap.append(el);

            // file name for downloads
            let filename = el.dataset.file;

            let tools = el.dataset.tools.split(' ');
            let html = `<div class="${classWrapToolbar}">`;

            // map to hero icons
            let icons = {
                copy: 'square-2-stack',
                download: 'arrow-down-tray',
                upload: 'arrow-up-tray',
            };

            tools.forEach(tool => {

                if (tool !== 'size') {
                    html += `<button type="button" data-icon="${icons[tool]}" class="btn btn-non btn-toolbar btn-${tool}" title="${tool}" data-btn="${tool}"></button>`;
                }
                else if (tool == 'size') {
                    html += `<div  class="textarea-size usr-slc-non" title="${tool}"></div>`;
                }

                // add hidden inputs
                if (tool === 'download') {
                    html += `<a href="" class="sr-only link-download" download="${filename}"></div>`;
                }

                if (tool === 'upload') {
                    html += `<input type="file" class="sr-only input-file" accept="${accept}" >`;
                }
            });

            header.insertAdjacentHTML('beforeend', html);

            // add toolbar funcionality
            bindTextAreaToolbar(header, classWrap, classWrapHeader, classWrapToolbar);
        }
    }

    function bindTextAreaToolbar(header = null, classWrap = '', classWrapHeader = '', classWrapToolbar = '') {

        let btns = header.querySelectorAll('.btn-toolbar');

        // size indicator
        let textareaSizeIndicator = header.querySelector('.textarea-size');

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

        let textarea = textareaSizeIndicator.closest(`.${classWrap}`).querySelector('textarea');

        if (textarea) {
            textareaSizeIndicator.textContent = getTextareaByteSize(textarea);
            trackTextareaValue(textarea, textareaSizeIndicator);
        }

        btns.forEach(btn => {
            let type = btn.dataset.btn;
            let parent = btn.closest(`.${classWrap}`);

            if (type === 'upload') {

                let fileInput = parent.querySelector('input[type=file]');
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
            }

            btn.addEventListener('click', e => {
                let current = e.currentTarget;
                let parent = current.closest(`.${classWrap}`);
                let text = parent.querySelector('textarea').value;

                if (type === 'copy') {
                    navigator.clipboard.writeText(text);
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

            });
        });
    }

    function enhanceSelects(selector = ".enhanceInputs") {

        let selects = document.querySelectorAll(`${selector} select`);

        for (let i = 0; i < selects.length; i++) {

            let select = selects[i];
            if (select.classList.contains('.input-active')) {

                continue;
            }

            let options = [...select.options];

            options.forEach(option=>{
                option.classList.add('option');
            });

            select.onfocus = () => {
                select.classList.add('input-select-focus');
            };

            select.oninput = () => {
                select.classList.remove('input-select-focus');
            };

            select.onblur = () => {
                select.classList.remove('input-select-focus');
            };

        }

    }

    /**
     * add mouse controls
     * to number fields
     */
    function enhanceNumberFields(selector = '.enhanceInputs') {

        let numberFields = document.querySelectorAll(`${selector} input[type=number]`);

        for (let i = 0, len = numberFields.length; len && i < len; i++) {
            let input = numberFields[i];
            enhanceNumberField(input);

        }
    }

    function enhanceNumberField(input) {

        let wrap = input.closest(".input-wrap-number");
        if (wrap) return;

        let maxLen = input.max ? input.max.toString().length : 0;
        let stepLen = input.step ? input.step.toString().length : 0;
        let charLen = maxLen + stepLen;

        if (charLen) {

            input.classList.add(`input-number-${charLen}`);
        }

        wrap = document.createElement('div');
        wrap.classList.add('input-wrap', 'input-wrap-boxed', 'input-wrap-number');

        input.parentNode.insertBefore(wrap, input);
        wrap.append(input);

        // convert type number to text
        input.type = "text";

        input.title = "Use Mousewheel or arrow keys to change values";
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

        let min = input.min ? +input.min : Infinity;
        let max = input.max ? +input.max : Infinity;
        let step = input.step ? +input.step : 0.1;

        input.addEventListener("change", () => safeCalculation(input));

        let btnMinus = wrap.querySelector('.input-number-btn-minus');
        let btnPlus = wrap.querySelector('.input-number-btn-plus');

        btnMinus.addEventListener('click', e => {
            let newVal = +(+input.value - step).toFixed(12);
            input.value = newVal;

            upDateSynced(syncInput, input);
        });

        btnPlus.addEventListener('click', e => {
            let newVal = +(+input.value + step).toFixed(12);
            input.value = newVal;
            upDateSynced(syncInput, input);
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

    function enhanceTextFields(selector = '.enhanceInputs') {

        let inputs = document.querySelectorAll(`${selector} input[type=text]`);

        for (let i = 0, len = inputs.length; len && i < len; i++) {
            let input = inputs[i];
            enhanceTextField(input);
        }
    }

    function enhanceTextField(input){

            let wrap = input.closest(".input-wrap-text");
            if (wrap) return;

            wrap = document.createElement('div');
            wrap.classList.add('input-wrap', 'input-wrap-boxed', 'input-wrap-text');

            input.parentNode.insertBefore(wrap, input);
            wrap.append(input);

    }

    function enhanceRangeInputs(selector = '.enhanceInputs') {

        let inputs = document.querySelectorAll(`${selector} input[type=range].input-range-num, ${selector} input[data-type=range-number]`);

        for (let i = 0, len = inputs.length; len && i < len; i++) {
            let input = inputs[i];

            input.classList.add('input-range-num');
            enhanceRangeInput(input);

        }

    }

    function enhanceRangeInput(input) {

        let min = input.min ? +input.min : 0;
        let max = input.max ? +input.max : Infinity;
        let step = input.step ? +input.step : 0.1;
        let value = input.value ? +input.value : 0;

        let wrap = input.closest(".input-wrap-range");
        if (wrap) return;

        let charLen = 5;

        {

            input.classList.add(`input-number-${charLen}`);
        }

        wrap = document.createElement('div');
        wrap.classList.add('input-wrap', 'input-wrap-range', 'input-wrap-range-num');

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

        input.parentNode.insertBefore(wrap, input);
        wrap.append(input);

        wrap.insertAdjacentHTML('beforeend', inputNumberMarkup);

        let inputNumber = wrap.querySelector('.input-number');
        let sync = input;
        bindNumberEvents(inputNumber, sync);

    }

    function enhanceFileinputs(selector = '.enhanceInputs', labelFileBtn = "Upload File", labelFileBtnDrop="Drop File") {

        let inputs = document.querySelectorAll(`${selector} input[type=file]`);

        for (let i = 0, l = inputs.length; i < l; i++) {
            let input = inputs[i];
            let wrap = input.closest(".input-wrap-file");
            if (wrap) continue;

            wrap = document.createElement("div");
            wrap.classList.add('input-wrap', '--input-wrap-boxed', 'input-wrap-file');

            input.parentNode.insertBefore(wrap, input);
            wrap.append(input);

            // hide default btn
            input.classList.add("sr-only");

            // add new UI elements
            let fileUiHTML = `<div class="btn-default btn-file" type="button" aria-hidden="true" data-icon="arrow-up-tray" data-icon-pos="left">
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

        btnFile.addEventListener("click", (e) => {
            let inputFile = wrap.querySelector("input[type=file]");
            inputFile.click();
        });

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
        if (!dropArea || dropArea.classList.contains('input-active')) return;

        // if input is in drop area or in parent element
        inputFile = inputFile ? inputFile : dropArea.querySelector("input[type=file]");

        let accepted = inputFile.accept ? inputFile.accept.split(',').filter(Boolean).map(type=>type.trim() ) : [];

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
            if(fileInfo) fileInfo.textContent='';

            let files = e.dataTransfer.files;

            let filesFiltered=new DataTransfer();

            for(let i=0,l=files.length; i<l;i++){
                let file=files[i];
                let type = file.type ? '.'+file.type.split('/').slice(-1) : null;
                // get type from extension
                let ext = '.'+file.name.split('.').slice(-1);

                if(accepted.includes(type) || accepted.includes(ext)){
                    filesFiltered.items.add(file);
                }

            }

            if (filesFiltered.files.length > 0) {

                inputFile.files = filesFiltered.files;

                // Trigger a change event on the file input to notify any listeners
                let changeEvent = new Event("input");
                inputFile.dispatchEvent(changeEvent);
            }else {
                if(fileInfo) fileInfo.textContent='Invalid filetype';
            }
        });

        dropArea.classList.add('input-active');
    }

    function getCurrentScriptUrl() {
        try {

            /** 1. try performance API */
            let urlPerf = performance.getEntries()
                .slice(1)[0].name.split('/')
                .slice(0, -1)
                .join('/');

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

    async function injectHeroIcons(externalSprite = false) {

        /**
         * load icon asset sprite or use external svg
         */

        let scriptUrl = getCurrentScriptUrl();

        let iconSvg = `${scriptUrl}/iconSprite.svg`;

        if (!externalSprite) {
            let res = await fetch(iconSvg);
            if (res.ok) {
                let markup = await res.text();

                document.body.insertAdjacentHTML('beforeend', markup);
            }
        }

        let iconTargets = document.querySelectorAll('[data-icon]');

        for (let i = 0, l = iconTargets.length; l && i < l; i++) {

            let el = iconTargets[i];

            injectIcon(el, externalSprite);

        }

    }

    function injectIcon(el = null, externalSprite = false) {

        // get ID and position
        let iconIDs = el.dataset.icon.split(' ');

        // already processed or no icons – skip
        if (el.classList.contains('icn-inj') || !iconIDs.length) {
            return;
        }

        let useRefFile = externalSprite ? iconSvg : '';
        let useRefs = iconIDs.map(id => { return `${useRefFile}#${id}` });

        let multiIcons = iconIDs.length > 1;
        let iconID = iconIDs[0];

        // if target is select or input
        let nodeName = el.nodeName.toLowerCase();
        let type = el.type ? el.type : nodeName;
        let isSelect = type === 'select-one' || type === 'select-multiple';

        let isInput = nodeName === 'input' || isSelect;
        let hasPicker = isSelect || type === 'date' || type === 'time';
        let wrap = null;

        // assume right position if not defined
        let isCheckable = type === 'checkbox' || type === 'radio';
        let isBoxInput = type === 'select' || !isCheckable && type !== 'button' && type !== 'div';
        let iconPosition = el.dataset.iconPos ? el.dataset.iconPos : (isBoxInput ? 'right' : 'left');

        let hasToolbar = el.closest('.toolbar-wrap');

        // wrap elements

        if (isInput && !hasToolbar) {
            type = isSelect ? 'select' : type;
            el.classList.add(`icn-input`, `icn-input-${type}`, 'icn-inj');

            wrap = document.createElement('div');
            wrap.classList.add(`icn-wrp-input`, `icn-wrp-${type}`);

            if (hasPicker) {
                wrap.classList.add(`icn-wrp-picker`);
                el.classList.add(`icn-input-picker`);
            }

            if (isBoxInput) {
                wrap.classList.add(`input-wrap`, `input-wrap-boxed`);
            }

            el.parentNode.insertBefore(wrap, el);
            wrap.append(el);
            el = wrap;
        }

        // find symbol
        let symbol = !externalSprite ? document.getElementById(iconID) : null;
        let pos = iconPosition === 'left' ? 'afterbegin' : 'beforeend';
        let posClass = iconPosition === 'left' ? 'icn-svg-left' : 'icn-svg-right';
        let posClassWrp = iconPosition === 'left' ? 'icn-wrp-multi-left' : 'icn-wrp-multi-right';
        let classPicker = hasPicker ? `icn-picker icn-box` : (isBoxInput ? 'icn-box' : '');

        // multiple icons
        if (multiIcons) {

            let iconWrp = `<div class="icn-wrp-multi icn-wrp-multi-${type} ${posClassWrp} ">`;

            for (let i = 0, l = iconIDs.length; i < l; i++) {
                let ref = useRefs[i];
                let vB = symbol ? symbol.getAttribute('viewBox') : '0 0 24 24';
                iconWrp += `<svg class="icn-svg icn-${iconID} ${posClass} ${classPicker} icn-svg-${i}" viewBox="${vB}"><use  href="${ref}"/></svg>`;

            }
            iconWrp += '</div>';
            el.insertAdjacentHTML(pos, iconWrp);
            el.classList.add('icn-inj');

        }
        // single icon
        else {

            let vB = symbol ? symbol.getAttribute('viewBox') : '0 0 24 24';
            let ref = useRefs[0];

            let iconSVG = `<svg class="icn-svg icn-${iconID} ${posClass} ${classPicker}" viewBox="${vB}"><use  href="${ref}"/></svg>`;
            el.insertAdjacentHTML(pos, iconSVG);
            el.classList.add('icn-inj');

        }

    }

    function addToolTips(selector='.enhanceInputs [title]'){

        let titeleEls = document.querySelectorAll(`${selector}`);

        for (let i=0; i<titeleEls.length; i++){

            let el = titeleEls[i];
            if(el.classList.contains('has-tooltip')) continue;
            
            let wrp = el.closest('.input-wrap');

            if(!wrp ){
                wrp = document.createElement('div');
                wrp.classList.add('input-wrap', 'input-wrap-inline');
                el.parentNode.insertBefore(wrp, el);
                wrp.append(el);
            }

            let tooltip = 
            `<div class="tooltip tooltip-hidden">
        ${el.title}
        </div>`;

            el.classList.add('has-tooltip');
            wrp.insertAdjacentHTML('beforeend', tooltip);

        }

    }

    async function enhanceInputStyles(inputs = []) {

        addIconAtts(inputs);

        // text fields
        enhanceTextFields();

        // file inputs
        enhanceFileinputs();

        enhanceSelects();

        // range fields
        enhanceRangeInputs();

        // enhance number field mouse controls
        enhanceNumberFields();

        // add tools to textareas
        enhanceTextarea();

        let useExternalSprite = false;
        injectHeroIcons(useExternalSprite);

        addToolTips();

    }

    /**
     * prepare for icon incetion
     */
    function addIconAtts(inputs = []) {

        for (let i = 0, l = inputs.length; i < l; i++) {
            let inp = inputs[i];

            if(inp.dataset.icon) {

                continue
            }

            let nodeName = inp.nodeName.toLowerCase();
            let type = inp.type ? (inp.type === 'select-one' ? 'select' : inp.type ) : nodeName;

            let dataType = inp.dataset.type || null;
        
            if (type === 'checkbox') {

                inp.dataset.icon = dataType === 'checkbox-switch' ? 'checkbox-switch checkbox-switch-checked' : 'checkbox checkbox-checked';
            } 
            else if (type === 'radio') {
                inp.dataset.icon = 'radio radio-checked';
            }

            else if (type === 'select') {
                inp.dataset.icon = 'chevron-down';
            }
            else if (type === 'date') {
                inp.dataset.icon = 'calendar';
            }
            else if (type === 'time') {
                inp.dataset.icon = 'clock';
            }

            else if (type === 'search') {
                inp.dataset.icon = 'magnifying-glass';

            }

        }
    }

    function enhanceInputs({
        selector = 'input',
        parent = 'main',
        storageName = 'settings'
    } = {}) {

        let settings = {};
        let settingsStorage = localStorage.getItem(storageName);
        let settingsCache = settingsStorage ? JSON.parse(settingsStorage) : null;
        let parentEl = document.querySelector(parent) ? document.querySelector(parent) : document;
        let inputs = parentEl.querySelectorAll(selector);

        /**
         * check defaults 
         * as specified in HTML
         */
        let defaults = settings.defaults ? settings.defaults : getSettingValueFromInputs(inputs);

        // save defaults to settings object for resetting
        settings.defaults = defaults;

        

        // sync with cache
        if (settingsCache) {
            syncInputsWithCache(settingsCache);
        }

        settings = getSettingValueFromInputs(inputs, settings);

        // bind input events
        bindSettingUpdates(inputs, settings, storageName);

        // bind reset btn

        bindResetBtn(settings, storageName);

        // enhance styles
        inputs = document.querySelectorAll('input, select, textarea');
        enhanceInputStyles(inputs);

        return settings;

    }

    // Browser global
    if (typeof window !== 'undefined') {
        window.enhanceInputs = enhanceInputs;
    }

    exports.PI = PI;
    exports.abs = abs;
    exports.acos = acos;
    exports.asin = asin;
    exports.atan = atan;
    exports.atan2 = atan2;
    exports.ceil = ceil;
    exports.cos = cos;
    exports.enhanceInputs = enhanceInputs;
    exports.exp = exp;
    exports.floor = floor;
    exports.hypot = hypot;
    exports.log = log;
    exports.max = max;
    exports.min = min;
    exports.pow = pow;
    exports.random = random;
    exports.round = round;
    exports.sin = sin;
    exports.sqrt = sqrt;
    exports.tan = tan;

})(this.enhanceInputs = this.enhanceInputs || {});
