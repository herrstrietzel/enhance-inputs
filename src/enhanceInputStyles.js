//import {inputIcons} from './enhanceInputStyles_icons.js';
import { enhanceRangeInputs } from './enhanceInputStyles_range.js';
import { enhancePasswordFields } from './enhanceInputStyles_password.js';
import { enhanceColorInputs } from './enhanceInputStyles_color.js';

import { enhanceTextareas } from './enhanceInputStyles_textarea.js';
//import { enhanceSelects } from './enhanceInputStyles_select.js';
import { enhanceNumberFields } from './enhanceInputStyles_num.js';
import { enhanceFileinputs } from './enhanceInputStyles_file.js';
import { injectIcons } from './injectIcons.js';
import { addToolTips } from './enhanceInputStyles_tooltips.js';

//import { enhanceTextLikeFields } from './enhanceInputStyles_textlike.js';
//import { enhanceDateAndTimeFields } from './enhanceInputStyles_time.js';
//import { enhanceCheckboxAndRadios } from './enhanceInputStyles_checkboxAndRadio.js';
//import { enhanceCheckboxAndRadio } from './enhanceInputStyles_checkboxAndRadio.js';


/**
 * wrap input elements
 * to add new functionality
 */
export async function enhanceInputStyles(inputs = []) {

    //let iconInputs = ['select', 'textarea', 'date', 'time'];
    let inputsInline = ['radio', 'checkbox', 'range', 'submit'];
    let classNameWrap = 'input-wrap';
    let classNameInput = 'input';


    for (let i = 0, l = inputs.length; l && i < l; i++) {

        let input = inputs[i];
        let nodeName = input.nodeName.toLowerCase();
        let type = input.type ? input.type : nodeName;
        let label = input.closest('label');
        //let labelClass = label ? 'labeled' : '';
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
            let labelSpan = document.createElement('span')
            labelSpan.classList.add('label-span', `label-span-${type}`);
            let textNode = [...label.childNodes].find(node => node.nodeType === 3 && node.textContent.trim());
            //console.log(textNode, label.childNodes);
            input.parentNode.insertBefore(labelSpan, textNode);
            labelSpan.append(textNode)

            if (label.dataset.icon) {
                label.classList.add('input-wrap-icon');
            }
        }

        if (!label) {
            input.parentNode.insertBefore(wrap, input);
            wrap.append(input)
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
        }

        let { icon = '', iconPos = 'left' } = input.dataset;
        let dataType = input.dataset.type || null;
        //let dataPos = input.dataset.iconPos || 'left';

        if (inputIcons[type] || icon) {
            type = dataType ? dataType : type
            let iconNames = icon ? icon : inputIcons[type];

            // remove data att
            input.removeAttribute('data-icon')
            wrap.classList.add('input-wrap-icon');

            //let classPicker = isPicker ? 'input-icon-picker' : '';
            let classPicker = isPicker ? 'icn-input-picker' : '';

            if (type === 'select-one' || type === 'date' || type === 'time') iconPos = 'right';
            let injectPos = iconPos === 'left' ? 'beforebegin' : 'afterend';

            let iconArr = iconNames.split(' ')
            let wrapClass = iconArr.length > 1 ? 'icn-wrp-multi' : '';
            let iconWrp = `<span class="icn-wrp icn-wrp ${wrapClass} ${classPicker} icn-pos-${iconPos} " data-icon="${iconNames}" ></span>`;

            input.insertAdjacentHTML(injectPos, iconWrp)

        }

    }

    //color fields
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


















