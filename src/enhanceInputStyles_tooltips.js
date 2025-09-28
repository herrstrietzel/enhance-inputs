export function addToolTips(selector='.enhanceInputs [title]'){

    let titeleEls = document.querySelectorAll(`${selector}`)
    //console.log(titeleEls);

    for (let i=0; i<titeleEls.length; i++){

        let el = titeleEls[i];
        if(el.classList.contains('has-tooltip')) continue;
        
        let wrp = el.closest('.input-wrap');
        //let wrpToolbar = el.closest('.toolbar-wrap');
        //wrpToolbar = false;

        if(!wrp ){
            wrp = document.createElement('div')
            wrp.classList.add('input-wrap', 'input-wrap-inline');
            el.parentNode.insertBefore(wrp, el);
            wrp.append(el)
        }else{
            //wrp.classList.add('input-wrap-inline');
        }

        let tooltip = 
        `<div class="tooltip tooltip-hidden">
        ${el.title}
        </div>`;

        el.classList.add('has-tooltip');
        wrp.insertAdjacentHTML('beforeend', tooltip);

    }

}