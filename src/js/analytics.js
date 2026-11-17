// Medición vía dataLayer -> Google Tag Manager -> GA4.
// Evento principal: click_whatsapp { servicio, ubicacion }.
// servicio: general | evaluacion | bright | hydrafacial | special | dermapen_rf |
//           laminado | lifting | micro | depilacion | corporal | flotante
export function initAnalytics() {
  window.dataLayer = window.dataLayer || [];

  document.addEventListener('click', (e) => {
    const wa = e.target.closest('a[data-wa]');
    if (wa) {
      window.dataLayer.push({
        event: 'click_whatsapp',
        servicio: wa.dataset.wa,
        ubicacion: wa.dataset.ubicacion || '',
        link_url: wa.href,
      });
      return;
    }
    const cta = e.target.closest('[data-cta]');
    if (cta) {
      window.dataLayer.push({ event: 'click_cta', cta: cta.dataset.cta });
    }
  });

  // Reproducción de videos (testimonios, resultado, proceso)
  document.querySelectorAll('video').forEach((v) => {
    v.addEventListener('play', () => {
      window.dataLayer.push({ event: 'video_play', video: v.getAttribute('aria-label') || '' });
    }, { once: true });
  });
}
