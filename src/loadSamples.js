export function loadSamples(parent = null) {

    parent = document.querySelector(parent) || document.body;

    // check if global var exist
    if (typeof inputSampleData === 'object' || typeof window.inputSampleData === 'object') {
        let selects = parent.querySelectorAll('[data-options]');

        // add optiions
        selects.forEach(select => {

            let prop = select.dataset.options;
            let items = inputSampleData[prop];

            items.forEach(item => {
                let key = Object.keys(item)[0]
                let option = new Option(key, item[key])
                select.append(option)
            })

        })
    }
}