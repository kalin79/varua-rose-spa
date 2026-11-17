/**
 * Narrativa de scroll — Varua Rosé Spa
 *
 * La página se cuenta como una visita al spa:
 *  1. Llegada (hero, en CSS): el titular sube palabra por palabra, la firma cursiva se "dibuja"
 *     y el marco en arco se asienta alrededor de Yanina.
 *  2. Recorrido por servicios: cada capítulo (01–05) entra con su titular, la foto se
 *     descubre como una cortina y los datos (precios, listas) se componen en secuencia.
 *  3. Cambios de atmósfera: las secciones oscuras (Tecnología, Corporal) se abren como un
 *     telón que pasa de tarjeta redondeada a pantalla completa.
 *  4. Momento emocional: la cita de Yanina se "enciende" palabra por palabra al ritmo del scroll.
 *  5. Cierre: los 3 pasos se unen con una línea dorada y el CTA final aparece con rebote.
 *
 * Reglas: solo transform/opacity/clip-path, nada bloquea el LCP (la foto del hero siempre
 * es visible), desktop y móvil separados con gsap.matchMedia(), y este módulo no se carga
 * si el usuario tiene prefers-reduced-motion.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const EASE = 'expo.out';

export function initAnimations() {
  // Si el respaldo de 6 s ya mostró todo (red muy lenta), no animamos para evitar parpadeos
  if (!document.documentElement.classList.contains('anim')) return;
  window.__animReady = true;

  progressBar();
  headings();
  scripts();
  reveals();
  cards();
  lists();
  priceCounters();
  pricelist();
  quoteWords();
  steps();
  details();

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    heroScrollOut();
    parallax(true);
    floating();
  });
  mm.add('(max-width: 1023px)', () => parallax(false));
  mm.add('(min-width: 768px)', () => curtains());

  // Las fuentes cambian alturas: recalcular posiciones de los triggers al cargarlas
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/* ---------- 0. Barra de progreso de lectura en el header ---------- */
function progressBar() {
  gsap.to('[data-progress]', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });
}

/* ---------- 1. Llegada: la entrada del hero está en CSS (main.css, @layer motion)
   para no depender de este chunk y no retrasar el LCP. Aquí solo su salida al hacer scroll. */
