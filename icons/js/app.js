//import { convertPathData } from "../../../../opentype-helpers/opentype-helpers/src/pathData_convert";

let svg = document.querySelector(".preview svg");
//let path = svg.querySelector("path");
let scale = 0.1;



let settings = enhanceInputsSettings;

console.log(settings);
let svgs = [];

// load font file
inputFile.addEventListener("input", async (e) => {

    // reset
    svgs = [];

    let files = [...e.currentTarget.files];
    svgs = await loadSVGs(files)
    //console.log(svgs);


    /**
     * concatenate svg markup and
     * parse
     */

    //let names = svgs.map(svg=>svg.name)
    let data = svgs.map(svg => svg.data)
    let svgMarkup = data.join('');
    let doc = new DOMParser().parseFromString(svgMarkup, 'text/html').documentElement;
    let svgEls = doc.querySelectorAll('svg');
    console.log('svgEls', svgEls);

    let ns = "http://www.w3.org/2000/svg";
    //let svgSprite='<svg xmlns="http://www.w3.org/2000/svg">';
    let sprite = document.createElementNS(ns, 'svg');

    svgEls.forEach((svg, i) => {

        // create symbols
        let viewBox = svg.getAttribute('viewBox') || '0 0 24 24';
        let symbol = document.createElementNS(ns, 'symbol');
        symbol.setAttribute('viewBox', viewBox);

        // get id from existing ID attribute or filename
        let id = svg.id || svgs[i].name.split('.').slice(0, -1).join('');
        symbol.id = id;

        //let children = [...svg.children].map(child=>child.cloneNode(true));
        let children = svg.querySelectorAll('path, rect, circle, ellipse, line, polygon, polyline')
        //.map(child=>child.cloneNode(true));
        let allowedEls = 'path, rect, circle, ellipse, line, polygon, polyline'.split(', ')


        let pathData = []

        let options =
        {
            //toAbsolute: true,
            toRelative: true,
            toShorthands: true,
            //arcToCubic: false,
            decimals: 1
        }

        for (let i = 0, l = children.length; l && i < l; i++) {
            let child = children[i];
            let nodeName = child.nodeName.toLowerCase();

            /*
            if (!allowedEls.includes(nodeName)) {
                console.log('not', nodeName);
                continue;
            }
            */

            let pathDataChild = child.getPathDataConverted();
            pathData.push(...pathDataChild)
        }

        pathData = convertPathData(pathData, options)
        let d = pathDataToD(pathData)
        let pathOpt = document.createElementNS(ns, 'path');
        pathOpt.setAttribute('d', d)

        //symbol.append(...children)
        symbol.append(pathOpt)
        sprite.append(symbol)

        console.log();

    })

    console.log('sprite', sprite, svgEls[0].outerHTML);





});



async function loadSVGs(files = []) {

    // Create array of promises
    const promises = files.map(async (file) => {
        const data = await file.text();
        let name = file.name;
        return { data, name };
    });

    // Wait for all files to be read
    let svgs = await Promise.all(promises);
    console.log(svgs);

    return svgs;
}


(async () => {
    //convertStrokePotrace(path, scale)
    let t0 = performance.now()
    await convertStrokePotrace(svg, scale)

    let t1 = performance.now()-t0;
    console.log(t1);
})();

