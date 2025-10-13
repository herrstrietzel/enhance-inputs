
export function bindDarkmodeBtn() {
    // dark mode toggle
    let inputDarkmode = document.getElementById('inputDarkmode')
    if (inputDarkmode) {
        inputDarkmode.addEventListener('input', (e) => {
            if (inputDarkmode.checked) {
                document.body.classList.add('darkmode')
            }
            else {
                document.body.classList.remove('darkmode')
            }
        })
    }


} 