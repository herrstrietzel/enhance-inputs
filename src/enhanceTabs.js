export function enhanceTabs() {

    let tabGroups = document.querySelectorAll('[data-tabs]');

    tabGroups.forEach((g, i) => {

        g.classList.add('tab-group');
        let tabPanels = g.querySelectorAll('[role="tabpanel"]')
        let labels = [];

        tabPanels.forEach((tabPanel, t) => {
            let label = tabPanel.children[0]
            let labelText = label.textContent
            labels.push(labelText)
            label.remove()
            let idTabPanel = `tabPanel-${i}-${t}`
            let idLabel = `tab-${i}-${t}`
            tabPanel.setAttribute('aria-labelledby', idLabel)
            tabPanel.id = idTabPanel
            tabPanel.classList.add('tab-panel')
        })

        let tabList = `<div role="tablist" class="tablist" aria-labelledby="tablist-${i}" class="tablist">`

        labels.forEach((label, l) => {
            let selected = l === 0 ? true : false;
            let tabindex = selected ? '' : ' tabindex="-1" '
            tabList +=
                `<button class="btn-tab" id="tab-${i}-${l}" type="button" role="tab" 
                aria-selected="${selected}" 
                ${tabindex}
                aria-controls="tabPanel-${i}-${l}">
                    <span class="btn-tab-inner">${label}</span>
            </button>`
        })

        tabList += `</div>`;
        g.insertAdjacentHTML("afterbegin", tabList)

    })


    let tablists = document.querySelectorAll('[role=tablist]');
    for (var i = 0; i < tablists.length; i++) {
        initTabsAria(tablists[i])
    }

}





/**
 * Accessible Tabs (function-based)
 * Based on W3C ARIA Authoring Practices example
 * Extended to auto-activate tab if its panel gains focus (e.g., via find-in-page)
 */
