
export function addInfos(selector = '[data-enhance-inputs] [data-info], [data-enhance-inputs] [aria-description]') {

    let infoEls = document.querySelectorAll(`${selector}`)
    //console.log(titeleEls);

    for (let i = 0; i < infoEls.length; i++) {

        let el = infoEls[i];
        if (el.classList.contains('has-info')) continue;



        let isButton = el.nodeName.toLowerCase() === 'button';
        let wrp = isButton ? el : el.closest('.input-wrap');


        /*
        let btnInfo = document.createElement('button');
        btnInfo.type="button";
        btnInfo.dataset.icon='question';
        */

        let infoText = el.dataset.info || el.getAttribute('aria-description');
        let btnInfo =
            `
        <button type="button" class="btn-info" data-icon="question" aria-label="show info">
        </button>
        <div class="tooltip-info tooltip-hidden-info">
            ${infoText}
        </div>`;


        if (!wrp) {
            wrp = document.createElement('div')
            wrp.classList.add('input-wrap', 'input-wrap-inline');
            el.parentNode.insertBefore(wrp, el);
            wrp.append(el)
        }

        wrp.insertAdjacentHTML('beforeend', btnInfo);

        let btn = wrp.querySelector('.btn-info');
        if (btn) {
            btn.addEventListener('click', (e) => {
                if (!btn.classList.contains('btn-info-active')) {
                    btn.classList.add('btn-info-active')
                } else {
                    btn.classList.remove('btn-info-active')
                }
            });

            btn.addEventListener('blur', (e) => {
               btn.classList.remove('btn-info-active')
            })
        }
    }

}



export function addToolTips(selector = '[data-enhance-inputs] [data-tooltip]') {

    let titeleEls = document.querySelectorAll(`${selector}`)
    //console.log(titeleEls);

    for (let i = 0; i < titeleEls.length; i++) {

        let el = titeleEls[i];
        if (el.classList.contains('has-tooltip')) continue;


        let isButton = el.nodeName.toLowerCase() === 'button';
        let wrp = isButton ? el : el.closest('.input-wrap');
        let tooltipLabel = el.dataset.tooltip;


        //let input = wrp.querySelector('select, input, textarea');


        //let wrpToolbar = el.closest('.toolbar-wrap');
        //wrpToolbar = false;

        if (!wrp) {
            wrp = document.createElement('div')
            wrp.classList.add('input-wrap', 'input-wrap-inline');
            el.parentNode.insertBefore(wrp, el);
            wrp.append(el)
        } else {
            //wrp.classList.add('input-wrap-inline');
        }

        let tooltip =
            `<div class="tooltip tooltip-hidden">
        ${tooltipLabel}
        </div>`;

        el.setAttribute('aria-label', tooltipLabel)
        el.removeAttribute('title')

        el.classList.add('has-tooltip');
        wrp.insertAdjacentHTML('beforeend', tooltip);

    }

}