export function enhanceTextFields(selector = '.enhanceInputs') {

    let inputs = document.querySelectorAll(`${selector} input[type=text]`);

    for (let i = 0, len = inputs.length; len && i < len; i++) {
        let input = inputs[i];
        enhanceTextField(input)
    }
}

export function enhanceTextField(input) {

    let wrap = input.closest(".input-wrap-text");
    if (wrap) return;

    wrap = document.createElement('div')
    wrap.classList.add('input-wrap', 'input-wrap-boxed', 'input-wrap-text');

    input.parentNode.insertBefore(wrap, input);
    wrap.append(input)


}