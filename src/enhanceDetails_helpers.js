export const summaryIcons = {
    'arrow-right': `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`,
    'chevron': `<svg stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" ><path d="m8.3 4.5 7.5 7.5-7.5 7.5" /></svg>`,
    'plus':`<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>`,
    'plusMinus':`<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4.5v15m7.5-7.5h-15" /><path d="M5 12h14" /></svg>`,
    'question': `<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" style="stroke-width:var(--icn-stroke-width, 2px)" stroke-linejoin="round" d="M21 12a1 1 0 01-18 0 1 1 0 0118 0m-11.5-3.5c.72-.72 1.52-1.12 2.48-1.12 1.6 0 2.72 .96 2.72 2 0 2.16-2.72 1.76-2.72 3.92m-.48 2.7h1v1h-1z" /></svg>`
}




/**
 * helpers
 */
export function getDetailsCSSOptions(el) {
    let els = ['details', 'summary'];
    let options = {
        right: false,
        round: false,
        plus: false,
        icon: '',
        type: ''
    }

    let hasOptions = false;
    if (!el) return {}


    let classList = [...el.classList];

    classList.forEach(cl => {
        let preArr = cl.split('-')
        let prop = preArr[1];
        let val = preArr[preArr.length - 1];

        if (els.includes(preArr[0])) {
            if (options.hasOwnProperty(prop)) {
                if(prop===val) {
                    options[prop] = true;
                }else{
                    options[prop] = val;
                }
                hasOptions = true;
            }
        }
    })

    //console.log(options);
    
    return hasOptions ? options : {};
}


export function replaceUmlauts(str) {
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
export function textToAnchorUrl(text) {
    text = replaceUmlauts(text);
    let anchorId = text.trim().toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')

    //prefix numeric anchor ids
    if (!isNaN(anchorId.substr(0, 1))) anchorId = 'a-' + anchorId;
    return anchorId;
}