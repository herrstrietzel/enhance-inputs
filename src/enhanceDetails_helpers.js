export const summaryIcons = {
    'arrow-right': `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`,
    'chevron': `<svg stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" ><path d="m8.3 4.5 7.5 7.5-7.5 7.5" /></svg>`
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