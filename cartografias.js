const pieces = [
  ['camionQuillota','Hyundai H100','Quillota, Chile','2026'],
  ['cheryQuillota','Chery Arrizo','Quillota, Chile','2026'],
  ['civicVaplaraiso','Honda Civic','Valparaíso, Chile','2026'],
  ['vanBelgrado','Fiat Fiorino','Buenos Aires, Argentina','2025'],
  ['maxusChocada','Camioneta genérica faena','Copiapó, Chile','2025']
];
const gallery = document.querySelector('#model-gallery');
const dialog = document.querySelector('#model-dialog');
const large = document.querySelector('#large-model');
const motion = matchMedia('(prefers-reduced-motion:reduce)');
const toggle = document.querySelector('#motion-toggle');
let paused = motion.matches;
let opener;
function updateMotion(){
  toggle.setAttribute('aria-pressed', String(paused));
  toggle.setAttribute('aria-label', paused ? 'Reanudar giro' : 'Pausar giro');
  toggle.title = paused ? 'Reanudar giro' : 'Pausar giro';
  gallery.querySelectorAll('model-viewer').forEach(viewer => {
    const card=viewer.closest('.model-card');
    viewer.autoRotate = !paused && !document.hidden && !dialog.open && location.hash==='#cartografias' && !card.matches(':hover,:focus-within') && card.dataset.touched!=='true';
  });
}
for(const [file,title,place,year] of pieces){
  const card=document.createElement('article'); card.className='model-card';
  card.innerHTML=`<model-viewer data-src="assets/models/${file}.glb" alt="${title}" loading="lazy" interaction-prompt="none" camera-orbit="35deg 75deg auto" rotation-per-second="8deg" auto-rotate-delay="0" exposure="1.2"></model-viewer><span class="model-status" role="status">Cargando modelo 3D…</span><div class="model-caption"><h2>${title}</h2><p>${place} / ${year}</p></div><button class="model-open" aria-label="Abrir ${title}, ${place}, ${year}">Abrir modelo 3D</button>`;
  const viewer=card.querySelector('model-viewer');
  const status=card.querySelector('.model-status');
  viewer.addEventListener('load',()=>{status.textContent='';updateMotion();});
  viewer.addEventListener('error',()=>{status.textContent='No se pudo cargar. Abre la pieza para reintentar.';});
  for(const event of ['pointerenter','pointerleave','focusin','focusout'])card.addEventListener(event,()=>requestAnimationFrame(updateMotion));
  card.addEventListener('pointerdown',()=>{card.dataset.touched='true';updateMotion();});
  card.querySelector('button').addEventListener('click',event=>{
    opener=event.currentTarget;
    document.querySelector('#model-title').textContent=`${title} / ${place} / ${year}`;
    document.querySelector('#viewer-status').textContent='Cargando modelo 3D…';
    large.alt=title; large.src=viewer.dataset.src;
    large.cameraOrbit='35deg 75deg auto';
    dialog.showModal(); document.body.style.overflow='hidden';updateMotion();
  });
  gallery.append(card);
}
large.addEventListener('load',()=>{document.querySelector('#viewer-status').textContent='';});
large.addEventListener('error',()=>{document.querySelector('#viewer-status').textContent='No se pudo cargar el modelo. Cierra y vuelve a abrir para reintentar.';});
document.querySelector('#close-model').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus();updateMotion();});
toggle.addEventListener('click', () => { paused = !paused; if (!paused) gallery.querySelectorAll('.model-card').forEach(card => delete card.dataset.touched); updateMotion(); });
motion.addEventListener('change',()=>{paused=motion.matches;updateMotion();});
function activate(){if(location.hash==='#cartografias')gallery.querySelectorAll('model-viewer').forEach(v=>{if(!v.hasAttribute('src'))v.src=v.dataset.src;});updateMotion();}
addEventListener('hashchange',()=>{if(dialog.open)dialog.close();activate();});
document.addEventListener('visibilitychange',updateMotion);
activate();

// Native SVG cursors also remain visible inside the modal and 3D canvas.
const cursorMedia = matchMedia('(pointer:fine)');
let cursorTimer;
document.addEventListener('pointerdown', event => {
  if (!cursorMedia.matches || event.pointerType === 'touch') return;
  document.documentElement.classList.add('cursor-flash');
  clearTimeout(cursorTimer);
  cursorTimer = setTimeout(() => document.documentElement.classList.remove('cursor-flash'), 260);
});
window.addEventListener('blur', () => document.documentElement.classList.remove('cursor-flash'));
