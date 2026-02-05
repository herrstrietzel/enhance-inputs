export function loadSamples(parent = null) {

    parent = document.querySelector(parent) || document.body;

    // check if global var exist
    if (typeof inputSampleData === 'object' || typeof window.inputSampleData === 'object') {
        let selects = parent.querySelectorAll('[data-options]');

        // add optiions
        selects.forEach(select => {

            let prop = select.dataset.options;
            let items = inputSampleData[prop];

            let optionDefault = new Option('Choose Sample', '')
            select.append(optionDefault)

            if(items){
                for(let key in items ){
                    let option = new Option(key, items[key])
                    select.append(option)
                }
            }


        })
    }
}