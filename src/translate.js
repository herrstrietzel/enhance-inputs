
/**
* translate
**/
/*
export async function getTranslations(baseUrl='', src='translations.json'){

    baseUrl = !baseUrl ? getCurrentScriptUrl() : baseUrl;
    let res = await fetch(`${baseUrl}/${src}`);
    let translations = {}

    if(res.ok){
        translations = await res.json();
    }

    return translations;

}

let submitBtns = document.querySelectorAll('input[type=submit]');
if(submitBtns.length){
    submitBtns.forEach(inp=>{
        let valueArr = inp.value.split('||');
        if (currentLang == 'de') {
            inp.value = valueArr[0];
        }else{
            inp.value = valueArr[1] ? valueArr[1] : valueArr[0];
        }
    })
}
*/



export function translatePipeText(parentEl=null, currentLang='') {

    parentEl = parentEl ? parentEl : document.body;

    if(!currentLang){
         currentLang = new URL(document.location).searchParams.get('lng') ? new URL(document.location).searchParams.get('lng') : 'de';
    }

    let dataBlocks = parentEl.querySelectorAll('[data-lang]');
    dataBlocks.forEach(el=>{
        let lang = el.dataset.lang;
        if(lang!==currentLang) el.remove();
    })


    let elsToTranslate = parentEl ? textNodesInEl(parentEl) : [];
    if (elsToTranslate.length) {

        for (var i = 0; i < elsToTranslate.length; i++) {
            var node = elsToTranslate[i];
            let typeNode = node.nodeName
            if (node.nodeType === 3) {
                //console.log(node.nodeType, typeNode);
                let text = node.parentNode.innerText
                //console.log(node, node.parentNode);
                if (text && text.includes(' || ')) {
                    let txtArr = text.split(' || ').map(val => { return val.trim() });
                    if (currentLang == 'de') {
                        text = txtArr[0];
                    }
                    else if (currentLang == 'en') {
                        text = '' + txtArr[1].replaceAll(' *', '');
                    }
                    node.textContent = text;
                }
            }
        }
    }

    /**
     * Get text nodes in element
     * based on:
     * https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page#10730777
     */
    function textNodesInEl(node) {
        let textNodes = [];
        for (node = node.firstChild; node; node = node.nextSibling) {
            if (node.nodeType == 3) {
                textNodes.push(node);
            }
            else {
                textNodes = textNodes.concat(textNodesInEl(node));
            }
        }
        // filter empty text nodes
        textNodes = textNodes.filter(node => node.textContent.trim())
        return textNodes;
    }


}