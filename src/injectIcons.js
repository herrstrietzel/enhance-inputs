


import { getCurrentScriptUrl } from './getUrl';
import { parseCSP_Atts } from './csp';



export async function injectSpriteSheet(embedSprite = true, iconFile = "iconSprite_inputs.svg", debug = false) {

    //console.log(icons_exclude);
    debug = false;

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
                //console.log('deduplicate', iconSpriteSVG);
                svgDom = svgPrev
            }

            /**
             * debug/dev function to remove icons
             */
            if (debug) {

                //useless icons
                let icons_exclude = [];

                /*
                let icons_exclude = [
                    'at-symbol',
                    'currency-',
                    'cpu-chip',
                    'check-badge',
                    'cake',
                    'cog',
                    'cog-6-tooth',
                    'cog-8-tooth',
                    'globe-',
                    'receipt-',
                    'rocket-launch',
                    'stop-circle',
                    'gif',
                    'gift-top',
                    'face-frown',
                    'calendar-days',
                    'briefcase',
                    'bookmark-square',
                    'banknotes',
                    'magnifying-glass-circle',
                    'funnel',
                    'building-storefront',
                    'bell-snooze',
                    'bars-4',
                    'face-smile',
                    'arrow-long-down',
                    'arrow-long-up',
                    'arrow-path-rounded-square',
                    'sparkles',
                    'clipboard-document-list',
                    'home-modern',
                    'hashtag',
                    'minus',
                    'minus-small',
                    'plus-small',
                    'plus',
                    'building-office-2',
                ];
                */


                /*
                aliases
                ellipsis-vertical => kebab
                square-2-stack = > copy
                */

                /*
                filled
                pencil,
                heart
                facebook
                */
                /*
                let improved = [
                    'pencil',
                    'filter',
                    'shopping-cart',
                    'square-3-stack-3d',
                    'wrench',
                    'shopping-cart',
                    'circle-stack',
                    'user-minus',
                    'user-plus',
                    'ticket',
                    'wrench-screwdriver',
                    '',
                ];
                */


                let symbols = svgDom.querySelectorAll('symbol');
                for (let i = 0, l = symbols.length; l && i < l; i++) {
                    let symbol = symbols[i];

                    let id = symbol.id;
                    let idPre = id.split('-');

                    // prefix exclude
                    if (idPre.length > 1) {
                        idPre = idPre[0] + '-';
                        //console.log('idPre', idPre);
                        if (icons_exclude.includes(idPre)) {
                            symbol.remove();
                            //console.log('idPre remove', id);
                            continue
                        }
                    }

                    let hasSymbol = document.getElementById(id)
                    let exclude = hasSymbol || icons_exclude.includes(id);
                    if (exclude) {
                        symbol.remove();
                        console.log('remove', id);
                        continue;
                    }

                    // append icon
                    svgDom.append(symbol)
                }


            }


            //console.log(svgDom);
            spriteWrapper.append(svgDom);

            // fix CSP styles – otherwise catched by CSP main helper
            let styled = svgDom.querySelectorAll('[data-style]');
            styled.forEach(el => {
                let style = el.dataset.style;
                el.removeAttribute('data-style')
                el.style.cssText = style;
            })



            // return filtered SVG sprite
            if (debug) {
                let svgComplete = new XMLSerializer().serializeToString(svgDom)
                console.log('svg sprite Complete', svgComplete);
            }
        }
    }

    /**
     * append spritemap 
     * only for visualization
     * if "#spriteMap" element is present
     */
    injectIconSpriteMap();
    //parseCSP_Atts();


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
    el.removeAttribute('data-icon')
    el.removeAttribute('data-icon-pos')
    el.classList.add('icn-inj')

}



/**
 * append spritemap for visualization
 * helps to find all available icons
 * or to edit certain icons
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

        let ns = 'http://www.w3.org/2000/svg';
        let svg = document.createElementNS(ns, 'svg');
        let viewBoxAtt = symbol.getAttribute('viewBox');
        let { width, height } = symbol.viewBox.baseVal;
        svg.setAttribute('data-id', symbol.id);
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('xmlns', ns);
        svg.setAttribute('viewBox', viewBoxAtt);
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
