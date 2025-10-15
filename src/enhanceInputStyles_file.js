export function enhanceFileinputs(selector = '[data-enhance-inputs]', labelFileBtn = "Upload File", labelFileBtnDrop="Drop File") {


    let inputs = document.querySelectorAll(`${selector} input[type=file]`);


    for (let i = 0, l = inputs.length; l&& i < l; i++) {
        let input = inputs[i];
        let wrap = input.closest(".input-wrap-file");

        // skip for textarea toolbars
        let hasHeader =  input.closest('.input-wrap-textarea-header')
        if(hasHeader) continue


        if(!wrap){
            wrap = document.createElement("div");
            wrap.classList.add('input-wrap', 'input-wrap-file');  
            input.parentNode.insertBefore(wrap, input);
            wrap.append(input);
      
        }

        let icons = wrap.querySelector('.icn-svg')
        //if(icons.classList.contains('input-active')) continue;


        let btnCustom = wrap.querySelector('.btn-file-custom');
        if (btnCustom || icons) continue;


        // hide default btn
        input.classList.add("sr-only");

        // add new UI elements
        let fileUiHTML = `<div class="btn-default btn-file btn-file-custom " type="button" aria-hidden="true" >
        <span class="icn-wrp icn-wrp-file" data-icon="arrow-up-tray" data-icon-pos="left"></span>
            <span class="label-file">${labelFileBtn}</span><span class="label-file label-drop">${labelFileBtnDrop}</span>
          </div>
          <p class="input-file-info"></p>`;

        wrap.insertAdjacentHTML("beforeend", fileUiHTML);

        // bind custom buttons
        bindFileInput(wrap);

        // bind drop area
        bindFileInputDropArea(wrap);
    }

}



export function bindFileInput(wrap = null) {
    if (!wrap) return;

    let input = wrap.querySelector("input[type=file]");
    let btnFile = wrap.querySelector(".btn-file");
    //let fileInfoEl = wrap.querySelector(".input-file-info");

    // prevent duplicate event listeners
    if (btnFile.classList.contains('input-active')) return;

    btnFile.addEventListener("click", (e) => {
        let inputFile = wrap.querySelector("input[type=file]");
        inputFile.click();
    });

    // custom event - add file info
    input.addEventListener("input", (e) => {
        let fileInfoEl = wrap.querySelector(".input-file-info");
        let files = [...e.currentTarget.files];

        let fileInfo = [];
        files.forEach((file) => {
            let { name, size } = file;
            fileInfo.push(`${name} (${+(size / 1024).toFixed(1)} KB)`);
        });

        let fileText = '<ul class="input-file-ul">' + fileInfo.map(file => { return `<li class="input-file-li">${file}</li>` }).join(' ') + '</ul>';
        fileInfoEl.innerHTML = fileText;
    });

    btnFile.classList.add('input-active')

}

export function bindFileInputDropArea(dropArea = null, inputFile = null, dragOverClass = 'input-file-drag-over') {

    // prevent duplicate event listeners
    if (!dropArea || dropArea.classList.contains('droparea-active')) return;

    // if input is in drop area or in parent element
    inputFile = inputFile ? inputFile : dropArea.querySelector("input[type=file]");

    let accepted = inputFile.accept ? inputFile.accept.split(',').filter(Boolean).map(type=>type.trim() ) : ['.txt', '.svg'];

    //console.log('accepted', accepted, inputFile.accept);

    // Add event listeners for drag and drop events
    ["dragenter", "dragover"].forEach((event) => {
        dropArea.addEventListener(event, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add(dragOverClass);
        });
    });

    ["dragleave", "drop"].forEach((event) => {
        dropArea.addEventListener(event, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove(dragOverClass);
        });
    });

    // Handle drop event to assign file to the file input
    dropArea.addEventListener("drop", (e) => {

        let fileInfo = dropArea.querySelector('.input-file-info');
        if(fileInfo) fileInfo.textContent='';

        let files = e.dataTransfer.files;
        //console.log(accepted, files);

        let filesFiltered=new DataTransfer();


        for(let i=0,l=files.length; i<l;i++){
            let file=files[i];
            let type = file.type ? '.'+file.type.split('/').slice(-1) : null;
            // get type from extension
            let ext = '.'+file.name.split('.').slice(-1);

            if(accepted.includes(type) || accepted.includes(ext)){
                filesFiltered.items.add(file)
            }else{
                console.warn('File type not allowed', type, ext, accepted);
            }
            //console.log(type, file.type , ext, 'check');
        }

        if (filesFiltered.files.length > 0) {

            inputFile.files = filesFiltered.files;

            // Trigger a change event on the file input to notify any listeners
            let changeEvent = new Event("input");
            inputFile.dispatchEvent(changeEvent);
            //inputFile.dispatchEvent('input');

        }else{
            if(fileInfo) fileInfo.textContent='Invalid filetype';
        }
    });

    dropArea.classList.add('droparea-active');
}