
/**
 * add mouse controls
 * to number fields
 */


export function enhanceNumberFields(selector = '.enhanceInputs') {

    let numberFields = document.querySelectorAll(`${selector} input[type=number]`);

    for (let i = 0, len = numberFields.length; len && i < len; i++) {
        let input = numberFields[i];
        enhanceNumberField(input);

    }
}


export function enhanceNumberField(input) {

    let wrap = input.closest(".input-wrap-number");

    if(!wrap){
        wrap = document.createElement('div')
        wrap.classList.add('input-wrap-number');
        input.parentNode.insertBefore(wrap, input);
        wrap.append(input)
    }


    let btnsNum = wrap.querySelector('.input-number-btns');
    if (btnsNum) return;

    let {min=0, max=100, step=1, value=0} = input;
    let maxLen = max ? max.toString().length : 0;
    let stepLen = step ? step.toString().length : 0;
    stepLen = stepLen>1 ? stepLen : 0;
    input.value=value;


    let charLen = maxLen + stepLen;
    //let charLen = maxLen;

    if (charLen) {
        input.classList.add(`input-number-${charLen}`)
    }




    // convert type number to text
    input.type = "text";
    //input.pattern = "[0-9+-/*eE.]+";
    input.title = "Use Mousewheel or arrow keys to change values";
    input.classList.add('input-number', 'no-focus')


    /**
     * add plus minus buttons
     */

    let btns = `<div class="input-number-btns">
        <button type="button" class="input-number-btn input-number-btn-minus no-focus">&minus;</button>
        <button type="button" class="input-number-btn input-number-btn-plus no-focus">+</button>
        </div>`;

    wrap.insertAdjacentHTML('beforeend', btns);


    // add event listeners
    bindNumberEvents(input);
}



export function bindNumberEvents(input, syncInput = null) {

    function safeCalculation(input) {
        const cleanValue = input.value
            .replace(/,/g, ".")
            .replace(/[^0-9+\-*/.\se]/g, "");

        try {
            const result = Function(`'use strict'; return (${cleanValue})`)();
            if (!isNaN(result)) {
                input.value = result;
            }
        } catch (e) {
            console.warn("Invalid calculation");
        }
    }


    let wrap = input.closest(".input-wrap-number");

    let min = input.min ? +input.min : Infinity;
    let max = input.max ? +input.max : Infinity;
    let step = input.step ? +input.step : 0.1;

    input.addEventListener("change", () => safeCalculation(input));

    let btnMinus = wrap.querySelector('.input-number-btn-minus')
    let btnPlus = wrap.querySelector('.input-number-btn-plus')

    btnMinus.addEventListener('click', e => {
        let newVal = +(+input.value - step).toFixed(12)
        input.value = newVal>= min ?  newVal : min;
        //console.log('minus', newVal);
        upDateSynced(syncInput, input)
    })

    btnPlus.addEventListener('click', e => {
        let newVal = +(+input.value + step).toFixed(12)
        input.value = newVal<=max ? newVal : max;
        upDateSynced(syncInput, input)
    })

    if (syncInput) {
        input.addEventListener('input', e => {
            //input.value = syncInput.value;
            syncInput.value = input.value;
            //syncInput.dispatchEvent(new Event('input'));
        })
        input.addEventListener('keyup', e => {
            //input.value = syncInput.value;
            //syncInput.value = input.value;
            //syncInput.dispatchEvent(new Event('input'));
            upDateSynced(syncInput, input)

        })

        input.addEventListener('blur', e => {
            //input.value = syncInput.value;
            //syncInput.value = input.value;
            //syncInput.dispatchEvent(new Event('input'));

            upDateSynced(syncInput, input)
        })
    }

    function upDateSynced(syncInput = null, input) {
        if (syncInput) {

            //input.value = syncInput.value;
            syncInput.value = input.value;
            syncInput.dispatchEvent(new Event('input'));
        }
    }


    input.addEventListener("keydown", (e) => {
        let val = +input.value;
        let newVal = val;

        if (
            e.keyCode == 38 ||
            e.keyCode == 39 ||
            e.keyCode == 40 ||
            e.keyCode == 37
        ) {
            // up or right arrow = increase
            if (e.keyCode == 38 || e.keyCode == 39) {
                newVal += step;
            }
            // down or left arrow = decrease
            else if (e.keyCode == 40 || e.keyCode == 37) {
                newVal -= step;
            }

            if (newVal < min) newVal = min;
            if (newVal > max) newVal = max;
            input.value = +newVal.toFixed(8);
            input.dispatchEvent(new Event('input'))
        }
    });


    input.addEventListener("wheel", (e) => {
        if (document.activeElement === input) {
            e.preventDefault(); // allowed because passive:false
            let offY = e.deltaY * 0.05;
            let val = +input.value;
            offY = Math.round(offY / step) * step;
            let newVal = +(val - offY).toFixed(8);

            if (newVal < min) newVal = min;
            if (newVal > max) newVal = max;
            input.value = newVal;

            input.dispatchEvent(new Event("input"));
            upDateSynced(syncInput, input)

        }
    }, { passive: false });


    // synced input
    if (syncInput) {
        syncInput.addEventListener('input', e => {
            input.value = syncInput.value;
            //syncInput.value = input.value;
            input.dispatchEvent(new Event('input'));

        })
    }


}

/**
 * add triple click custom event
 */

function registerTripleClickEvent() {
    document.addEventListener("click", (e) => {
        const target = e.target;
        if (!target._tripleClickData) {
            target._tripleClickData = { count: 0, timer: null };
        }

        const data = target._tripleClickData;
        data.count++;

        if (data.timer) clearTimeout(data.timer);

        data.timer = setTimeout(() => {
            if (data.count === 3) {
                const tripleClickEvent = new CustomEvent("tripleClick", { bubbles: true, cancelable: true });
                target.dispatchEvent(tripleClickEvent);
            }
            data.count = 0; // Reset after timeout
        }, 300); // Typical double-click timeout
    });
}

// Initialize the triple click listener globally
//registerTripleClickEvent();