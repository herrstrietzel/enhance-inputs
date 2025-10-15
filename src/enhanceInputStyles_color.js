export function enhanceColorInputs(selector = '[data-enhance-inputs]') {

    let inputs = document.querySelectorAll(`${selector} input[type=color]`);

    for (let i = 0, l = inputs.length; l && i < l; i++) {
        let input = inputs[i];
        enhanceColorInput(input);
    }

}


export function enhanceColorInput(input) {


    let wrap = input.closest(".input-wrap-color");

    if (!wrap) {
        wrap = document.createElement("div");
        wrap.classList.add('input-wrap', 'input-wrap-color');
        input.parentNode.insertBefore(wrap, input);
        wrap.append(input);
    }


    let colorInput = wrap.querySelector('.input-color-value')

    if (colorInput) return;

    let colorInputHTML =
`<span class="input-color-value-span">
    <input type="text" class="input-color-value" value="" title="Enter color value" >
</span>`;

    let label = document.createElement('label');
    label.classList.add('label-input-color');
    input.classList.add('sr-only');
    label.append(input)

    label.insertAdjacentHTML('afterbegin', `<span class="input-color-value-preview" ></span>`);
    wrap.append(label)

    wrap.insertAdjacentHTML('afterbegin', colorInputHTML);
    bindColorInput(input, wrap);

}


export function bindColorInput(input, wrap = null) {
    if (!wrap) return;


    // numeric input
    let inputValue = wrap.querySelector(".input-color-value");
    inputValue.value = input.value;


    // tempory el for color conversions
    let colorEl = wrap.querySelector('.input-color-value-preview');
    colorEl.style.backgroundColor = input.value;


    let alpha = 1;
    let rbga = [];


    // native color picker
    input.addEventListener('input', (e) => {
        let colorVal = input.value
        rbga = hexToRgbaArray(colorVal);
        let rgbVal = rbga.length === 4 ? `rgba(${rbga.join(', ')})` : `rgb(${rbga.join(', ')})`;
        inputValue.value = rgbVal
        colorEl.style.backgroundColor = rgbVal;

    });


    inputValue.addEventListener('input', (e) => {

        let value = inputValue.value;
        colorEl.style.backgroundColor = value;

        //colorEl.style.color='green';

        let style = window.getComputedStyle(colorEl);
        let color = style.backgroundColor.replace(/[rgb|rgba|\(|\)]/g, '').split(', ').map(Number);

        alpha = color.length === 4 ? color[3] : 1;

        let rgbaHex = rgbaArrayToHex(color);
        let rgbaHexHtml = rgbaHex.substring(0, 7);

        // full rgba value
        input.value = rgbaHexHtml;
        //input.style.opacity = alpha;

        //valueRgba.textContent = color.length === 4 ? `rgba(${color.join(', ')})` : `rgb(${color.join(', ')})`;
        //console.log('color', style.color, color, value, rgbaHexHtml);

    })



    function hexToRgbaArray(hex) {
        if (typeof hex !== 'string' || !hex.startsWith('#')) {
            throw new Error('Expected a hex color string starting with "#"');
        }

        // Remove #
        let value = hex.slice(1).trim();

        // Expand shorthand forms (#rgb or #rgba → #rrggbb or #rrggbbaa)
        if (value.length === 3 || value.length === 4) {
            value = value.split('').map(c => c + c).join('');
        }

        if (value.length !== 6 && value.length !== 8) {
            throw new Error('Invalid hex color format');
        }

        let hasAlpha = value.length === 8;

        // Parse RGB
        let r = parseInt(value.slice(0, 2), 16);
        let g = parseInt(value.slice(2, 4), 16);
        let b = parseInt(value.slice(4, 6), 16);
        let a = hasAlpha ? parseInt(value.slice(6, 8), 16) / 255 : 1;


        return hasAlpha ? [r, g, b, a] : [r, g, b];
    }



    function rgbaArrayToHex(rgba) {
        if (!Array.isArray(rgba) || (rgba.length !== 3 && rgba.length !== 4)) {
            throw new Error('Expected an array of 3 (RGB) or 4 (RGBA) numeric values');
        }

        let hasAlpha = rgba.length === 4;

        let [r, g, b, a = 1] = rgba;
        let toHex = v => Math.round(v).toString(16).padStart(2, '0');

        let baseHex =
            '#' +
            [r, g, b, a]
                .map(toHex)
                .join('')
                .toLowerCase();

        if (!hasAlpha) {
            console.log('alpha', rgba);
            baseHex = baseHex.substring(0, baseHex.length - 2);
        }
        return baseHex;
    }




}
