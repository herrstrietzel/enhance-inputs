
export function bindMenuOpen(){
  let anchors = document.querySelectorAll('[data-menu-anchor]')  
  anchors.forEach((anchor,i)=>{
    
    let anchorName = `--menu-anchor-${i}`;
    anchor.style.anchorName = anchorName;

    let target = anchor.dataset.menuAnchor
    let menuEl = document.querySelector(`[data-menu="${target}"]`)
    menuEl.style.positionAnchor = anchorName;

    anchor.addEventListener('click', e=>{
      let current = e.currentTarget;
      
      if(current.classList.contains('menu-btn-active')){
        current.classList.remove('menu-btn-active')
        menuEl.classList.remove('menu-active')
      }else{
        current.classList.add('menu-btn-active')
        menuEl.classList.add('menu-active')
      }
    })
    
  })
}


