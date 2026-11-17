# Varua Rosé Spa — Landing

Landing estática de una página: HTML, CSS y JS vanilla, empaquetados con Vite. Las animaciones de scroll usan GSAP con ScrollTrigger y SplitText. No hay backend ni base de datos: se sube la carpeta `dist/` a cualquier hosting.

## Requisitos
- Node.js 20 o superior

## Comandos
```bash
npm install        # una sola vez
npm run dev        # desarrollo en http://localhost:5173
npm run build      # genera dist/ (lo que se sube al hosting)
npm run preview    # prueba local del build en http://localhost:4173
npm run images     # solo si cambias fotos en source/fotos: regenera los WebP en public/img
```

## Publicar
1. Edita `.env.production` y reemplaza `GTM-XXXXXXX` por el ID real de Google Tag Manager.
2. Reemplaza el dominio provisional `https://www.varuarosespa.com` en: `index.html` (canonical, Open Graph, JSON-LD), `public/robots.txt`, `public/sitemap.xml` y `public/llms.txt`.
3. Ejecuta `npm run build`.
4. Sube **el contenido** de `dist/` a la raíz pública del hosting (`public_html` en cPanel). Incluye un `.htaccess` con compresión y caché.

## Publicar en GitHub Pages
El workflow `.github/workflows/deploy.yml` construye y publica el sitio en cada push a `main`. La ruta base (`/nombre-del-repo/`) se calcula sola.
1. Crea el repo en GitHub y sube el proyecto (sin `node_modules/` ni `dist/`, que ya están en `.gitignore`).
2. En el repo, entra a **Settings > Pages > Build and deployment > Source** y elige **GitHub Actions**.
3. Haz push a `main`. En la pestaña **Actions** verás el deploy. Al terminar, el sitio queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Estructura
```
index.html                 Página completa (contenido renderizado, sin depender de JS)
src/main.js                Punto de entrada: analítica, navegación, posters diferidos, carga de GSAP
src/js/animations.js       Narrativa de scroll (GSAP), chunk separado y diferido
src/js/analytics.js        dataLayer: click_whatsapp, click_cta, video_play
src/js/nav.js              Sombra del header y sección activa en el menú
src/js/media.js            Portadas de video bajo demanda
src/styles/main.css        Tokens, @layer, responsive y entrada del hero en CSS
public/img                 WebP en 400/800/1200 px + logos + imagen OG
public/fonts               Cormorant Garamond, Jost y Pinyon Script (WOFF2 autohospedadas)
public/video               4 videos MP4
source/fotos               JPG originales del handoff (fuente para npm run images)
scripts/optimize-images.mjs
```

## Medición (GTM → GA4)
Cada botón de WhatsApp empuja al dataLayer:
```js
{ event: 'click_whatsapp', servicio: 'bright', ubicacion: 'faciales_precios', link_url: 'https://wa.me/...' }
```
`servicio`: general, evaluacion, bright, hydrafacial, special, dermapen_rf, laminado, lifting, micro, depilacion, corporal, flotante.

En GTM:
1. Variables de capa de datos: `servicio`, `ubicacion`.
2. Activador: Evento personalizado `click_whatsapp`.
3. Etiqueta "Google Analytics: Evento GA4", nombre `click_whatsapp`, parámetros `servicio` y `ubicacion`. Además, una etiqueta "Google tag" con `G-XXXXXXXXXX`.
4. En GA4, registra `servicio` y `ubicacion` como dimensiones personalizadas y marca `click_whatsapp` como evento clave.

Consent Mode v2 queda declarado en el `<head>`: analítica concedida y publicidad denegada por defecto. Si se agrega un banner de cookies o el píxel de Meta, ajústalo.

## Animaciones
- La entrada del hero es CSS puro y arranca en el primer pintado, así que no retrasa el LCP.
- GSAP se carga con la primera interacción o 1.8 s después del `load`.
- Con `prefers-reduced-motion` o sin JS no se carga nada de animación y todo el contenido se ve normal.
- Escritorio (1024 px o más): parallax y salida del hero. Tablet y escritorio (768 px o más): efecto telón en las secciones oscuras.
