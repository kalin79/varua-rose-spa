import './styles/main.css';
import { initAnalytics } from './js/analytics.js';
import { initNav } from './js/nav.js';
import { initLazyPosters } from './js/media.js';

initAnalytics();
initNav();
initLazyPosters();

// GSAP va en un chunk aparte (≈49 KB gzip). La entrada del hero es CSS, así que nada visible
// al inicio depende de este JS. Se pide con la primera interacción (scroll, toque, tecla) o
// 1.8 s después del evento load, lo que ocurra primero: así no compite con el LCP.
const root = document.documentElement;
if (root.classList.contains('anim')) {
  let started = false;
  const events = ['scroll', 'pointerdown', 'touchstart', 'keydown', 'wheel'];
  const start = () => {
    if (started) return;
    started = true;
    events.forEach((e) => window.removeEventListener(e, start));
    import('./js/animations.js')
      .then(({ initAnimations }) => initAnimations())
      .catch(() => root.classList.remove('anim'));
  };
  events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
  const onLoad = () => setTimeout(start, 1800);
  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad, { once: true });
}