function heroScrollOut() {
  const st = { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('[data-hero-figure]', { yPercent: -8, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__badge', { y: -60, ease: 'none', scrollTrigger: { ...st } });
}

/* ---------- Texto cursivo que se "escribe" de izquierda a derecha ---------- */
function writeIn(el, duration = 1.4) {
  return gsap.fromTo(el,
    { autoAlpha: 1, clipPath: 'inset(-30% 100% -30% -10%)' },
    { clipPath: 'inset(-30% -10% -30% -10%)', duration, ease: 'power2.inOut', clearProps: 'clipPath' });
}

function scripts() {
  $$('[data-script]').forEach((el) => {
    const tw = writeIn(el, 1.6);
    tw.pause();
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => tw.play() });
  });
}

/* ---------- 2. Titulares de capítulo: líneas que suben desde una máscara ---------- */
function headings() {
  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit(self) {
        gsap.set(el, { autoAlpha: 1 });
        return gsap.from(self.lines, {
          yPercent: 105, duration: 1.15, stagger: 0.1, ease: EASE,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        });
      },
    });
  });

  // Eyebrows y la línea dorada bajo "Cinco maneras de cuidarte"
  ScrollTrigger.batch('[data-eyebrow]', {
    start: 'top 92%', once: true,
    onEnter: (b) => gsap.fromTo(b, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' }),
  });
  $$('[data-draw]').forEach((el) => {
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
}

/* ---------- Apariciones genéricas en lote (párrafos, botones, bloques) ---------- */
function reveals() {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: (b) => gsap.fromTo(b, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, overwrite: true }),
  });

  ScrollTrigger.batch('[data-chips] .chip', {
    start: 'top 94%', once: true,
    onEnter: (b) => gsap.fromTo(b, { autoAlpha: 0, scale: 0.85, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.8)', stagger: 0.05 }),
  });

  // Micropigmentación: tarjetas desde la izquierda, video desde la derecha
  $$('[data-slide]').forEach((el) => {
    const right = el.dataset.slide === 'right';
    gsap.fromTo(el,
      { autoAlpha: 0, x: right ? 80 : -80, rotate: right ? 3 : 0 },
      { autoAlpha: 1, x: 0, rotate: 0, duration: 1.3, ease: EASE, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  $$('[data-spin]').forEach((el) => {
    gsap.from(el, { rotate: -120, scale: 0.5, duration: 1.4, ease: 'back.out(1.4)', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Antes y después: la transformación se revela con el scroll (wipe izquierda → derecha)
  $$('[data-wipe]').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(0% 100% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 85%', end: 'center 55%', scrub: 0.6 },
    });
    gsap.from($('img', el), { scale: 1.2, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'center 55%', scrub: 0.6 } });
  });

  // Fotos sueltas: se descubren como cortina (de abajo o desde la izquierda)
  $$('[data-clip]').forEach((el) => {
    if (el.closest('[data-card]')) return; // las tarjetas tienen su propia animación
    const from = el.dataset.clip === 'left' ? 'inset(0% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)';
    const img = $('img', el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    tl.fromTo(el, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut' });
    // Las fotos con parallax ya tienen su propia escala; no se la pisamos
    if (img && !img.hasAttribute('data-parallax')) tl.from(img, { scale: 1.3, duration: 1.8, ease: 'power3.out' }, 0);
  });

  // Foto de Yanina: el arco "crece" desde abajo
  $$('[data-arch]').forEach((el) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power4.inOut' })
      .from($('img', el), { scale: 1.35, duration: 2, ease: 'power3.out' }, 0);
  });
}

/* ---------- Tarjetas de galería (faciales, tecnología, miradas, corporal) ---------- */
function cards() {
  ScrollTrigger.batch('[data-card]', {
    start: 'top 92%', once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.1, overwrite: true });
      const imgs = batch.map((c) => $('img', c)).filter(Boolean);
      gsap.fromTo(imgs, { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'power3.out', stagger: 0.1, clearProps: 'transform' });
    },
  });
}

/* ---------- Listas: viñetas que brotan y líneas que se dibujan ---------- */
function lists() {
  $$('[data-dots]').forEach((ul) => {
    const items = $$('li', ul);
    gsap.timeline({ scrollTrigger: { trigger: ul, start: 'top 88%', once: true } })
      .fromTo(items, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07 })
      .to(items, { '--dot': 1, duration: 0.5, ease: 'back.out(3)', stagger: 0.07 }, 0.15);
  });
  $$('[data-rules]').forEach((ul) => {
    const items = $$('li', ul);
    gsap.timeline({ scrollTrigger: { trigger: ul, start: 'top 88%', once: true } })
      .to(items, { '--line': 1, duration: 0.9, ease: 'power3.inOut', stagger: 0.08 })
      .fromTo(items, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, 0.15);
  });
}

/* ---------- Precios de faciales: el número cuenta hasta su valor ---------- */
function priceCounters() {
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    el.textContent = '0';
    gsap.to(obj, {
      v: end, duration: 1.6, ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* ---------- Depilación: la carta de precios se compone fila por fila ---------- */
function pricelist() {
  const list = $('[data-pricelist]');
  if (!list) return;
  const rows = $$('li', list);
  gsap.set(rows, { autoAlpha: 1 });
  gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 82%', once: true } })
    .from(rows.map((r) => $('.pricelist__name', r)), { autoAlpha: 0, y: 18, duration: 0.7, ease: 'power3.out', stagger: 0.09 })
    .from(rows.map((r) => $('.pricelist__dots', r)), { scaleX: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.09 }, 0.15)
    .from(rows.map((r) => $('.pricelist__price', r)), { autoAlpha: 0, x: 20, duration: 0.6, ease: 'power3.out', stagger: 0.09 }, 0.45);
}

/* ---------- 4. La cita de Yanina se enciende palabra por palabra ---------- */
function quoteWords() {
  $$('[data-words]').forEach((el) => {
    // aria 'none': el <p> no admite aria-label; el texto sigue completo en el DOM
    const split = SplitText.create(el, { type: 'words', aria: 'none' });
    // Rosa apagado (#9F7D89, 4.2:1 sobre el vino) -> color final de cada palabra
    gsap.fromTo(split.words, { color: '#9F7D89' }, {
      color: (i, w) => getComputedStyle(w).color, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.5 },
    });
  });
}

/* ---------- 5. Pasos para agendar unidos por una línea dorada ---------- */
function steps() {
  const list = $('[data-steps]');
  if (!list) return;
  const items = $$('.step', list);
  gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 80%', once: true } })
    .fromTo(items, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1, ease: EASE, stagger: 0.22 })
    .from(items.map((i) => $('.step__num', i)), { yPercent: 60, autoAlpha: 0, scale: 0.6, duration: 0.9, ease: 'back.out(2)', stagger: 0.22 }, 0.2);

  const line = $('[data-steps-line]');
  if (line) {
    gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 75%', end: 'top 35%', scrub: 0.6 } });
  }
}

/* ---------- Detalles: logo de Yanina y botón del CTA final ---------- */
function details() {
  const logo = $('[data-logo]');
  if (logo) {
    gsap.fromTo(logo, { autoAlpha: 0, rotate: -90, scale: 0.5 }, {
      autoAlpha: 1, rotate: 0, scale: 1, duration: 1.4, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: logo, start: 'top 88%', once: true },
    });
  }
  const cta = $('[data-cta-btn]');
  if (cta) {
    gsap.fromTo(cta, { autoAlpha: 0, scale: 0.8, y: 20 }, {
      autoAlpha: 1, scale: 1, y: 0, duration: 1.1, ease: 'back.out(1.8)',
      scrollTrigger: { trigger: cta, start: 'top 92%', once: true },
    });
  }
}

/* ---------- Parallax de fotos (más intenso en desktop) ---------- */
function parallax(isDesktop) {
  const amount = isDesktop ? 7 : 4;
  $$('[data-parallax]').forEach((img) => {
    const wrap = img.parentElement;
    gsap.set(img, { scale: 1.16 });
    gsap.fromTo(img, { yPercent: -amount }, {
      yPercent: amount, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* Fotos de depilación flotando a distinta velocidad (solo desktop) */
function floating() {
  $$('[data-speed]').forEach((el) => {
    const s = Number(el.dataset.speed);
    gsap.fromTo(el, { y: -s * 6 }, {
      y: s * 6, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* ---------- 3. Telón: secciones oscuras que se abren a pantalla completa ---------- */
function curtains() {
  $$('[data-curtain]').forEach((sec) => {
    gsap.fromTo(sec,
      { clipPath: 'inset(0% 4% 0% 4% round 48px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 20%', scrub: 0.5 },
      });
  });
}
