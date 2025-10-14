//import { enhanceInputs } from "./src";
//import { injectIcons } from "./src/injectIcons";

let options = {
    storageName: 'enhance_settings',
    parent: 'main',
    selector: 'input, select, textarea',
    cacheToUrl:true,
    cacheToStorage:false,
}

let settings = enhanceInputs(options);
console.log('!!!settings', settings, options);
/*
*/

if (settings.darkmode) {
  document.body.classList.add('darkmode')
}
else {
  document.body.classList.remove('darkmode')
}


//injectIcons();


document.addEventListener('settingsChange', () => {
    console.log('!!!Data changed:', settings);

    // render
    //update(settings);

});


/*
// test heights
let wrps = document.querySelectorAll('.input-wrp-boxed, .btn-default')
let heights = new Set([])
let tops = new Set([])

wrps.forEach(wrp=>{
  let {top, height} = wrp.getBoundingClientRect()
  heights.add(height)
  tops.add(top)
})
  console.log('heights', heights)
  */

/*
markupText.addEventListener('input', ()=>{
    console.log('input textarea');
})
*/