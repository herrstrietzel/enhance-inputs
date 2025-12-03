
async function convertStrokePotrace(svg) {

    let imageData = await svg2BmpData(svg, blob = true);

    let {
        width,
        height
    } = svg.viewBox.baseVal.width ? svg.viewBox.baseVal : {
        width: svg.width.baseVal.value,
        height: svg.height.baseVal.value
    };

    let { w } = imageData;
    scale = w ? w / width : 1;

    let tracingOptions = {
        turnpolicy: "majority",
        turdsize: 1,
        optcurve: true,
        alphamax: 1,
        opttolerance: 1,
        returnPathData: true,
        scale
    };

    let svg2 = potraceBmp(imageData, tracingOptions)
    let d = pathDataToD(svg2)

    let path = svg.querySelector('path');

    if (!path) {
        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let children = [...svg.children];
        children.forEach(child => { child.remove() })
        svg.append(path)
    }

    // replace pathdata
    path.setAttribute('d', d)

    svg.removeAttribute('width')
    svg.removeAttribute('height')
    svg.setAttribute('stroke', 'none')
    svg.removeAttribute('stroke-width')
    svg.removeAttribute('stroke-linecap')
    svg.setAttribute('fill', '#000')


    // remove obsolete attributs
    path.setAttribute('stroke', 'none')
    path.removeAttribute('stroke-width')
    path.removeAttribute('stroke-linecap')
    path.setAttribute('fill', '#000')

}

/**
 * svg to bmp
 * image data
 */


async function svg2BmpData(el, filter = "") {
    /**
     *  clone svg to add width and height
     * for better compatibility
     * without affecting the original svg
     */
    const svgEl = el.cloneNode(true);
    document.body.append(svgEl)

    // get dimensions
    let {
        width,
        height
    } = el.getBBox();

    let w = el.viewBox.baseVal.width ?
        svgEl.viewBox.baseVal.width :
        el.width.baseVal.value ?
            el.width.baseVal.value :
            width;
    let h = el.viewBox.baseVal.height ?
        svgEl.viewBox.baseVal.height :
        el.height.baseVal.value ?
            el.height.baseVal.value :
            height;


    // autoscale for better tracing results
    let sidelength = Math.min(w, h)
    let scaledW = 1000
    let scale = scaledW / sidelength > 1 ? scaledW / sidelength : 1;

    // apply scaling
    [w, h] = [w * scale, h * scale];

    // add width and height for firefox compatibility
    svgEl.setAttribute("width", w);
    svgEl.setAttribute("height", h);

    // create canvas
    let canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    // create blob
    let svgString = new XMLSerializer().serializeToString(svgEl);
    let blob = new Blob([svgString], {
        type: "image/svg+xml"
    });

    let objectUrl = URL.createObjectURL(blob);

    // create temporary image
    let tmpImg = new Image();
    tmpImg.src = objectUrl;
    tmpImg.width = w;
    tmpImg.height = h;
    tmpImg.crossOrigin = "anonymous";

    // wait for image
    await tmpImg.decode();

    /**
     * render to canvas 
     * get 1-bit image data for
     * potrace
     */
    //let ctx = canvas.getContext("2d");
    let ctx = canvas.getContext("2d", { willReadFrequently: true });

    //ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);

    // apply filter to enhance contrast
    if (filter) {
        ctx.filter = filter;
    }
    ctx.drawImage(tmpImg, 0, 0, w, h);

    // remove clone
    svgEl.remove()
    URL.revokeObjectURL(objectUrl);


    // black and white image
    let imageData = ctx.getImageData(0, 0, w, h);
    let bmp = imageDataTo1Bit(imageData);
    return bmp

}





/**
 * get black and white bitmap data
 */

function imageDataTo1Bit(imageData) {
    let { data, width, height } = imageData;
    let bmp = new Bitmap(width, height);
    let l = data.length, color;
    //console.log(imageData);
    for (let i = 0, j = 0; i < l; i += 4, j++) {
        /*
        color = 0.2126 * data[i] + 0.7153 * data[i + 1] +
            0.0721 * data[i + 2];
        */
        color = data[i];
        bmp.data[j] = (color < 128 ? 1 : 0);
    }
    //console.log(bmp);
    return bmp;
}


/*
function getBmpDataFromCtx(ctx, width, height) {

    let bm = new Bitmap(width, height);
    let imgdataobj = ctx.getImageData(0, 0, width, height);

    let l = imgdataobj.data.length, color;
    for (let i = 0, j = 0; i < l; i += 4, j++) {
        color = 0.2126 * imgdataobj.data[i] + 0.7153 * imgdataobj.data[i + 1] +
            0.0721 * imgdataobj.data[i + 2];
        bm.data[j] = (color < 128 ? 1 : 0);
    }

    return bm;
}
*/

