/**
 * get black and white bitmap data
 */
function getBmpData(ctx, width, height) {

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


function Bitmap(w, h) {
    this.w = w;
    this.h = h;
    this.size = w * h;
    this.arraybuffer = new ArrayBuffer(this.size);
    this.data = new Int8Array(this.arraybuffer);
}

Bitmap.prototype.at = function (x, y) {
    return (x >= 0 && x < this.w && y >= 0 && y < this.h) &&
        this.data[this.w * y + x] === 1;
};

Bitmap.prototype.index = function (i) {
    let pt = {x:0, y:Math.floor(i / this.w)};
    pt.x = i - pt.y * this.w;
    return pt;
};

Bitmap.prototype.flip = function (x, y) {
    if (this.at(x, y)) {
        this.data[this.w * y + x] = 0;
    } else {
        this.data[this.w * y + x] = 1;
    }
};

Bitmap.prototype.copy = function () {
    var bm = new Bitmap(this.w, this.h), i;
    for (i = 0; i < this.size; i++) {
        bm.data[i] = this.data[i];
    }
    return bm;
};



