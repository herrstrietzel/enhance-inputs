
export function initDraggables(limitToParent = false, draggableClass = "draggable") {
    let draggables = document.querySelectorAll('.draggable')
    draggables.forEach(el => {
        makeDraggable(el, limitToParent, draggableClass)
    })
}



export function makeDraggable(
  el,
  limitToParent = false,
  draggableClass = "draggable"
) {
  let active = null;
  let svg = el.parentNode.closest("svg");
  let pt;
  let parent = el.parentNode;
  //let sortable = el.closest(".draggable-sort");
  //if (sortable) limitToParent = true;

  //let isHandle = el.classList.contains('.drag-handle')
  //let dragTarget = !isHandle ? el : el.closest('.draggable')

  // transforms
  let mtx = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    translateX = 0,
    translateY = 0;

  // get svg user space coordinates
  const screen2SVG = (svg, x, y, mtx = null) => {
    let pt = new DOMPoint(x, y);
    mtx = mtx ? mtx : svg.getScreenCTM().inverse();
    return pt.matrixTransform(mtx);
  };

  // Parse current CSS transform (matrix)
  const getMatrix = (el) => {
    let mtx = getComputedStyle(el).transform;
    return new DOMMatrix(mtx);
  };

  // Apply absolute translation (not incremental)
  function applyTransform(el, mtx) {
    el.style.transform = `matrix(${mtx.a}, ${mtx.b}, ${mtx.c}, ${mtx.d}, ${mtx.e}, ${mtx.f})`;
  }

function start(e) {
    const handle = e.target.closest('.drag-handle');
    const dragTarget = e.target.closest('.' + draggableClass);

    // Not clicking any draggable
    if (!dragTarget) return;

    // Only start if this click belongs to our draggable
    if (dragTarget !== el) return;

    // Check if this draggable contains ANY handles
    const hasHandle = !!el.querySelector('.drag-handle');

    // CASE 1: Clicked a handle → always allow
    if (handle && handle.closest('.' + draggableClass) === el) {
        // continue to drag
    }
    // CASE 2: Clicked directly on the draggable (empty background) → allow
    else if (e.target === el) {
        // continue to drag
    }
    // CASE 3: Clicked inside child content → allow only if there are NO handles
    else if (!hasHandle) {
        // continue to drag
    }
    // Otherwise: block drag
    else {
        return;
    }

    // --- START DRAG LOGIC ---
    active = el;

    pt = { x: e.clientX, y: e.clientY };
    if (svg) pt = screen2SVG(svg, pt.x, pt.y);

    mtx = getMatrix(el);

    mtx.e = pt.x - mtx.e;
    mtx.f = pt.y - mtx.f;
    translateX = mtx.e;
    translateY = mtx.f;

    e.preventDefault();
}



  function move(e) {
    if (!active) return;
    e.preventDefault();

    // original mouse coordinates
    let pt = { x: e.clientX, y: e.clientY };

    // check element in point
    if (limitToParent) {
      let els = document.elementsFromPoint(pt.x, pt.y);

      if (!els.includes(parent)) {
        return;
      }
    }

    // convert screen to svg coordinates
    if (svg) pt = screen2SVG(svg, pt.x, pt.y);

    // get deltas
    let dx = pt.x - translateX;
    let dy = pt.y - translateY;

    // store delta values
    el.dataset.delta = [dx, dy].join(" ");

    // update matrix and apply
    mtx.e = dx;
    mtx.f = dy;
    applyTransform(active, mtx);
    //applyTransform(dragTarget, mtx);
    
  }

  function end() {
    active = null;
  }

  el.addEventListener("mousedown", start);
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", end);
}
