import { summaryIcons, getDetailsCSSOptions, replaceUmlauts, textToAnchorUrl } from './enhanceDetails_helpers';
import { bindDetailsEvents, bindDetailsOpenbtns, closeDetails, openDetails } from './enhanceDetails_state_toggle';

import {enhanceDetailsSettings, enhanceDetailsOpen} from './constants';
import { getPropFromLocalStorage } from './localStorage';

export function enhanceDetailsAutoInit(settings={}) {
    let detailsToEnhance = document.querySelectorAll('.details-enhanced, [data-details], [data-enhance-inputs]');
    if (detailsToEnhance.length) {
        enhanceDetails(settings)
    }
}


export function enhanceDetails(options = {}) {

    // default options
    options = {
        ...{
            target: 'body',
            icon: '',
            round: false,
            right: false,
            plus: false,
            storageName: ''
        },
        ...options
    }
    let { target, icon, round, right, storageName } = options;


    // selector el
    let selection = document.querySelector(target);

    // details wraps
    let details = selection.querySelectorAll('details');

    // current hash
    let hash = window.location.hash.replace('#', '');


    /**
     *  loop through details
     */

    for (let i = 0, l = details.length; l && i < l; i++) {

        let detail = details[i];

        // prevent duplicate initialization
        if (detail.classList.contains('details-enhanced-active')) {
            continue
        }

        /**
         * skip if 
         * already processed
         */
        let processed = detail.querySelector('.details-content') ? true : false;
        if (processed) return false;

        let classModifiers = '', summarMarkerStyle = '', summarMarkerAlignment = '', summaryMarkerState = '';


        /**
        * all wrap detail's content: 
        * outer wrap for grid display context
        * and inner for hidden overflow
        */
        let detailsContent = document.createElement("div");
        detailsContent.classList.add("details-content");
        let detailsContentInner = document.createElement("div");
        detailsContentInner.classList.add("details-content-inner");

        let children = [...detail.children];
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.nodeName.toLowerCase() !== "summary") detailsContentInner.append(child);
        }
        detailsContent.append(detailsContentInner);
        detail.append(detailsContent);

        /**
        * add anchor ids - if not present
        * add expanded classes for
        * auto expand targeted details by hash/anchor id
        * expand current hash
        */

        let summary = detail.querySelector('summary');
        let anchorID = summary.id;
        if (!summary.id) {
            anchorID = textToAnchorUrl(summary.textContent);

            // if ID is already reserved - add numeric suffix
            if (document.getElementById(anchorID)) {
                let len = document.querySelectorAll(`#${anchorID}`).length;
                anchorID = `${anchorID}-${len + 1}`;
            }
            summary.id = anchorID;
        }


        if (hash === anchorID) detail.open = true;
        let expanded = detail.hasAttribute("open");

        // expand when "open" attribute is set
        if (expanded) {
            detail.classList.add("details-expanded");
            summary.classList.add("summary-expanded");
            summaryMarkerState = 'summary-marker-expanded';
            detailsContent.classList.add("details-content-expanded");
        } else {
            summaryMarkerState = 'summary-marker-collapsed';
        }


        /**
         * merge options from data attribute
         * css class applied to parent, details
         * or summary element
         */

        //get summary options - highest priority
        let summaryOptions = getDetailsCSSOptions(summary)
        let summaryDataAtt = summary.dataset.details || summary.dataset.summary;
        let summaryDataOptions = summaryDataAtt ? JSON.parse(summaryDataAtt) : {};
        //console.log('summaryDataOptions', summaryDataOptions);

        summaryOptions = {
            ...summaryOptions,
            ...summaryDataOptions
        }

        let optionsFinal = summaryOptions

        if (!Object.keys(summaryOptions).length) {
            // get custom parent options
            let dataParent = detail.closest('[data-details]')
            let optionsDataDetails = dataParent ? JSON.parse(dataParent.dataset.details) : {}

            // CSS option parent
            let cssInitEl = detail.closest('.details-enhanced');
            let cssOptions = cssInitEl ? getDetailsCSSOptions(cssInitEl) : {}

            optionsFinal = {
                ...cssOptions,
                ...optionsDataDetails
            }
        }

        //extract final options
        let { icon, round, right, plus, type = '', storageName = {} } = optionsFinal;
        //console.log(target, icon, round, right, storageName);


        /** 
         * add toggle icon
         * 1. add round background
         * 2. customize icon
         */

        // custom icon from icon object or svg markup in icon property
        let markerIconCustom = summaryIcons[icon] ? summaryIcons[icon] : (icon ? icon : '');

        // round background
        if (round) {
            classModifiers = ' summary-marker-round';
        }

        // plus/minus style
        /*
        if ((icon == '+' || icon == 'plus' || plus)) {
            markerIconCustom = '';
            summarMarkerStyle = 'summary-marker-plus';
        }
            */

        if ((icon == '+' || icon == 'plus' || plus)) {
            markerIconCustom = summaryIcons['plusMinus'] ;
            summarMarkerStyle = 'summary-marker-multi summary-marker-plusminus';
        }

        if(icon==='question'){
            markerIconCustom = summaryIcons['question'] ;
            summarMarkerStyle = 'summary-marker-question';
        }

        
        // right or left alignment
        if (right) {
            summarMarkerAlignment = 'summary-marker-right';
        }

        // custom svg icon
        if (markerIconCustom) summarMarkerStyle += ' summary-marker-icon';

        let markerIcon = `<span class="summary-marker ${classModifiers} ${summarMarkerStyle} ${summarMarkerAlignment} ${summaryMarkerState}" aria-hidden="true" focusable="false">${markerIconCustom}</span>`;

        summary.insertAdjacentHTML("afterbegin", markerIcon);


        //add custom class names to prevent multiple processing
        detail.classList.add('details', 'details-enhanced', 'details-enhanced-active');
        summary.classList.add("summary");

        // add event listeners
        bindDetailsEvents(detail, detailsContent, summary, expanded, type, storageName)

        //cacheOpenDetails(optionsFinal)


    }

    bindDetailsOpenbtns()


}


/*
if (typeof window !== 'undefined') {
    window.enhanceDetails = enhanceDetails;
    enhanceDetailsAutoInit();
}
    */
