//import { enhanceInputs } from "./src";

let options = {
    storageName: 'enhance_settings',
    parent: 'main',
    selector: '.input'
}

let settings = enhanceInputs(options);
console.log('!!!settings', settings, options);


document.addEventListener('settingsChange', () => {
    console.log('!!!Data changed:', settings);

    // render
    //update(settings);

});


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

/*
markupText.addEventListener('input', ()=>{
    console.log('input textarea');
})
*/