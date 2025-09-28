
/**
 * enhance textareas
 */



export function enhanceTextarea() {

    let classWrap = 'input-wrap-textarea';
    let classWrapHeader = 'input-wrap-textarea-header';
    let classWrapToolbar = 'input-wrap-textarea-header-toolbar';

    addtextareaTools(classWrap, classWrapHeader, classWrapToolbar);

    //bindToolbar(classWrap, classWrapHeader, classWrapToolbar);
    //bindToggleBtns();
    //injectIcons();
}


/**
 * add tools
 */

function addtextareaTools(classWrap = '', classWrapHeader = '', classWrapToolbar = '') {
    let textareas = document.querySelectorAll('[data-tools]')
    //let textareas = document.querySelectorAll('textarea')


    for (let i = 0, len = textareas.length; i < len; i++) {
        let el = textareas[i];

        let parent = el.closest(`.${classWrap}`);
        if (parent) {
            continue;
        }

        el.spellcheck = false;

        // search for previous label
        let prevSibling = el.previousElementSibling;
        let label = prevSibling && prevSibling.nodeName.toLowerCase() === 'label' ? prevSibling : null;
        label.classList.add('label-textarea')
        let accept = el.getAttribute('accept');

        // create outer wrapper
        let wrap = document.createElement('div')
        wrap.classList.add(classWrap, 'input-wrap-boxed', 'input-wrap-wide');
        el.parentNode.insertBefore(wrap, el)
        el.classList.add('input-textarea', 'no-focus')


        // create header
        let header = document.createElement('header')
        header.classList.add(classWrapHeader);
        wrap.append(header);

        // add label
        if (label) header.append(label)


        // move textarea to wrap
        wrap.append(el);

        // file name for downloads
        let filename = el.dataset.file

        let tools = el.dataset.tools.split(' ')
        let html = `<div class="${classWrapToolbar}">`;

        //console.log(tools);
        // map to hero icons
        let icons = {
            copy: 'square-2-stack',
            download: 'arrow-down-tray',
            upload: 'arrow-up-tray',
        }

        tools.forEach(tool => {

            //console.log(tool, icons.tool);

            if (tool !== 'size') {
                html += `<button type="button" data-icon="${icons[tool]}" class="btn btn-non btn-toolbar btn-${tool}" title="${tool}" data-btn="${tool}"></button>`
            }
            else if (tool == 'size') {
                html += `<div  class="textarea-size usr-slc-non" title="${tool}"></div>`
            }

            // add hidden inputs
            if (tool === 'download') {
                html += `<a href="" class="sr-only link-download" download="${filename}"></div>`
            }

            if (tool === 'upload') {
                html += `<input type="file" class="sr-only input-file" accept="${accept}" >`
            }
        })

        header.insertAdjacentHTML('beforeend', html)


        // add toolbar funcionality
        bindTextAreaToolbar(header, classWrap, classWrapHeader, classWrapToolbar);
    }
}

function bindTextAreaToolbar(header = null, classWrap = '', classWrapHeader = '', classWrapToolbar = '') {

    let btns = header.querySelectorAll('.btn-toolbar')

    // size indicator
    let textareaSizeIndicator = header.querySelector('.textarea-size')

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

    let textarea = textareaSizeIndicator.closest(`.${classWrap}`).querySelector('textarea');
    //console.log(classWrap, textarea);
    if (textarea) {
        textareaSizeIndicator.textContent = getTextareaByteSize(textarea)
        trackTextareaValue(textarea, textareaSizeIndicator);
    }


    btns.forEach(btn => {
        let type = btn.dataset.btn
        let parent = btn.closest(`.${classWrap}`)
        //let textarea = parent.querySelector('textarea');

        if (type === 'upload') {

            let fileInput = parent.querySelector('input[type=file]');
            fileInput.addEventListener('input', async (e) => {
                let current = e.currentTarget;
                let textarea = current.closest(`.${classWrap}`).querySelector('textarea');
                let file = current.files[0];
                if (file) {
                    let cnt = await file.text()
                    textarea.value = cnt;
                    textarea.dispatchEvent(new Event('input'))
                }
            });
        }


        btn.addEventListener('click', e => {
            let current = e.currentTarget
            let parent = current.closest(`.${classWrap}`)
            let text = parent.querySelector('textarea').value;

            if (type === 'copy') {
                navigator.clipboard.writeText(text)
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

        })
    })
}


