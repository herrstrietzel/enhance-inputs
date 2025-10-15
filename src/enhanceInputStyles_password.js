export function enhancePasswordFields(selector = '[data-enhance-inputs]'){

    let inputs = document.querySelectorAll(`${selector} input[type=password]`);

    for (let i = 0, len = inputs.length; len && i < len; i++) {
        let input = inputs[i];
        enhancePasswordField(input)
    }

}

export function enhancePasswordField(input) {
    let wrap = input.closest('.input-wrap');

    // add button
    //let btn = `<button type="button"><span class="btn-toggle" data-icon="eye-slash eye"></span></button>`;
    let btnHTML = `<button type="button" class="icon-wrap btn-non btn-password btn-password" title="Show password">
    <span class="icn-wrp icon-wrap icn-wrp-multi icn-pos-left" data-icon="eye-slash eye" ></span>
    </button>`;
    wrap.insertAdjacentHTML('beforeend', btnHTML)

    let btn = wrap.querySelector('.btn-password');
    btn.addEventListener('click', (e)=>{
        //let input = e.currentTarget.closest('input');
        //let input = e.currentTarget.closest('.input-wrap').querySelector('input');
        let input = wrap.querySelector('input');
        let {type} = input;
        let icnWrp = btn.querySelector('.icn-wrp-multi')

        if(type==='password'){
            input.type='text'
            icnWrp.classList.add('icn-wrp-multi-1')
        }else{
            input.type='password'
            icnWrp.classList.remove('icn-wrp-multi-1')
        }

    })

}

