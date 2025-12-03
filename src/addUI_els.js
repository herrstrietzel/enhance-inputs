export function addUI_elements(){

    let uiEls = document.querySelectorAll('[data-ui]');

    uiEls.forEach(el=>{

        let {ui} = el.dataset;
        let html = '';
        let classes = ['input-wrap-ui', `input-wrap-ui-${ui}`]



        if(ui==='reset'){
            html = `<button class="btn-default btn-neg wdt-100 txt-cnt" id="btnReset" type="button" data-icon="arrow-path"
            data-icon-pos="left">Reset
            settings</button>`;
        }

        else if(ui==='dark' || ui==='darkmode'){

            html = `<label><input type="checkbox" data-icon="sun moon" id="inputDarkmode" name="darkmode">Darkmode</label>`
        }

        else if(ui==='lang' || ui==='lng' || ui==='language'){
            let langAtt = el.dataset.uiLang || el.dataset.uiLanguage || el.dataset.uiLng;
            let langs = langAtt? langAtt.split(' ').filter(Boolean).map(lng=>lng.toLowerCase()) : ['de' || 'en'];
            let className = el.dataset.mode ? el.dataset.mode : ''
            if(className) classes.push(className);

            el.classList.add('input-ui', `input-ui-${className}`)
            langs.forEach((lng, i)=>{
                let checked = i===0 ? 'checked' : '';
                html += ` <label ><input type="radio" name="lang" value="${lng}" ${checked}>${lng.toUpperCase()}</label>`
            })
        }


        el.classList.add(...classes);
        el.removeAttribute('data-ui')
        el.insertAdjacentHTML("beforeend", html)

        
    })

}