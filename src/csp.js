/**
 * replace CSP blocked attributes
 * like src or style to be compliant
 */
export function parseCSP_Atts() {
    let cspEls = document.querySelectorAll('[data-csp-src], [data-csp-style]')

    cspEls.forEach(el => {
        let src = el.hasAttribute('data-csp-src')
        let style = el.hasAttribute('data-csp-style')
        //console.log(el);

        if (src) {
            el.src = el.dataset.cspSrc
            el.removeAttribute('data-csp-src')
        }
        if (style) {
            if(el.nodeName.toLowerCase()==='template'){
                let cssText = el.content.querySelector('style').textContent;
                let cssSheet = new CSSStyleSheet()
                cssSheet.replaceSync(cssText)
                document.adoptedStyleSheets = [cssSheet];

            }else{
                el.style.cssText = el.dataset.cspStyle
                el.removeAttribute('data-csp-style')
            }
        }
    })


}


