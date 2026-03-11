export const summaryIcons = {
    'arrow-right': `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`,
    'chevron': `<svg stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" ><path d="m8.3 4.5 7.5 7.5-7.5 7.5" /></svg>`,
    'plus':`<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>`,
    'plusMinus':`<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4.5v15m7.5-7.5h-15" /><path d="M5 12h14" /></svg>`,
    'question': `<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" style="stroke-width:var(--icn-stroke-width, 2px)" stroke-linejoin="round" d="M21 12a9 9 0 01-18 0 9 9 0 0118 0m-12.1-4c0.9-.9 1.9-1.4 3.1-1.4 2 0 3.4 1.2 3.4 2.5 0 2.7-3.4 2.2-3.4 4.9m-.5 2.5h1v1h-1z" /></svg>`
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