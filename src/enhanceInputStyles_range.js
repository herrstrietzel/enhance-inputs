import { bindNumberEvents } from './enhanceInputStyles_num';


export function enhanceRangeInputs(selector = '[data-enhance-inputs]') {

    let inputs = document.querySelectorAll(`${selector} input[type=range].input-range-num, ${selector} input[data-type=range-number]`);

    for (let i = 0, len = inputs.length; len && i < len; i++) {
        let input = inputs[i];

        input.classList.add('input-range-num');
        enhanceRangeInput(input)

    }

}

export function enhanceRangeInput(input) {

    let wrap = input.closest(".input-wrap-range");

    if(!wrap){
        wrap = document.createElement('div')
        wrap.classList.add('input-wrap-range');
        input.parentNode.insertBefore(wrap, input);
        wrap.append(input)
    }

    wrap.classList.add('input-wrap-range-num');


    let btnsNum = wrap.querySelector('.input-number-btns');
    if (btnsNum) return;

    let {min=0, max=100, step=1, value=0} = input;
    let maxLen = max ? max.toString().length : 0;
    let stepLen = step ? step.toString().length : 0;
    stepLen = stepLen>1 ? stepLen : 0;
    let charLen = maxLen + stepLen;


    if (charLen) {
        input.classList.add(`input-number-${charLen}`)
    }


    // add number field
    let inputNumberMarkup =
        `<div class="input-wrap input-wrap-boxed input-wrap-number">
            <input type="text" class="input input-active input-number-${charLen} input-number no-focus" 
            name="num1" min="${min}" max="${max}" step="${step}" value="${value}" >
            <div class="input-number-btns">
                <button type="button" class="input-number-btn input-number-btn-minus no-focus">−</button>
                <button type="button" class="input-number-btn input-number-btn-plus no-focus">+</button>
            </div>
        </div>`;

    wrap.insertAdjacentHTML('beforeend', inputNumberMarkup)

    let inputNumber = wrap.querySelector('.input-number')
    let sync = input;
    bindNumberEvents(inputNumber, sync)


}
