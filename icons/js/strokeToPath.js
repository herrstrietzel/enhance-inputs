
async function convertStrokePotrace(svg, scale = 1) {
    //let dataUrl = await svg2PngDataUrl(svg, scale);
    //let dataUrl = await svg2PngDataUrl(svg, scale, blob=true);
    let imageData = await svg2BmpData(svg, scale, blob=true);


    let tracingOptions = {
        turnpolicy: "majority",
        turdsize: 1,
        optcurve: true,
        alphamax: 1,
        opttolerance: 1
    };

    //console.log(svg);

    let {
        width,
        height
    } = svg.viewBox.baseVal.width ? svg.viewBox.baseVal : {
        width: svg.width.baseVal.value,
        height: svg.height.baseVal.value
    };


    // set parameters
    Potrace.setParameter(tracingOptions);

    //Potrace.loadImageFromUrl(dataUrl);

    Potrace.loadFromBmp(imageData)

    Potrace.process( ()=>{
        // scale back

        let {w, h} = imageData;

        scale = w ? w / width : 1

        // get pathData or SVG markup
        let toPathData = true;
        let tracedSVG = Potrace.getSVG(1 / scale, toPathData);

        //console.log(Potrace);

        let d = ''
        if (!toPathData) {
            let tracedPath = new DOMParser().parseFromString(tracedSVG, 'text/html').querySelector('path')
            d = tracedPath.getAttribute('d')

        } else {
            // stringify pathdata
            d = pathDataToD(tracedSVG)
        }

        let path = svg.querySelector('path');

        if(!path){
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let children = [...svg.children];
            children.forEach(child=>{child.remove()})
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


    });

}

/**
 * svg to bmp
 * image data
 */




async function svg2BmpData(el, scale = 1, filter = "") {
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
    scale = scaledW / sidelength > 1 ? scaledW / sidelength : 1;

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
    let blobURL = URL.createObjectURL(blob);

    let tmpImg = new Image();
    tmpImg.src = blobURL;
    tmpImg.width = w;
    tmpImg.height = h;
    tmpImg.crossOrigin = "anonymous";
    await tmpImg.decode();

    let ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    // apply filter to enhance contrast
    if (filter) {
        ctx.filter = filter;
    }
    ctx.drawImage(tmpImg, 0, 0, w, h);

    // remove clone
    svgEl.remove()

    let imgData = getBmpData(ctx, w, h)
    //let imgData = ctx.getImageData(0, 0, w, h)
   // let bmp = imageDataToBitmapOptimized(imgData)
    //console.log(imgData);

    return imgData;
}









async function svg2BmpData_gpt(el, scale = 1, filter = "") {

    // --- Clone SVG with explicit size ---
    const svgEl = el.cloneNode(true);
    document.body.append(svgEl);

    let { width, height } = el.getBBox();
    let w = el.viewBox.baseVal.width  || el.width.baseVal.value  || width;
    let h = el.viewBox.baseVal.height || el.height.baseVal.value || height;

    // Autoscale for better tracing accuracy
    const side = Math.min(w, h);
    const targetSide = 1000;
    scale = (targetSide / side > 1) ? (targetSide / side) : 1;
    w = w * scale;
    h = h * scale;

    svgEl.setAttribute("width",  w);
    svgEl.setAttribute("height", h);

    // Canvas
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Render SVG to image
    const svgString = new XMLSerializer().serializeToString(svgEl);
    const blobURL = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml" }));

    const img = new Image();
    img.src = blobURL;
    img.crossOrigin = "anonymous";
    await img.decode();

    // Pre-fill white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);

    // Apply native grayscale if needed
    ctx.filter = filter || "grayscale(1) contrast(1)";
    ctx.drawImage(img, 0, 0, w, h);

    svgEl.remove();
    URL.revokeObjectURL(blobURL);

    // Convert to BW bitmap
    const rgba = ctx.getImageData(0, 0, w, h).data;
    const bw = new Uint8Array(w * h);

    // Since we used native grayscale, r=g=b, take red channel only
    for (let i = 0, j = 0; i < rgba.length; i += 4, j++) {
        bw[j] = rgba[i] < 128 ? 1 : 0;
    }

    return { width:w, height:h, data: bw };
}








/**
 * svg to canvas
 */


async function svg2PngDataUrl(el, scale = 1, toObjectURL=false, filter = "") {
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
    scale = scaledW / sidelength > 1 ? scaledW / sidelength : 1;


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
    let blobURL = URL.createObjectURL(blob);

    let tmpImg = new Image();
    tmpImg.src = blobURL;
    tmpImg.width = w;
    tmpImg.height = h;
    tmpImg.crossOrigin = "anonymous";
    await tmpImg.decode();

    let ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    // apply filter to enhance contrast
    if (filter) {
        ctx.filter = filter;
    }
    ctx.drawImage(tmpImg, 0, 0, w, h);
    //create img data URL
    let dataUrl;

    if(toObjectURL){
          dataUrl = await canvas.toObjectURL();
    }else{
        dataUrl = canvas.toDataURL();
    }
    
    //console.log(dataUrl);

    document.body.append(canvas)

    // remove clone
    svgEl.remove()

    return dataUrl;
}


HTMLCanvasElement.prototype.toObjectURL = async function(
  mimeType = "image/png",
  quality = 1
) {
  return new Promise((resolve, reject) => {
    this.toBlob(
      (blob) => {
        if (!blob) {
          reject("Error creating blob");
          return;
        }

        const blobUrl = URL.createObjectURL(blob);
        resolve(blobUrl);
      },
      mimeType,
      quality
    );
  });
};
