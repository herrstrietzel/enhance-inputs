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


            if (items) {

                // group to optgroups if present by underscore prefix
                let optGroups = { misc: [] }

                for (let key in items) {
                    let value = items[key].trim()
                    let labelArr = key.split('__').filter(Boolean);
                    let label = labelArr.length > 1 ? labelArr.slice(1).join(' ') : key;

                    let option = new Option(label, value)

                    let group = labelArr.length > 1 ? labelArr[0] : '';
                    if (group) {
                        if (!optGroups[group]) {
                            optGroups[group] = []
                        }
                        optGroups[group].push(option)
                    } else {
                        optGroups['misc'].push(option)
                    }
                }

                // sort alphabetically
                let props = Object.keys(optGroups).sort()

                if(props.length){
                    let optGroupsSort= {}
                    for(let prop of props){
                        optGroupsSort[prop] = optGroups[prop].sort((a, b) => a.label.localeCompare(b.label))
                    }
                    optGroups = optGroupsSort
                }


                for (let group in optGroups) {
                    let options = optGroups[group]
                    let optGroup = document.createElement('optgroup')
                    optGroup.label = group;
                    options.forEach(option => {
                        optGroup.append(option)
                    })
                    select.append(optGroup)
                }


            }

        })
    }
}