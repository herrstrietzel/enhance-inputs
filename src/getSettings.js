

/**
 * wrapper to get 
 * all input values
 */
export function getSettingValueFromInputs(inputs, settings={}) {

    
    inputs.forEach((inp) => {
        getSettingValueFromInput(inp, settings)
    });
    return settings;
}


// update setting object from single input value
export function getSettingValueFromInput(inp, settings = {}) {

    let prop = inp.name;
    let type = inp.type ? inp.type : inp.nodeName.toLowerCase();
    let isSelect = type === 'select-one' || type === 'select-multiple'
    let value = type==='number' && !inp.value ? 0 : inp.value;
    //let value = inp.value;
    //console.log(type, inp.value );

    if(!prop){
        return;
    }

    // never save passwords
    if (type === 'password') {
        settings[prop] = '';
        //console.log('pass');
        return;
    }


    if (type === 'checkbox') {
        settings[prop] = inp.checked ? true : false;
    }

    else if (isSelect) {
        let isSelectMulti = isSelect ? type === 'select-multiple' : false;
        let options = inp.options;
        let optionsSelected = Array.from(options).filter(option => option.selected)

        if (isSelectMulti) {
            settings[prop] = optionsSelected.map(option => option.value)
        } else {
            settings[prop] = optionsSelected[0].value
        }
    }


    else if (type === 'radio') {
        let selected = document.querySelector(`[name=${prop}]:checked`);
        settings[prop] = selected ? selected.value : null;
    }
    else {
        // convert numbers
        //let isNum = parseFloat(value).toString() === value;
        let isNum = !isNaN(value) && value!=='';

        if(type!=='password'){
            settings[prop] = isNum ? +value : (inp.value);
        }
    }

    return settings;

}