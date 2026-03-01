export const {
    abs, acos, asin, atan, atan2, ceil, cos, exp, floor,
    log, hypot, max, min, pow, random, round, sin, sqrt, tan, PI
} = Math;


// get quer params
export const queryParams = Object.fromEntries(new URLSearchParams(document.location.search));

export const enhanceDetailsSettings = {};
export let enhanceDetailsOpen = {};
