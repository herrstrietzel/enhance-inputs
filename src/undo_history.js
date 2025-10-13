
export function attachUndoRedoSupport(inputsOrForm) {
    const historyMap = new Map();
    let inputs = [];

    // Normalize to array of inputs
    if (inputsOrForm instanceof HTMLFormElement) {
        inputs = inputsOrForm.querySelectorAll('input[name], textarea[name], select[name]');
    } else if (inputsOrForm instanceof NodeList || Array.isArray(inputsOrForm)) {
        inputs = inputsOrForm;
    } else if (typeof inputsOrForm === 'string') {
        inputs = document.querySelectorAll(inputsOrForm);
    } else {
        throw new Error("attachUndoRedoSupport expects a form, array of inputs, or selector string.");
    }

    function createFieldHistory(field) {
        const history = { stack: [], index: -1 };
        historyMap.set(field, history);
    }

    function pushState(field, value) {
        const history = historyMap.get(field);
        if (!history) return;
        //if (history.stack[history.index] === value) return; // skip duplicates
        history.stack = history.stack.slice(0, history.index + 1);
        history.stack.push(value);
        history.index++;
    }

    function undoField(field) {
        const history = historyMap.get(field);
        console.log(history);

        if (history && history.index > 0) {
            history.index--;
            let value = history.stack[history.index];
            //value = value === 'true' ? true : (value === 'false' ? false : value);

            if (field.type === 'checkbox') {
                console.log('checkbox', value, field);
                if (value === 'on') {
                    console.log('deact');
                    field.checked = false;
                }else{
                    console.log('act');

                    field.checked = true;
                }
            } else {
                field.value = history.stack[history.index];

            }
        }
    }

    function redoField(field) {
        const history = historyMap.get(field);
        if (history && history.index < history.stack.length - 1) {
            history.index++;
            field.value = history.stack[history.index];
        }
    }

    function onInput(e) {
        const field = e.target;
        if (!historyMap.has(field)) createFieldHistory(field);
        pushState(field, field.value);
    }

    // Initialize tracking
    inputs.forEach(field => {
        createFieldHistory(field);
        pushState(field, field.value); // initial state
        field.addEventListener('input', onInput);
        field.addEventListener('change', onInput);
    });

    // Keyboard shortcuts (attached globally for simplicity)
    document.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        if (!historyMap.has(active)) return;

        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {

            console.log('undo', historyMap);
            e.preventDefault();
            undoField(active);
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
            e.preventDefault();
            redoField(active);
        }
    });

    // API
    return {
        undo(field = document.activeElement) {
            if (historyMap.has(field)) undoField(field);
        },
        redo(field = document.activeElement) {
            if (historyMap.has(field)) redoField(field);
        },
        getHistory(field) {
            return historyMap.get(field);
        }
    };
}




export function bindToMainForm(inputs, formId = 'mainForm') {
    inputs.forEach(inp => {
        inp.setAttribute('form', formId)
    })
}