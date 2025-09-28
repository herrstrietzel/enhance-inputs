import { bindNumberEvents } from './enhanceInputStyles_num';

export function enhanceRangeInputs(selector = '.enhanceInputs') {

    let inputs = document.querySelectorAll(`${selector} input[type=range].input-range-num, ${selector} input[data-type=range-number]`);

    for (let i = 0, len = inputs.length; len && i < len; i++) {
        let input = inputs[i];

        input.classList.add('input-range-num');
        enhanceRangeInput(input)

    }

}

export function enhanceRangeInput(input) {

    let min = input.min ? +input.min : 0;
    let max = input.max ? +input.max : Infinity;
    let step = input.step ? +input.step : 0.1;
    let value = input.value ? +input.value : 0;

    let wrap = input.closest(".input-wrap-range");
    if (wrap) return;

    //let charLen = max.toString().length+min.toString().length + step.toString().length;
    let charLen = 5;
    //console.log(charLen, min, max, step);

    if (charLen) {
        //let charLen = maxLen.toString().length;
        input.classList.add(`input-number-${charLen}`)
    }



    wrap = document.createElement('div')
    wrap.classList.add('input-wrap', 'input-wrap-range', 'input-wrap-range-num');

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

    //document.createElement('input');
    //inputNumber.classList.add('input-number')

    input.parentNode.insertBefore(wrap, input);
    wrap.append(input)

    wrap.insertAdjacentHTML('beforeend', inputNumberMarkup)

    let inputNumber = wrap.querySelector('.input-number')
    let sync = input;
    bindNumberEvents(inputNumber, sync)


}
