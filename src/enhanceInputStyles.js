//import {inputIcons} from './enhanceInputStyles_icons.js';
import { enhanceTextarea } from './enhanceInputStyles_textarea.js';
import { enhanceSelects } from './enhanceInputStyles_select.js';
import { enhanceNumberFields } from './enhanceInputStyles_num.js';
import { enhanceTextFields } from './enhanceInputStyles_text.js';
import { enhanceRangeInputs } from './enhanceInputStyles_range.js';
import { enhanceFileinputs } from './enhanceInputStyles_file.js';

import { injectHeroIcons } from './injectIcons.js';
import { addToolTips } from './enhanceInputStyles_tooltips.js';


export async function enhanceInputStyles(inputs = []) {


    addIconAtts(inputs);
    //addIconAtts(inputs);

    // text fields
    enhanceTextFields();

    // file inputs
    enhanceFileinputs();

    //selects
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
        let inp = inputs[i]

        if(inp.dataset.icon) {
            //console.log('processed');
            continue
        }

        let nodeName = inp.nodeName.toLowerCase();
        let type = inp.type ? (inp.type === 'select-one' ? 'select' : inp.type ) : nodeName;
        //let isSelect = type === 'select-one' || type === 'select-multiple';

        let dataType = inp.dataset.type || null;
    
        if (type === 'checkbox') {


            inp.dataset.icon = dataType === 'checkbox-switch' ? 'checkbox-switch checkbox-switch-checked' : 'checkbox checkbox-checked';
        } 
        else if (type === 'radio') {
            inp.dataset.icon = 'radio radio-checked'
        }

        else if (type === 'select') {
            inp.dataset.icon = 'chevron-down'
        }
        else if (type === 'date') {
            inp.dataset.icon = 'calendar'
        }
        else if (type === 'time') {
            inp.dataset.icon = 'clock'
        }


        else if (type === 'search') {
            inp.dataset.icon = 'magnifying-glass'
            //inp.dataset.iconPos = 'right'
        }

    }
}




















export function enhanceInputStyles_old(inputs = []) {

    //console.log(inputIcons);

    //let inputs = document.querySelectorAll(selector);

    for (let i = 0; i < inputs.length; i++) {
        let inp = inputs[i];
        let type = inp.type ? inp.type : inp.nodeName.toLowerCase();
        let isSelect = type === 'select-one' || type === 'select-multiple'


        let parent = inp.parentNode;
        let needsWrapping =
            parent.nodeName.toLowerCase() === "label" ? false : true;

        let style = window.getComputedStyle(inp)
        let { marginLeft, marginRight } = style;

        //already processed
        if (parent.classList.contains('input-wrap')) continue
        if (parent.querySelector('svg')) continue

        // wrap inputs
        if (needsWrapping) {
            let label = inp.previousElementSibling;
            label = label.nodeName.toLowerCase() === "label" ? label : "";

            let sibling = inp.nextSibling;
            parent = label ? label : document.createElement("span");

            if (label) {
                label.insertBefore(inp, label.childNodes[0]);
            } else {
                inp.parentNode.insertBefore(parent, parent.children[0]);
            }
            parent.append(inp, sibling);
        }


        parent.classList.add("input-wrap");

        let iconWrap, icons;

        iconWrap = document.createElement("span");
        iconWrap.classList.add("input-icon-wrap");
        parent.insertBefore(iconWrap, parent.children[0]);

        iconWrap.style.marginLeft = parseFloat(marginLeft) - 1 + 'px';
        iconWrap.style.marginRight = parseFloat(marginRight) - 1 + 'px';;


        switch (type) {
            case "checkbox":
                icons = addinputIcons([
                    inputIcons["checkbox"],
                    inputIcons["checkboxChecked"]
                ]);
                //append
                iconWrap.append(...icons);
                break;

            case "radio":
                icons = addinputIcons([
                    inputIcons["radio"],
                    inputIcons["radioChecked"]
                ]);
                //append
                iconWrap.append(...icons);
                break;

            default:
            // input
        }
    }

    //selects
    enhanceSelects();


    // enhance number field mouse controls
    enhanceNumberFields();

    // add tools to textareas
    enhanceTextarea();

}



function parseSvgIcon(markup) {
    let svg = new DOMParser()
        .parseFromString(markup, "text/html")
        .querySelector("svg");
    svg.removeAttribute("xmlns");
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    return svg;
}

function addinputIcons(iconNames = [], inputIcons = {}) {
    let icons = [];
    iconNames.forEach((iconName, i) => {
        let iconMarkup;

        // take svg markup or retrieve via feather object
        if (typeof inputIcons == "object" && !iconName.includes("<svg")) {
            iconMarkup = inputIcons.icons[iconName].toSvg();
        } else {
            iconMarkup = iconName;
        }
        let icon = parseSvgIcon(iconMarkup);
        icon.classList.add("feather-input-icon", `feather-input-icon${i + 1}`);
        icons.push(icon);
    });
    return icons;
}




