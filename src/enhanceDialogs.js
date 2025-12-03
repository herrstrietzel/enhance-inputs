import { initDraggables, makeDraggable } from "./makeDraggable";





export function initDialogs(dialogSelector = "[data-dialog]") {

    let dialogBtns = document.querySelectorAll(dialogSelector);
    if (!dialogBtns.length) return false;


    /**
     * add dialog UI
     */


    dialogBtns.forEach(dialogBtn => {
        let selector = dialogBtn.dataset.dialog;
        let dataSrc = dialogBtn.dataset.dialogSrc;
        let dialogTitle = dialogBtn.dataset.dialogTitle;
        let dialog = document.querySelector(`${selector}`)

        // no dialog - exit
        if (!dialog) return false;



        // make draggable
        dialog.classList.add('draggable')

        let dialogWrap = dialog.closest('.dialog-wrap');
        let dialogHeader = dialog.querySelector('.dialog-header');
        let btnClose = dialog.querySelector('.dialog-btn-close');
        let iframe = dialog.querySelector('.iframe-dialog');
        let dialogContent = dialog.querySelector('.dialog-content');


        // get transition timings from computed style
        let style = getComputedStyle(dialog);
        let duration = parseFloat(style.getPropertyValue("transition-duration")) * 1000;
        let delay = parseFloat(style.getPropertyValue("transition-delay")) * 1000;

        if (!dialogWrap) {
            dialogWrap = document.createElement('div')
            dialogWrap.classList.add('dialog-wrap');
            dialog.parentNode.insertBefore(dialogWrap, dialog);
            dialogWrap.append(dialog)
        }

        if (!dialogContent) {
            let children = [...dialog.children];
            dialogContent = document.createElement('div')
            dialogContent.classList.add('dialog-content',);
            dialog.append(dialogContent)
            dialogContent.append(...children);
        }

        if (!dialogHeader) {
            dialogHeader = document.createElement('header');
            dialogHeader.classList.add('dialog-header', 'drag-handle');
            dialogHeader.insertAdjacentHTML('afterbegin', `<p class="dialog-header-title ">${dialogTitle}</p>`)
            dialog.insertBefore(dialogHeader, dialog.children[0])
        }

        if (!btnClose) {
            //console.log(dialogHeader);

            btnClose = document.createElement('button')
            btnClose.classList.add('dialog-btn-close')
            btnClose.type = 'button'
            btnClose.setAttribute('aria-label', 'Close dialog');
            btnClose.textContent = '×';
            dialogHeader.append(btnClose)
            //dialogHeader.insertBefore(btnClose, dialog.children[0])
        }


        if (dataSrc && !iframe) {
            iframe = document.createElement('iframe')
            iframe.classList.add('iframe-dialog', 'brd-non', 'wdt-100', 'min-hgt-75vh');
            dialogContent.append(iframe)
            dialogWrap.classList.add('dialog-wrap-iframe')

        }


        // make it scrollable
        dialogContent.classList.add('scrollbar', 'scroll-content');

        // open dialog modally
        dialogBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            let dialogSrc = dialogBtn.dataset.dialogSrc;

            // load page in iframe
            if (dialogSrc && iframe) {
                iframe.src = dialogSrc;
                iframe.addEventListener("load", function () {
                    dialogWrap.classList.add("dialog-active");
                });
            } else {
                dialogWrap.classList.add("dialog-active");
            }

            // show modal
            dialog.showModal();

        });


        // "Close" button closes the dialog
        btnClose.addEventListener("click", () => {
            closeDialog(dialog, dialogWrap, duration, delay);
        });

        // close on backdrop click
        dialog.addEventListener("click", (e) => {
            //get bounding box to close dialog when clicking outside dialog box
            let {
                left,
                top,
                right,
                bottom,
                width,
                height
            } = dialog.getBoundingClientRect();

            if (dialog.open) {
                let pt = { x: e.clientX, y: e.clientY };
                // is outsite bbox
                if (pt.x > right || pt.x < left || pt.y > bottom || pt.y < top) {
                    closeDialog(dialog, dialogWrap, duration, delay);
                }
            }
        });

        // make draggable
        initDraggables()

    })


    /**
     * close dialogs on ESC
     */

    document.addEventListener('keyup', function (event) {
        if (event.key === "Escape" || event.keyCode == 27) {
            closeDialogs()
        }
    })

}


function closeDialog(dialog, dialogWrap, duration, delay) {
    dialogWrap.classList.remove("dialog-active");

    // delay close to enable backdrop transition
    setTimeout(() => {
        dialog.close();
    }, (duration + delay));
}


export function closeDialogs() {
    let dialogs = document.querySelectorAll('dialog')
    dialogs.forEach(dialog => {

        let dialogWrap = dialog.closest('.dialog-wrap');

        // get transition timings from computed style
        let style = getComputedStyle(dialog);
        let duration = parseFloat(style.getPropertyValue("transition-duration")) * 1000;
        let delay = parseFloat(style.getPropertyValue("transition-delay")) * 1000;

        closeDialog(dialog, dialogWrap, duration, delay);

    })
}


