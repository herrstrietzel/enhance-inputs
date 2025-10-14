# Enhance-inputs

A library to enhance native HTML inputs by additional functionality or just deuglify their default styles.

**Disclaimer** Don't use it in production environments! This library was written for my own github repo demos and webapp helper UIs.
However, feel free to use it or report bugs.


## Features
Multiple input elements are enhanced
* adds stylable SVG icons to various input types
* setting cache: you can  store updated input values either to local storage or via updated URL query parameters that can be used for sharing


## Usage

### Load CSS and script
```
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/enhance-inputs@latest/dist/enhanceInputs.css">
    <script src="https://cdn.jsdelivr.net/npm/enhance-inputs@latest/dist/enhanceInputs.js"></script>
```
Or use a local path.

### Init 

#### 1. Auto init
For auto initialisation just add a data attribute to a container containing inputs that should be enhanced

```
<body  data-enhance-inputs=''>

    <p>
        <label class="label">date</label>
        <input type="date" name="date">
    </p>

</body>
```

#### 2. Manual init

```
let options = {
    storageName: 'enhance_settings',
    parent: 'main',
    selector: 'input, select, textarea',
    cacheToUrl:true,
    cacheToStorage:false,
}

// all settings are nor stored and updated on inputs to this cariable
let settings = enhanceInputs(options);
```


#### 3. Listen to setting updates
By default `enhanceInputs()` returns a global setting variable that's updated on any input event.
Input updates trigger a custom event "settingsChange" you can use for custom UI processing.

```
document.addEventListener('settingsChange', () => {
    console.log('Settings changed:', settings);
});
```