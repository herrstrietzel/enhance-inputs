

function getCurrentScriptUrl() {
    try {

        /** 1. try performance API */
        let urlPerf = performance.getEntries()
            .slice(1)[0].name.split('/')
            .slice(0, -1)
            .join('/');

        //if(urlPerf) return urlPerf;

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


export async function injectHeroIcons(externalSprite = false) {

    /**
     * load icon asset sprite or use external svg
     */

    let scriptUrl = getCurrentScriptUrl();

    let iconSvg = `${scriptUrl}/iconSprite.svg`;

    if (!externalSprite) {
        let res = await fetch(iconSvg);
        if (res.ok) {
            let markup = await res.text()
            //console.log(markup);
            document.body.insertAdjacentHTML('beforeend', markup);
        }
    }


    let iconTargets = document.querySelectorAll('[data-icon]');

    for (let i = 0, l = iconTargets.length; l && i < l; i++) {

        let el = iconTargets[i];

        injectIcon(el, externalSprite);
        //el.classList.add('icon-active')
    }

}

export function injectIcon(el = null, externalSprite = false) {

    // get ID and position
    let iconIDs = el.dataset.icon.split(' ');


    // already processed or no icons – skip
    if (el.classList.contains('icn-inj') || !iconIDs.length) {
        return;
    }


    let useRefFile = externalSprite ? iconSvg : '';
    let useRefs = iconIDs.map(id => { return `${useRefFile}#${id}` });
    //console.log('useRefs', useRefs);


    let multiIcons = iconIDs.length > 1;
    let iconID = iconIDs[0];


    // if target is select or input
    let nodeName = el.nodeName.toLowerCase();
    let type = el.type ? el.type : nodeName;
    let isSelect = type === 'select-one' || type === 'select-multiple';
    //let isInput = nodeName === 'input' || nodeName === 'button' || isSelect;
    let isInput = nodeName === 'input' || isSelect;
    let hasPicker = isSelect || type === 'date' || type === 'time';
    let wrap = null;

    // assume right position if not defined
    let isCheckable = type === 'checkbox' || type === 'radio';
    let isBoxInput = type === 'select' || !isCheckable && type !== 'button' && type !== 'div';
    let iconPosition = el.dataset.iconPos ? el.dataset.iconPos : (isBoxInput ? 'right' : 'left');


    let hasToolbar = el.closest('.toolbar-wrap');
    //console.log('hasToolbar', hasToolbar);

    // wrap elements

    if (isInput && !hasToolbar) {
        type = isSelect ? 'select' : type;
        el.classList.add(`icn-input`, `icn-input-${type}`, 'icn-inj');

        wrap = document.createElement('div')
        wrap.classList.add(`icn-wrp-input`, `icn-wrp-${type}`)

        if (hasPicker) {
            wrap.classList.add(`icn-wrp-picker`);
            el.classList.add(`icn-input-picker`);
        }

        if (isBoxInput) {
            wrap.classList.add(`input-wrap`, `input-wrap-boxed`);
        }

        el.parentNode.insertBefore(wrap, el);
        wrap.append(el);
        el = wrap
    }



    // find symbol
    let symbol = !externalSprite ? document.getElementById(iconID) : null;
    let pos = iconPosition === 'left' ? 'afterbegin' : 'beforeend';
    let posClass = iconPosition === 'left' ? 'icn-svg-left' : 'icn-svg-right';
    let posClassWrp = iconPosition === 'left' ? 'icn-wrp-multi-left' : 'icn-wrp-multi-right';
    let classPicker = hasPicker ? `icn-picker icn-box` : (isBoxInput ? 'icn-box' : '');


    // multiple icons
    if (multiIcons) {

        let iconWrp = `<div class="icn-wrp-multi icn-wrp-multi-${type} ${posClassWrp} ">`

        for (let i = 0, l = iconIDs.length; i < l; i++) {
            let ref = useRefs[i];
            let vB = symbol ? symbol.getAttribute('viewBox') : '0 0 24 24';
            iconWrp += `<svg class="icn-svg icn-${iconID} ${posClass} ${classPicker} icn-svg-${i}" viewBox="${vB}"><use  href="${ref}"/></svg>`;

        }
        iconWrp += '</div>';
        el.insertAdjacentHTML(pos, iconWrp)
        el.classList.add('icn-inj')


    }
    // single icon
    else {

        let vB = symbol ? symbol.getAttribute('viewBox') : '0 0 24 24';
        let ref = useRefs[0];

        let iconSVG = `<svg class="icn-svg icn-${iconID} ${posClass} ${classPicker}" viewBox="${vB}"><use  href="${ref}"/></svg>`;
        el.insertAdjacentHTML(pos, iconSVG)
        el.classList.add('icn-inj')


    }

}