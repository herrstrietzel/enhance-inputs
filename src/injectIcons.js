


import { getCurrentScriptUrl } from './getUrl';


export async function injectSpriteSheet(embedSprite = true, iconFile = "iconSprite_inputs.svg") {

    /**
     * load icon asset sprite or use external svg
     */
    let scriptUrl = getCurrentScriptUrl();
    let iconSpriteSVG = `${scriptUrl}/${iconFile}`;

    if (embedSprite) {
        let spriteWrapper = document.querySelector('.svgAssets');
        let spriteSrc = '';
        let sameSource = false;
        let hasWrapper = spriteWrapper ? true : false


        if (spriteWrapper) {
            //console.log('spriteWrapper', spriteWrapper);
            spriteSrc = spriteWrapper.dataset.src;
            sameSource = iconFile === spriteWrapper.dataset.src

            if (sameSource) {
                //console.log('skip');
                return;
            }
        }


        // add wrapper
        if (!hasWrapper) {
            spriteWrapper = document.createElement('div')
            spriteWrapper.dataset.src = iconFile;
            spriteWrapper.classList.add('svgAssets', 'sr-only');
            document.body.append(spriteWrapper)
        }

        // add icons
        let res = await fetch(iconSpriteSVG);
        if (res.ok) {
            let markup = await res.text()

            // reconvert inline styles to circumvent CSP issues
            markup = markup.replaceAll('style="', 'data-style="');
            let svgDom = new DOMParser().parseFromString(markup, 'text/html').querySelector('svg')

            // when other icons are added - check for duplicates
            if (hasWrapper) {
                let svgPrev = spriteWrapper.querySelector('svg')
                //console.log('deduplicate');
                let symbols = svgDom.querySelectorAll('symbol');
                symbols.forEach(symbol => {
                    if (document.getElementById(symbol.id)) {
                        symbol.remove()
                    }
                    // move to existing SVG
                    svgPrev.append(symbol)
                })
                svgDom = svgPrev
            }



            let styled = svgDom.querySelectorAll('[data-style]');
            styled.forEach(el => {
                let style = el.dataset.style;
                el.removeAttribute('data-style')
                el.style.cssText = style;
            })
            //console.log(svgDom);
            spriteWrapper.append(svgDom);

            //let svgComplete = new XMLSerializer().serializeToString(svgDom)
            //console.log('svgComplete', svgComplete);
            //spriteWrapper.insertAdjacentHTML('beforeend', markup);
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



/**
 * append spritemap for visualization
 */
export function injectIconSpriteMap() {

    //inject spritemap - only for testing
    let spriteMapEl = document.getElementById('spriteMap');
    if (!spriteMapEl) return;

    let spriteWrap = document.querySelector('.svgAssets');
    let symbols = spriteWrap.querySelectorAll('symbol');

    //spriteMapEl = document.createElement('div')
    spriteMapEl.classList.add('spritemap', 'grd', 'grd-3', 'grd-md-8')

    symbols.forEach(symbol => {

        let col = document.createElement('div')
        col.classList.add('col')

        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', symbol.getAttribute('viewBox'));
        svg.classList.add('icn-svg');

        let children = [...symbol.children];

        children.forEach(child => {
            let clone = child.cloneNode(true)
            svg.append(clone)
        })
        col.append(svg)
        col.insertAdjacentHTML('beforeend', `<p class="icon-label">${symbol.id}</p>`)
        spriteMapEl.append(col)

    })

    // document.body.append(spriteMap)

}
