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
        let value = type==='number' && !inp.value ? 0 : inp.value;

        if(!prop){
            return;
        }

        // never save passwords
        if (type === 'password') {
            settings[prop] = '';

            return;
        }

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

            let isNum = !isNaN(value) && value!=='';

            if(type!=='password'){
                settings[prop] = isNum ? +value : (inp.value);
            }
        }

        return settings;

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
    function bindSettingUpdates(inputs, settings = {}, storageName = 'settings', toQuery=false) {

        inputs.forEach((inp) => {

            // prevent adding multiple events
            if (!inp.classList.contains('input-active')) {
                inp.addEventListener("input", (e) => {

                    getSettingValueFromInput(inp, settings);

                    // update localStorage
                    saveSettingsToLocalStorage(settings, storageName);

                    if(toQuery){

                        updateQueryParams(settings);
                    
                    }

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
        let btnsReset = document.querySelectorAll('#btnReset, .btnReset');

        btnsReset.forEach(btn=>{
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
            input.value = newVal>= min ?  newVal : min;

            upDateSynced(syncInput, input);
        });

        btnPlus.addEventListener('click', e => {
            let newVal = +(+input.value + step).toFixed(12);
            input.value = newVal<=max ? newVal : max;
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
</span>`    ;

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

    function enhanceFileinputs(selector = '[data-enhance-inputs]', labelFileBtn = "Upload File", labelFileBtnDrop="Drop File") {

        let inputs = document.querySelectorAll(`${selector} input[type=file]`);

        for (let i = 0, l = inputs.length; l&& i < l; i++) {
            let input = inputs[i];
            let wrap = input.closest(".input-wrap-file");

            // skip for textarea toolbars
            let hasHeader =  input.closest('.input-wrap-textarea-header');
            if(hasHeader) continue

            if(!wrap){
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
        if (!dropArea || dropArea.classList.contains('droparea-active')) return;

        // if input is in drop area or in parent element
        inputFile = inputFile ? inputFile : dropArea.querySelector("input[type=file]");

        let accepted = inputFile.accept ? inputFile.accept.split(',').filter(Boolean).map(type=>type.trim() ) : ['.txt', '.svg'];

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
                }else {
                    console.warn('File type not allowed', type, ext, accepted);
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
        let hasLabelPrev = !hasLabelWrap ? prevSibling.nodeName.toLowerCase() === 'label' : false;

        let label = hasLabelWrap ? wrap : (hasLabelPrev ? prevSibling : null);

        if (label) {
            label.classList.add('label-textarea');
        }

        let accept = el.getAttribute('accept') || '.txt,.svg';

        // create header
        header = document.createElement('header');
        header.classList.add(classWrapHeader);
        wrap.append(header);

        // add label to toolbar
        if (hasLabelWrap) {
            let labelSpan = wrap.querySelector('.label-span');
            if (labelSpan) header.append(labelSpan);
        }

        // file name for downloads
        let filename = el.dataset.file || 'output.txt';
        let dataTools = el.dataset.tools;
        let tools = dataTools ? dataTools.split(' ') : [];

        if(!tools.length) return;

        let html = `<div class="${classWrapToolbar}">`;

        // map to icon names
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
                html += `<span class="textarea-toolbar-span textarea-toolbar-span-size usr-slc-non" title="${tool}"></span>`;
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

            if (type === 'upload') {

                let fileInput = parent.querySelector('input[type=file]');
                let textarea = parent.querySelector('textarea');

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
                            console.log('clipboard');
                            navigator.clipboard.writeText(text);

                          }else {
                            console.log('in iframe');
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

                });

                btn.classList.add('input-active');
            }

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

    async function injectSpriteSheet(embedSprite = true, iconFile = "iconSprite_inputs.svg") {

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

                    let symbols = svgDom.querySelectorAll('symbol');
                    symbols.forEach(symbol => {
                        if (document.getElementById(symbol.id)) {
                            symbol.remove();
                        }
                        // move to existing SVG
                        svgPrev.append(symbol);
                    });
                    svgDom = svgPrev;
                }

                let styled = svgDom.querySelectorAll('[data-style]');
                styled.forEach(el => {
                    let style = el.dataset.style;
                    el.removeAttribute('data-style');
                    el.style.cssText = style;
                });

                spriteWrapper.append(svgDom);

            }
        }

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
        let iconIDs = el.dataset.icon.split(' ');

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
                let vB = symbol ? symbol.getAttribute('viewBox') : (viewBoxLookup[iconID] ? viewBoxLookup[iconID] : '0 0 24 24');
                iconMarkup += `<svg class="icn-svg icn-${iconID} ${posClass}  icn-svg-${i}" viewBox="${vB}"><use  href="${ref}"/></svg>`;

            }
        }
        // single icon
        else {

            let vB = symbol ? symbol.getAttribute('viewBox') : '0 0 24 24';
            let ref = useRefs[0];
            iconMarkup = `<svg class="icn-svg icn-${iconID} ${posClass}" viewBox="${vB}"><use  href="${ref}"/></svg>`;

        }

        if (!wrap) iconMarkup = `<span class="icn-wrp icn-wrp-${iconID} icn-wrp-${iconPosition}">${iconMarkup}</span>`;

        // add class to indicate injection
        el.insertAdjacentHTML(pos, iconMarkup);
        el.classList.add('icn-inj');

    }

    /**
     * append spritemap for visualization
     */
    function injectIconSpriteMap() {

        let spriteMapEl = document.getElementById('spriteMap');
        if (!spriteMapEl) return;

        let spriteWrap = document.querySelector('.svgAssets');
        let symbols = spriteWrap.querySelectorAll('symbol');

        spriteMapEl.classList.add('spritemap', 'grd', 'grd-3', 'grd-md-8');

        symbols.forEach(symbol => {

            let col = document.createElement('div');
            col.classList.add('col');

            let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', symbol.getAttribute('viewBox'));
            svg.classList.add('icn-svg');

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

    function addToolTips(selector='[data-enhance-inputs] *[title]'){

        let titeleEls = document.querySelectorAll(`${selector}`);

        for (let i=0; i<titeleEls.length; i++){

            let el = titeleEls[i];
            if(el.classList.contains('has-tooltip')) continue;
            
            let isButton = el.nodeName.toLowerCase()==='button';
            let wrp = isButton ? el : el.closest('.input-wrap');

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

                input.parentNode.insertBefore(labelSpan, textNode);
                labelSpan.append(textNode);

                if (label.dataset.icon) {
                    label.classList.add('input-wrap-icon');
                }
            }

            if (!label) {
                input.parentNode.insertBefore(wrap, input);
                wrap.append(input);
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

        addToolTips();

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

    // get quer params
    const queryParams = Object.fromEntries(new URLSearchParams(document.location.search));

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

    function enhanceInputs({
        selector = 'input, select, textarea',

        parent = '[data-enhance-inputs]',

        cacheToUrl = true,
        // save settings to local storage
        cacheToStorage = true,
        storageName = 'settings',
        embedSprite = true,
        icons='inputs'
    } = {}) {

        // load only base icons or all
        let iconFile = icons!=='all' ? "iconSprite_inputs.svg" : "iconSprite.svg";
        
        // load sprite sheet
        let spritePromise = injectSpriteSheet(embedSprite, iconFile);

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

            }

            try{
                settingsStorage = localStorage.getItem(storageName);
                settingsCache = settingsStorage ? JSON.parse(settingsStorage) : {};

            } catch{
                console.warn('No valid settings JSON');
            }
        }

        let settings = {};
        let parentEl = document.querySelector(parent) ? document.querySelector(parent) : document.body;
        let inputs = parentEl.querySelectorAll(selector);

        // default button style 
        let buttons = parentEl.querySelectorAll('button');
        buttons.forEach(btn=>{
            if(!btn.getAttribute('class')){
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
        if (cacheToUrl && Object.values(queryParams).length) {

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

        // bind input events
        bindSettingUpdates(inputs, settings, storageName, cacheToUrl);

        // bind reset btn
        bindResetBtn(settings, storageName);

        /**
         * enhance styles by wrapping
         * and adding extra buttons
         */
        enhanceInputStyles(inputs);

        bindDarkmodeBtn();

        /**
         * add icons
         */

        injectIcons(embedSprite, spritePromise);

        // additional icons
        (async ()=>{
            await spritePromise;
            let spritePromise2 = injectSpriteSheet(embedSprite, 'iconSprite.svg' );
            injectIcons(embedSprite, spritePromise2);

        })();

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

    exports.PI = PI;
    exports.abs = abs;
    exports.acos = acos;
    exports.asin = asin;
    exports.atan = atan;
    exports.atan2 = atan2;
    exports.ceil = ceil;
    exports.cos = cos;
    exports.enhanceInputs = enhanceInputs;
    exports.enhanceInputsAutoInit = enhanceInputsAutoInit;
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
