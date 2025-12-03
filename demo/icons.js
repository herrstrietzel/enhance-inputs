window.addEventListener('enhanceReady', () => {
    console.log('Inputs enhanced and ready');




});

// get global settings
let settings = enhanceInputsSettings;
console.log('!!!settings', settings);


update(settings);


/*
setTimeout(() => {
    let icnNew = `<button type="button" data-icon="copy">test</button>`;
    document.body.insertAdjacentHTML('afterbegin', icnNew);
    document.dispatchEvent(new Event('DOMChange'))

}, 1000)
*/



document.addEventListener('settingsChange', () => {
    console.log('!!!Data changed:', settings);

    // render
    update(settings);

});


function update(settings) {

    let { iconStyle, iconWeight, iconColor, iconCorner } = settings;

    let target = document.getElementById('spriteMap');

    // reset classes
    let classesIcns = [...target.classList].filter(cl=>cl.startsWith('icn-'));
    classesIcns.forEach(cl=>{
        target.classList.remove(cl)
    })


    


    // change properties
    let classesNew = [];

    let props = ['iconStyle', 'iconWeight', 'iconColor', 'iconCorner'];
    props.forEach(propName=>{
        let val = settings[propName]
        let className = val && val !== 'normal' ? `icn-${val}` : ''
        classesNew.push(className)
    })

    classesNew = Array.from(new Set([...classesNew])).filter(Boolean)
    if(classesNew.length) target.classList.add(...classesNew)



    /*
    let classWeight = iconWeight && iconWeight !== 'normal' ? `icn-${iconWeight}` : ''
    let classStyle = iconStyle && iconStyle !== 'normal' ? `icn-${iconStyle}` : ''
    let classCorner = iconCorner && iconCorner !== 'normal' ? `icn-${iconCorner}` : ''
    */


    //let classes = [classWeight, classStyle, classCorner].filter(Boolean);


}