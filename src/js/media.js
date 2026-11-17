// Las portadas (poster) de los videos se piden solo cuando el video se acerca al viewport.
// Con el atributo poster normal el navegador las descarga al inicio (≈70 KB que compiten con el LCP).
export function initLazyPosters() {
  const videos = document.querySelectorAll('video[data-poster]');
  // BASE_URL antepone la subcarpeta cuando el sitio vive en GitHub Pages (/nombre-del-repo/)
  const base = import.meta.env.BASE_URL;
  const setPoster = (v) => { v.poster = base + v.dataset.poster.replace(/^\//, ''); v.removeAttribute('data-poster'); };
  if (!('IntersectionObserver' in window)) { videos.forEach(setPoster); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { setPoster(e.target); io.unobserve(e.target); } });
  }, { rootMargin: '600px 0px' });
  videos.forEach((v) => io.observe(v));
}
