

function getCodeLang(el) {
    let classes = Array.from(el.classList);
    let classLang = classes.find((c) => c.startsWith("lang-") || c.startsWith("language-")) ||
        "";
    classLang = classLang ? classLang.split("-")[1] : "";
    let lang = el.dataset.codeLang || (classLang ? classLang : "html");
    return lang;

}

export function enhanceCode() {
    let els = [...document.querySelectorAll("[data-code], [class*=language-], pre[class*=lang-]")];

    for (let i = 0, l = els.length; l && i < l; i++) {
        let el = els[i];

        // get language from class
        let classes = Array.from(el.classList) || [];
        let lang = getCodeLang(el);


        let nodeName = el.nodeName.toLowerCase();
        let raw = nodeName === "textarea" ? el.value : el.innerHTML;

        // remove indentation
        raw = stripIndent(raw);

        // don't transform if its already pre or code
        let pre = el.closest("pre");
        let code = el.querySelector("code");

        if (!pre) pre = document.createElement("pre");
        pre.classList.add(
            ...classes,
            `language-${lang}`,
            "pre-prism",
            "scroll-content"
        );

        if (!code) {
            code = document.createElement("code");
            code.textContent = raw;
            pre.append(code);

            // Clean replacement
            el.replaceWith(pre);
        }

        normalizePreCodeSpacing(pre)
        code.textContent = stripIndent(code.textContent);



        addCodeUI(pre, code, lang);

        // Build elements safely
        code.classList.add(`language-${lang}`, "code-prism");
    }
    bindCodeSelectAll();
}



export function bindCodeSelectAll(selector = 'code') {
    let els = document.querySelectorAll(selector);
    els.forEach(el => {
        el.setAttribute('tabindex', '0')
        bindElementSelectAll(el);
    })
}

export function bindElementSelectAll(el) {
    el.addEventListener("keydown", (e) => {
        const isSelectAll = (e.key === "a" || e.key === "A") && (e.ctrlKey || e.metaKey);
        //console.log('select', el, e.key)

        if (isSelectAll) {
            e.preventDefault();
            // Create a selection covering the block's contents
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(el);

            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
}



function addCodeUI(pre, code, lang = "html") {
    /*
    let uiWrap = `<header class="pre-header">
       <p class="pre-p p-code-lang" tabindex="-1">${lang}</p>
       <button type="button" class="pre-btn btn-copy" aria-label="copy code" title="copy code">
            <svg aria-hidden="true" viewBox="0 0 24 24" class="icn-svg"><path d="M8 6a2.3 2.3 90 012.2-2.2h7a2.3 2.3 90 012.2 2.2v8.3m-5.9-6.2-7.5 0a2.3 2.3 90 00-2.3 2.2v7.5a2.3 2.3 90 002.3 2.3h7.5a2.3 2.3 90 002.2-2.3v-1.5m-2.2-8.2a2.3 2.3 90 012.2 2.2v6"/></svg>
       </button>
        </header>`;
    */

    let uiWrap = `<header class="pre-header">
       <p class="pre-p p-code-lang" tabindex="-1">${lang}</p>
       <button type="button" class="pre-btn btn-copy" aria-label="copy code" title="copy code" data-icon="copy">
       </button>
        </header>`;


    pre.insertAdjacentHTML("afterbegin", uiWrap);

    //<textarea class="input-copy sr-only" tab-index="-1"></textarea>

    let btnCopy = pre.querySelector(".btn-copy");
    bindCopyBtn(btnCopy, pre, "code");
}

export function bindCopyBtn(btn, parent, sel = "") {
    if (!btn || !sel) return;
    // events already attached
    if (btn.classList.contains("btn-active")) return;

    let code = parent.querySelector(sel);
    let input = parent.querySelector(".input-copy");
    const inIframe = window.self !== window.top;

    // create hidden textarea if clipboard API is not available
    if (!input && inIframe) {
        input = document.createElement("textarea");
        input.classList.add('sr-only');

        /*
        input.style.cssText = `clip-path: inset(100%);height: 1px;width: 1px;overflow: hidden;position: absolute;white-space: nowrap;margin: -1px;left:0;`;
        */
        input.setAttribute("tabindex", "-1");
        parent.append(input);
    }

    btn.addEventListener("click", (e) => {
        let text = code.textContent;

        if (!inIframe && navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {

            // populate textarea with pre content to enable copying
            if (input) {
                input.value = text;
                input.focus();
                input.select();
                document.execCommand("copy");
            }
        }
    });

    btn.classList.add("btn-active");
}


export function normalizePreCodeSpacing(pre) {
  if (!pre) return;

  // Trim whitespace right after <pre> and before <code>
  const first = pre.firstChild;
  if (first && first.nodeType === Node.TEXT_NODE) {
    first.textContent = first.textContent.replace(/^\s+/, "");
  }

  // Trim whitespace right before </pre>, after </code>
  const last = pre.lastChild;
  if (last && last.nodeType === Node.TEXT_NODE) {
    last.textContent = last.textContent.replace(/\s+$/, "");
  }
}


export function stripIndent(str) {
    // Normalize newlines
    str = str.replace(/\r\n/g, "\n");
    let lines = str.split("\n");

    // Find the first non-empty line
    let firstLine = lines.find((line) => line.trim() !== "");

    if (!firstLine) {
        return str; // string is empty or whitespace only
    }

    // Detect indentation from the first non-empty line
    const match = firstLine.match(/^(\s+)/);
    if (!match) {
        // First line has no indentation → nothing to strip
        return str.trim();
    }

    const indentSize = match[1].length;
    const regex = new RegExp(`^\\s{${indentSize}}`);

    // Strip that indentation from all lines
    let out = lines.map((line) => line.replace(regex, "")).join("\n");

    // Remove extra blank lines at start/end
    return out.replace(/^\n+|\n+$/g, "");
}

export function updatePre(pre, newCode = "", newLang = "html") {
    let code = pre.querySelector("code");
    let classes = Array.from(pre.classList);
    let classLang =
        classes.find((c) => c.startsWith("lang-") || c.startsWith("language-")) ||
        "";

    if (classLang) {
        pre.classList.replace(classLang, `language-${newLang}`);
        code.classList.replace(classLang, `language-${newLang}`);
    }

    // update code header
    let pLang = pre.querySelector(".p-code-lang");
    if (pLang) pLang.textContent = newLang;
    code.textContent = newCode;
    Prism.highlightElement(code);
}