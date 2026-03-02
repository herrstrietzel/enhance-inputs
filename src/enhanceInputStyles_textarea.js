
/**
 * enhance textareas
 */

import { bindFileInputDropArea } from './enhanceInputStyles_file';



export function enhanceTextareas(selector = '[data-enhance-inputs]') {

    let inputs = document.querySelectorAll(`${selector} textarea`);

    for (let i = 0, l = inputs.length; l && i < l; i++) {
        let input = inputs[i];
        enhanceTextarea(input)
    }

    //enhanceTextarea(classWrap, classWrapHeader, classWrapToolbar);

}



export function enhanceTextarea(el = null, classWrap = 'input-wrap-textarea', classWrapHeader = 'input-wrap-textarea-header', classWrapToolbar = 'input-wrap-textarea-header-toolbar') {

    let wrap = el.closest(`.${classWrap}`);
    let isCode = el.closest('[class*=language-]');

    // ignore code textareas
    if(isCode) return;

    if (!wrap) {
        wrap = document.createElement('div')
        wrap.classList.add(classWrap, 'input-wrap', 'input-wrap-boxed', 'input-wrap-textarea');
        el.parentNode.insertBefore(wrap, el)
    }


    let header = wrap.querySelector(`${classWrapHeader}`)

    //already processed – skip
    if (header) {
        return
    }

    // disable spell check
    el.spellcheck = false;
    el.classList.add('input-textarea', 'no-focus', 'scrollbar', 'scroll-content', 'scroll-content-notrack', 'scroll-content-thin', 'scroll-content-hover')

    // search for label
    let hasLabelWrap = wrap.nodeName.toLowerCase() === 'label';
    let prevSibling = !hasLabelWrap ? wrap.previousElementSibling : null;
    let hasLabelPrev = !hasLabelWrap ? (prevSibling?.nodeName.toLowerCase() === 'label' || false) : false;

    let label = hasLabelWrap ? wrap : (hasLabelPrev ? prevSibling : null);

    if (label) {
        label.classList.add('label-textarea')
    }

    let accept = el.getAttribute('accept') || '.txt,.svg';

    // create header
    let hasTools = el.dataset.tools;
    //console.log(hasTools);

    if(hasTools || hasLabelWrap){
        header = document.createElement('header')
        header.classList.add(classWrapHeader);
        wrap.append(header);
    }


    // add label to toolbar
    if (hasLabelWrap) {
        let labelSpan = wrap.querySelector('.label-span');
        if (labelSpan) header.append(labelSpan)
    }


    // file name for downloads
    let filename = el.dataset.file || 'output.txt';
    let dataTools = el.dataset.tools;
    let tools = dataTools ? dataTools.split(' ') : [];

    if (!tools.length) return;

    let html = `<div class="${classWrapToolbar}">`;

    //console.log(tools);
    // map to icon names
    let icons = {
        //copy: 'square-2-stack',
        copy: 'copy',
        download: 'arrow-down-tray',
        upload: 'arrow-up-tray',
        delete: 'x-mark',
    }



    tools.forEach(tool => {

        //console.log(tool, icons[tool]);

        if (tool !== 'size') {
            html += `<button type="button" data-icon="${icons[tool]}" class="btn btn-non btn-toolbar btn-${tool}" data-tooltip="${tool}" data-btn="${tool}"></button>`
        }
        else if (tool == 'size') {
            html += `<span class="textarea-toolbar-span textarea-toolbar-span-size usr-slc-non"></span>`
        }

        // add hidden inputs
        if (tool === 'download') {
            html += `<a href="" class="sr-only link-download" download="${filename}"></div>`
        }

        if (tool === 'upload') {
            html += `<input type="file" class="sr-only input-file" accept="${accept}" tabindex="-1" >`
        }
    })

    header.insertAdjacentHTML('beforeend', html)

        // add custom resizer icon
    let resizerIcon = 
    `<svg class="icn-svg icn-picker-resize" viewBox="0 0 24 24">
    <use href="#resizer" />
  </svg>`

  wrap.insertAdjacentHTML('beforeend', resizerIcon)
    //document.createElementNS('http://www.w3.org/2000/svg', 'svg')


    // add toolbar funcionality
    bindTextAreaToolbar(header, classWrap, classWrapHeader, classWrapToolbar);

}




