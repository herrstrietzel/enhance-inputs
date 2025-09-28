
export function enhanceSelects(selector = ".enhanceInputs") {

    let selects = document.querySelectorAll(`${selector} select`);


    for (let i = 0; i < selects.length; i++) {

        let select = selects[i];
        if (select.classList.contains('.input-active')) {
            //console.log('active');
            continue;
        }

        let options = [...select.options];
        //console.log(options);

        options.forEach(option=>{
            option.classList.add('option')
        })

        select.onfocus = () => {
            select.classList.add('input-select-focus')
        }

        select.oninput = () => {
            select.classList.remove('input-select-focus')
        }

        select.onblur = () => {
            select.classList.remove('input-select-focus')
        }



    }

    /*
    let wrap = document.createElement('div');
    wrap.classList.add('input-wrap', 'input-wrap-select');

    wrap.append(select)

    wrap.insertAdjacentHTML('beforeend', chevron);


    //if (parent.classList.contains('input-wrap')) continue
    */


}