function initTabsAria(groupNode) {
    let tabs = [...groupNode.querySelectorAll('[role=tab]')];
    let tabpanels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

    let firstTab = tabs[0];
    let lastTab = tabs[tabs.length - 1];

    function setSelectedTab(currentTab, setFocus = true) {
        tabs.forEach((tab, i) => {
            let isSelected = tab === currentTab;
            tab.setAttribute('aria-selected', String(isSelected));
            tab.tabIndex = isSelected ? 0 : -1;

            tabpanels[i].classList.toggle('sr-only', !isSelected);

            if (isSelected && setFocus) {
                tab.focus();
            }
        });
    }

    function setSelectedToPreviousTab(currentTab) {
        let index = tabs.indexOf(currentTab);
        let newTab = currentTab === firstTab ? lastTab : tabs[index - 1];
        setSelectedTab(newTab);
    }

    function setSelectedToNextTab(currentTab) {
        let index = tabs.indexOf(currentTab);
        let newTab = currentTab === lastTab ? firstTab : tabs[index + 1];
        setSelectedTab(newTab);
    }

    function onKeydown(event) {
        let tgt = event.currentTarget;
        let handled = false;

        switch (event.key) {
            case 'ArrowLeft':
                setSelectedToPreviousTab(tgt);
                handled = true;
                break;
            case 'ArrowRight':
                setSelectedToNextTab(tgt);
                handled = true;
                break;
            case 'Home':
                setSelectedTab(firstTab);
                handled = true;
                break;
            case 'End':
                setSelectedTab(lastTab);
                handled = true;
                break;
        }

        if (handled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    // --- Initialization ---
    tabs.forEach((tab, i) => {
        let panel = tabpanels[i];

        tab.tabIndex = -1;
        tab.setAttribute('aria-selected', 'false');

        tab.addEventListener('keydown', onKeydown);
        tab.addEventListener('click', e => setSelectedTab(e.currentTarget));




        panel.addEventListener('focusin', () => {
            console.log('focusin');
            setSelectedTab(tab, false);
        });
    });

    setSelectedTab(firstTab, false);




    document.addEventListener('selectionchange', (e) => {
        let sel = document.getSelection();

        //console.log('sel', sel, e);
        if (!sel || sel.rangeCount === 0) return;

        let node = sel.anchorNode;
        if (!node) return;

        let panel = node.nodeType === Node.ELEMENT_NODE
            ? node.closest('[role="tabpanel"]')
            : node.parentElement?.closest('[role="tabpanel"]');

        if (panel && panel.classList.contains('sr-only')) {
            let i = tabpanels.indexOf(panel);
            if (i >= 0) setSelectedTab(tabs[i], false);
        }
    });

    /*
    document.addEventListener("keypress", (e)=>{
        if (e.keyCode === 13) {
            alert("Enter was pressed was presses");
        }
    });
    */




    // Optional return API
    //return { setSelectedTab };
}


















/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *   File:   tabs-automatic.js
 *   Desc:   Tablist widget that implements ARIA Authoring Practices
 */


class TabsAria {
    constructor(groupNode) {
        this.tablistNode = groupNode;
        this.tabs = [];
        this.firstTab = null;
        this.lastTab = null;

        this.tabs = Array.from(this.tablistNode.querySelectorAll('[role=tab]'));
        this.tabpanels = [];

        //console.log(this.tabs);

        for (let i = 0; i < this.tabs.length; i += 1) {
            let tab = this.tabs[i];
            let id = tab.getAttribute('aria-controls')
            let tabpanel = document.getElementById(id);

            tab.tabIndex = -1;
            tab.setAttribute('aria-selected', 'false');
            this.tabpanels.push(tabpanel);

            tab.addEventListener('keydown', this.onKeydown.bind(this));
            tab.addEventListener('click', this.onClick.bind(this));

            if (!this.firstTab) {
                this.firstTab = tab;
            }
            this.lastTab = tab;
        }

        this.setSelectedTab(this.firstTab, false);
        //console.log('obj', this);


    }



    setSelectedTab(currentTab, setFocus) {
        if (typeof setFocus !== 'boolean') {
            setFocus = true;
        }
        for (let i = 0; i < this.tabs.length; i += 1) {
            let tab = this.tabs[i];
            if (currentTab === tab) {
                tab.setAttribute('aria-selected', 'true');
                tab.removeAttribute('tabindex');

                this.tabpanels[i].classList.remove('sr-only');

                if (setFocus) {
                    tab.focus();
                }
            } else {
                tab.setAttribute('aria-selected', 'false');
                tab.tabIndex = -1;
                this.tabpanels[i].classList.add('sr-only');
            }
        }
    }

    setSelectedToPreviousTab(currentTab) {
        let index;

        if (currentTab === this.firstTab) {
            this.setSelectedTab(this.lastTab);
        } else {
            index = this.tabs.indexOf(currentTab);
            this.setSelectedTab(this.tabs[index - 1]);
        }
    }

    setSelectedToNextTab(currentTab) {
        let index;

        if (currentTab === this.lastTab) {
            this.setSelectedTab(this.firstTab);
        } else {
            index = this.tabs.indexOf(currentTab);
            this.setSelectedTab(this.tabs[index + 1]);
        }
    }

    /* EVENT HANDLERS */

    onKeydown(event) {
        let tgt = event.currentTarget,
            flag = false;

        switch (event.key) {
            case 'ArrowLeft':
                this.setSelectedToPreviousTab(tgt);
                flag = true;
                break;

            case 'ArrowRight':
                this.setSelectedToNextTab(tgt);
                flag = true;
                break;

            case 'Home':
                this.setSelectedTab(this.firstTab);
                flag = true;
                break;

            case 'End':
                this.setSelectedTab(this.lastTab);
                flag = true;
                break;

            default:
                break;
        }

        if (flag) {
            event.stopPropagation();
            event.preventDefault();
        }
    }


    onClick(event) {
        this.setSelectedTab(event.currentTarget);
    }
}
