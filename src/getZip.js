// create zip
export async function getZipUrl(files = {}) {


    const fetchBinary = async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
            console.warn("could't fetch resource")
            return null;
        }
        return new Uint8Array(await res.arrayBuffer());
    }

    const encoder = new TextEncoder();

    for (let name in files) {
        let val = files[name];
        //let exts = ['.pdf','.svg', '.jpg', '.png', '.webp', '.avif', '.mp4'];
        let isString = typeof val === 'string'
        let ext = isString && !val.includes('<') && !val.includes('>') ? val.split('.').slice(-1)[0].toLowerCase() : ''
        let isUrl = isString && (val.startsWith('http') || val.startsWith('.') || (ext && ext.length < 5))

        if (isString) {
            if (isUrl) {
                let binary = await fetchBinary(val);
                if (binary) {
                    files[name] = binary
                } else {
                    delete files[name]
                }
            }
            else {
                files[name] = encoder.encode(val)
            }
        }
    }

    let zip = UZIP.encode(files);
    let blob = new Blob([zip]);
    let url = URL.createObjectURL(blob);
    return url
}
