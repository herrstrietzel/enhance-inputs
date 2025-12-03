
export function bindDetailsOpenbtns() {

    let btns = document.querySelectorAll('button[data-details], a[data-details]')

    btns.forEach(btn => {

        if (!btn.classList.contains('btn-active')) {

            let targetIds = btn.dataset.details.split(' ').filter(Boolean);
            let toggle = btn.dataset.detailsToggle || '';
            //console.log('dat', toggle, toggleAtt);

            let targets = targetIds.map(id => document.getElementById(id));
            if (btn.nodeName.toLocaleLowerCase() === 'button') {
                btn.type = 'button';
            }

            btn.addEventListener('click', (e) => {
                // no spcific target
                if (!targetIds.length) {
                    let parent = btn.parentNode.closest('[data-details]') || btn.parentNode.closest('.details-enhanced');
                    let detailsOpen = parent.querySelectorAll('details[open]')
                    let detailsClosed = parent.querySelectorAll('details:not([open])')

                    let detailsRest = detailsOpen.length > detailsClosed.length ? detailsOpen : detailsClosed;
                    let mode = toggle === 'expand' || toggle === 'collapse' ? toggle : 'toggle'
                    targets = mode === 'expand' ? detailsClosed : (mode === 'collapse' ? detailsOpen : detailsRest)
                }

                toggleDetails(targets)
            })

            btn.classList.add('btn-active')

        }
    })
}



export function closeDetails(parentEl = null, exclude=null) {
    parentEl = parentEl ? parentEl : document.body
    let details = parentEl.querySelectorAll('details[open]')
    toggleDetails(details, exclude)
}

export function openDetails(parentEl = null, exclude=null) {
    parentEl = parentEl ? parentEl : document.body
    let details = parentEl.querySelectorAll('details:not([open])')
    toggleDetails(details, exclude)
}

export function toggleDetails(details = null, exclude=null) {
    details.forEach(detail => {

        let nodeName = detail.nodeName.toLowerCase()
        let summary = nodeName === 'summary' ? detail : detail.querySelector('summary')
        if(!exclude || summary!==exclude){
            summary.dispatchEvent(new Event('click'))
        }
    })
}







export function bindDetailsEvents(detail, detailsContent, summary, expanded, type = '') {

    let parent = detail.parentNode.closest('[data-details]') || detail.parentNode.closest('.details-enhanced');

    // prevent duplicate events
    if (!summary.classList.contains('summary-active')) {

        /**
         * events and 
         * animation
         */

        // toggle open state after transition end
        detailsContent.addEventListener("transitionend", (e) => {
            //console.log("Transition ended");
            if (!expanded) {
                detail.open = false;
            } else {
                detailsContent.classList.add("details-content-open");
            }
        });

        // toggle states on click
        summary.addEventListener("click", (e) => {
            e.preventDefault();
            let current = e.currentTarget;
            let detail = current.closest("details");
            let detailsContent = current.parentNode.querySelector('.details-content');
            let summaryMarker = current.querySelector('.summary-marker');

            // close others in accordion mode
            if(type==='accordion'){
                closeDetails(parent, summary)
            }
        
            // collapse
            if (expanded) {
                expanded = false;
                detail.classList.remove("details-expanded");
                detailsContent.classList.remove("details-content-expanded");
                detailsContent.classList.remove("details-content-open");

                summary.classList.remove("summary-expanded");
                summaryMarker.classList.replace("summary-marker-expanded", "summary-marker-collapsed");

            }
            // expand
            else if (!expanded) {
                expanded = true;
                detail.open = true;
                summary.classList.add("summary-expanded");
                summaryMarker.classList.replace("summary-marker-collapsed", "summary-marker-expanded");


                // tiny delay for expand transition
                let timeout = setTimeout(() => {
                    detail.classList.add("details-expanded");
                    detailsContent.classList.add("details-content-expanded");
                }, 10);

            }

        });

        summary.classList.add('summary-active')



    }

}





