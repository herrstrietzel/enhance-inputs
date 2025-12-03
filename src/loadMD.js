export async function loadMDs() {

    let mdTargets = document.querySelectorAll("[data-md]");

    if (mdTargets.length && typeof makeMDP !== 'function') {
        console.warn('no md parser available');
    }

    for (let i = 0, len = mdTargets.length; len && i < len; i++) {
        let target = mdTargets[i];
        let mdUrl = target.dataset.md;
        let markdown = mdUrl
            ? await (await fetch(mdUrl)).text()
            : target.innerHTML.trim();

        let mdp = makeMDP();
        let html = mdp.render(markdown);
        target.innerHTML = html


        let anchors = target.querySelectorAll('[id]')
        anchors.forEach(el=>{
            el.id = el.id.toLocaleLowerCase()
        })

    }
}