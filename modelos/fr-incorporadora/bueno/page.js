const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Lightbox da galeria
  const figs = [...document.querySelectorAll('.gal figure')];
  const items = figs.map(f => ({
    src: f.querySelector('img').src,
    alt: f.querySelector('img').alt,
    cap: (f.querySelector('figcaption') || {}).textContent || ''
  }));
  const lb = document.getElementById('lb');
  const lbImg = document.getElementById('lb-img');
  const lbLabel = document.getElementById('lb-label');
  const lbCount = document.getElementById('lb-count');
  let cur = 0;
  function show(i){
    cur = (i + items.length) % items.length;
    lbImg.src = items[cur].src;
    lbImg.alt = items[cur].alt;
    lbLabel.textContent = items[cur].cap;
    lbCount.textContent = (cur + 1) + ' / ' + items.length;
  }
  function openLb(i){ show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeLb(){ lb.classList.remove('open'); document.body.style.overflow = ''; }
  figs.forEach((f, i) => f.addEventListener('click', () => openLb(i)));
  document.getElementById('lb-close').addEventListener('click', closeLb);
  document.getElementById('lb-prev').addEventListener('click', (e) => { e.stopPropagation(); show(cur - 1); });
  document.getElementById('lb-next').addEventListener('click', (e) => { e.stopPropagation(); show(cur + 1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  let tx = null;
  lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 48) show(cur + (dx < 0 ? 1 : -1));
    tx = null;
  }, {passive:true});