/**
 * add tools
 */



function bindTextAreaToolbar(header = null, classWrap = '', classWrapHeader = '', classWrapToolbar = '') {

    let btns = header.querySelectorAll('.btn-toolbar')

    // size indicator
    let textareaSizeIndicator = header.querySelector('.textarea-toolbar-span-size')

    const getTextareaByteSize = (textarea) => {
        let len = textarea.value.trim().length
        let kb = len / 1024
        let mb = kb / 1024
        let bytesize = kb < 1024 ? kb : mb;
        let unit = kb < 1024 ? 'KB' : 'MB'
        return +bytesize.toFixed(3) + ' ' + unit
    }

    const trackTextareaValue = (textarea, sizeEl) => {
        let lastValue = textarea.value;

        function checkForChanges() {
            if (textarea.value !== lastValue) {
                lastValue = textarea.value;
                sizeEl.textContent = getTextareaByteSize(textarea);
            }
            requestAnimationFrame(checkForChanges);
        }

        requestAnimationFrame(checkForChanges);
    }

    let textarea = textareaSizeIndicator?.closest(`.${classWrap}`)?.querySelector('textarea');

    //console.log(classWrap, textarea);
    if (textarea) {
        textareaSizeIndicator.textContent = getTextareaByteSize(textarea)
        trackTextareaValue(textarea, textareaSizeIndicator);
    }


    btns.forEach(btn => {
        let type = btn.dataset.btn
        let parent = btn.closest(`.${classWrap}`)
        let fileInput = parent.querySelector('input[type=file]');
        let textarea = parent.querySelector('textarea');

        //let textarea = parent.querySelector('textarea');


        if (type === 'upload') {

            bindFileInputDropArea(textarea, fileInput);

            if (!fileInput.classList.contains('input-active')) {

                fileInput.addEventListener('input', async (e) => {
                    let current = e.currentTarget;
                    let textarea = current.closest(`.${classWrap}`).querySelector('textarea');
                    let file = current.files[0];

                    if (file) {
                        //console.log('???file', file);

                        let cnt = await file.text()
                        textarea.value = cnt;

                        textarea.dispatchEvent(new Event('input'))
                    }
                });

                fileInput.classList.add('input-active')
            }

        }


        if (!btn.classList.contains('input-active')) {

            const inIframe = window.self !== window.top;

            btn.addEventListener('click', e => {
                let current = e.currentTarget
                let parent = current.closest(`.${classWrap}`)
                let textarea = parent.querySelector('textarea');
                let text = textarea.value;


                if (type === 'copy') {
                    //navigator.clipboard.writeText(text)

                    if (!inIframe && navigator.clipboard && window.isSecureContext) {
                        //console.log('clipboard');
                        navigator.clipboard.writeText(text)
                        //console.log('copied', text)
                    } else {
                        //console.log('in iframe');
                        textarea.focus();
                        textarea.select();
                        document.execCommand('copy');
                    }

                }

                else if (type === 'download') {
                    let linkDownload = parent.querySelector('.link-download')
                    let mime = linkDownload.getAttribute('download') ? linkDownload.getAttribute('download').split('.').slice(-1)[0] : 'plain';
                    let objectUrl = URL.createObjectURL(new Blob([text], { type: `text/${mime}` }));

                    linkDownload.href = objectUrl;
                    linkDownload.click()
                }

                else if (type === 'upload') {
                    let fileInput = parent.querySelector('input[type=file]');
                    fileInput.click();
                }

                else if (type === 'delete') {
                    textarea.value = ''

                }



            })


            btn.classList.add('input-active')
        }


    })
}














