


import { getCurrentScriptUrl } from './getUrl';


export async function injectSpriteSheet(embedSprite = true, iconFile = "iconSprite_inputs.svg") {

    /**
     * load icon asset sprite or use external svg
     */
    let scriptUrl = getCurrentScriptUrl();
    let iconSpriteSVG = `${scriptUrl}/${iconFile}`;

    if (embedSprite) {
        let spriteWrapper = document.querySelector('.svgAssets');

        if (!spriteWrapper) {
            spriteWrapper = document.createElement('div')
            spriteWrapper.classList.add('svgAssets', 'sr-only');
            let res = await fetch(iconSpriteSVG);
            if (res.ok) {
                let markup = await res.text()
                //console.log(markup);
                spriteWrapper.insertAdjacentHTML('beforeend', markup);
                document.body.append(spriteWrapper)
            }
        }
    }

    return true;

}

export async function injectIcons(embedSprite = true, promise = false, iconFile = "iconSprite_inputs.svg", iconSpriteSVG = '') {

    let iconTargets = document.querySelectorAll('[data-icon]');


    if (!iconSpriteSVG) {
        let scriptUrl = getCurrentScriptUrl();
        iconSpriteSVG = `${scriptUrl}/${iconFile}`;
    }

    await promise;
    //console.log('promise', promise);

    for (let i = 0, l = iconTargets.length; l && i < l; i++) {

        let el = iconTargets[i];
        injectIcon(el, embedSprite, iconSpriteSVG);
    }

}


export function injectIcon(el = null, embedSprite = true, iconSvg = 'iconSprite_inputs.svg') {

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

    //let iconPosition = el.dataset.iconPos ? el.dataset.iconPos : (isBoxInput ? 'right' : 'left');
    let iconPosition = el.dataset.iconPos ? el.dataset.iconPos : 'left';
    let pos = iconPosition === 'left' ? 'afterbegin' : 'beforeend';
    let posClass = `icn-pos-${iconPosition}`


    // check if already wrapped
    let wrap = el.closest('.icn-wrp');
    let iconMarkup = ``

    // viewBox exceptions for external use refs
    let viewBoxLookup = {
        'checkbox-switch': '0 0 36 24',
    }

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
    el.insertAdjacentHTML(pos, iconMarkup)
    el.classList.add('icn-inj')


}

