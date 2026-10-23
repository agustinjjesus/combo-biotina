// Biotina Pura en spray: biotina-pura.html. Desde el 23/10/2026 sale de la misma plantilla
// que el Dúo. Los textos describen el producto (va a la raíz, uso diario, no se enjuaga):
// sin promesas de caída, crecimiento ni resultados, como el Dúo.
const P = require('../piezas');
const p = '';

module.exports = {
  archivo: 'biotina-pura.html',
  P: p,
  TITULO: 'Biotina Pura® en spray · 500 ml | Directo a la raíz',
  DESCRIPCION: 'Biotina Pura® en spray de 500 ml: va directo a la raíz, se usa todos los días y no se enjuaga. Sin formol ni sulfatos. 2 frascos $44.000 con envío gratis a todo el país y 3 cuotas sin interés.',
  DESCRIPCION_CORTA: 'Spray de biotina de 500 ml: va directo a la raíz y no se enjuaga. 2 frascos $44.000 con envío gratis.',
  URL: 'https://productoscapilarespg.com/biotina-pura.html',
  IMAGEN_OG: 'https://productoscapilarespg.com/biotina-pura-gatillo-og.jpg',
  VC_NOMBRE: "content_name: 'Biotina Pura'",
  VC_VALOR: "currency: 'ARS', value: 25000 }",
  TRACK_PAGE: "JSON.stringify({ page: 'biotinaPura' })",
  ANUNCIO_1: ' 500 ML · RINDE 2 MESES\n',
  ANUNCIO_2: ' SIN FORMOL NI SULFATOS\n',
  NAV_LINKS: P.navLinks(p, 'biotina'),
  WA_URL: 'https://wa.me/5491124838177?text=Hola!%20Me%20interesa%20la%20Biotina%20Pura%20%F0%9F%8C%BF%20%C2%BFMe%20pod%C3%A9s%20dar%20m%C3%A1s%20info%3F',
  // El video del anuncio "No se la recomiendo a cualquiera", sin la placa y con subtítulos (14/10).
  HERO_MEDIA: ' <div class="hero-img hero-video">\n' +
    ' <video id="heroVideo" src="biotina-pura-video.mp4?v=1" poster="biotina-pura-gatillo.jpg?v=1" autoplay muted loop playsinline preload="auto" aria-label="Video de Biotina Pura PG en spray"></video>\n' +
    ' <button type="button" class="btn-sonido" id="btnSonido" onclick="alternarSonido()" aria-label="Activar sonido">\n' +
    ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>\n' +
    ' <span>Activar sonido</span>\n </button>\n </div>\n',
  BADGE: P.badge('En stock · Envío a todo el país'),
  H1: ' <h1>Biotina Pura® en spray, directo a la raíz</h1>\n',
  COMPOSICION: ' <p class="combo-composition">Spray de 500 ml listo para usar · Se usa todos los días y no se enjuaga</p>\n',
  BENEFICIOS: P.beneficios([
    ['Va directo a la raíz:', ' se aplica en el cuero cabelludo.'],
    ['En spray, listo para usar:', ' sin mezclar ni trasvasar.'],
    ['No se enjuaga', ' ni deja el pelo pesado.'],
    ['Sin formol ni sulfatos.', ' Apto uso diario.'],
  ]),
  CANTIDADES: P.cantidades([
    { cant: '1 frasco', sub: '500 ml · rinde 2 meses', envio: 'Envío $7.000 · gratis llevando 2', precio: 29000, primeraLinea: 'envío incluido', transf: 26800 },
    { cant: '2 frascos', sub: '1 litro · rinde 4 meses', envio: 'Envío gratis incluido', viejo: 58000, descuento: 24, precio: 44000, transf: 39600, cadaUno: '$22.000 cada frasco' },
    { cant: '3 frascos', sub: '1,5 litros · rinde 6 meses', envio: 'Envío gratis incluido', viejo: 87000, descuento: 30, precio: 61000, transf: 54900, cadaUno: '$20.333 cada frasco' },
  ]),
  BOTON: 'COMPRAR AHORA · $44.000 — ENVÍO GRATIS',
  PRUEBA: P.prueba([
    ['500ml', 'spray listo para usar'],
    ['0%', 'formol ni sulfatos'],
    ['Diario', 'y sin enjuague'],
    ['Gratis', 'envío llevando 2 o más'],
  ]),
  PRIMERAS: P.primeras({
    comentario: 'COMPRA SIN RIESGO (23/10): el mismo bloque que el Dúo, sin opiniones inventadas',
    tag: 'Compra sin riesgo',
    titulo: 'Probala tranquila',
    texto: 'Pagás por Mercado Pago y te pasamos el seguimiento del Correo por WhatsApp, para que sepas en todo momento dónde está tu pedido.',
    boton: 'Quiero probarla · 2 frascos $44.000', cant: 2,
  }),
  INCLUYE: P.incluye({
    titulo: '¿Qué trae?',
    sub: 'Un frasco de 500 ml, listo para usar.',
    una: true,
    tarjetas: [
      { ml: '500ml', titulo: 'Biotina Pura en Spray', texto: 'Spray con biotina (vitamina B7) para aplicar directo sobre el cuero cabelludo, que es donde nace el pelo. Se usa todos los días y no requiere enjuague. Sin formol ni sulfatos.', tag: 'USO DIARIO · NO ENJUAGAR' },
    ],
  }),
  QUE_HACE: P.queHace({
    comentario: 'CÓMO ES (el frasco real y las fotos de Flow del 22/10)',
    titulo: '¿Cómo es la Biotina Pura?',
    sub: 'Un spray simple, para usar todos los días.',
    fotos: [
      { src: 'biotina-pura-gatillo.jpg', alt: 'Frasco de Biotina Pura en spray de 500 ml', pos: 'center 50%', tag: 'Biotina Pura · 500 ml', titulo: 'Va directo a la raíz', texto: 'Se pulveriza sobre el cuero cabelludo, que es donde nace el pelo. Es una fórmula con biotina, la vitamina B7, sin formol ni sulfatos.', lista: ['Con biotina B7', 'Sin formol ni sulfatos', 'Para todo tipo de pelo'] },
      { src: 'biotina-mano.jpg', alt: 'Mano aplicando el spray de Biotina Pura', pos: 'center 40%', tag: 'Uso diario', titulo: 'Todos los días, sin enjuagar', texto: 'Unas pulverizaciones por zona, un minuto de masaje con las yemas de los dedos y listo. No se enjuaga ni deja el pelo pesado.', lista: ['2 o 3 pulverizaciones por zona', 'Masaje de 1 minuto', 'No se enjuaga'] },
    ],
    resultado: { src: 'biotina-espejo.jpg', alt: 'Mujer mirándose el pelo frente al espejo', k: 'Cuánto rinde', items: [['1 frasco', 'Unos 2 meses de uso diario.'], ['2 frascos', 'Unos 4 meses, con envío gratis.']] },
  }),
  COMO_SE_USA: P.comoSeUsa({
    sub: 'Una rutina simple, todos los días.',
    pasos: [
      { tag: 'Todos los días', titulo: 'Aplicá', texto: 'Pulverizá el spray directo sobre el cuero cabelludo limpio y seco, separando el pelo en secciones para llegar bien a la raíz.', badge: 'Uso diario · 500 ml' },
      { tag: 'Todos los días', titulo: 'Masajeá', texto: 'Con las yemas de los dedos, durante 1 minuto.', badge: '1 minuto' },
      { tag: 'Todos los días', titulo: 'No enjuagues', texto: 'Dejá que absorba solo. Lo importante es usarlo todos los días.', badge: 'No enjuagar' },
    ],
  }),
  UNIDAD_1: '<span class="envio-region">Con 1 frasco</span>',
  FAQ: P.faq([
    ['¿Qué trae?', 'Un frasco de Biotina Pura en spray de 500 ml, listo para usar.'],
    ['¿Cuánto me dura un frasco?', 'Un frasco de 500 ml rinde unos 2 meses de uso diario. Llevando 2 o 3 no cortás la rutina y el envío es gratis.'],
    ['¿Cómo se usa?', 'Todos los días, directo sobre el cuero cabelludo limpio y seco. Masajeá un minuto con las yemas de los dedos y no lo enjuagues: dejá que absorba solo.'],
    ['¿Qué tiene?', 'Es una fórmula a base de biotina (vitamina B7), sin formol ni sulfatos. Es de uso externo: se aplica en el cuero cabelludo, no se toma.'],
    ['¿Sirve para la caída?', 'Es un cosmético con biotina que se aplica todos los días en el cuero cabelludo, donde nace el pelo. No es un medicamento: si la caída es fuerte o empezó de golpe, consultalo con un médico.'],
    ['¿Se puede usar con el dúo?', 'Sí. El shampoo y el acondicionador cuidan el pelo en el lavado, y la Biotina Pura se aplica después, con el cuero cabelludo seco.'],
    ['¿Sirve para todo tipo de cabello?', 'Sí, es apto para todo tipo de cabello: liso, ondulado, rizado, teñido o con procesos químicos.'],
    ...P.faqComunes('frasco'),
  ]),
  CTA_FINAL: P.ctaFinal({
    titulo: 'Empezá hoy tu rutina con Biotina Pura',
    texto: 'Spray de 500 ml que va directo a la raíz, se usa todos los días y no se enjuaga. Sin formol ni sulfatos.',
    boton: 'Lleva 2 · $44.000 — Envío gratis', cant: 2,
  }),
  MODAL_PRODUCTO: '<span id="modalProducto">Biotina Pura x1 — $29.000 con envío</span>',
  JS_MP: P.jsMp([
    ['https://mpago.la/1aYABR8', '1 frasco, $29.000 ($22.000 + $7.000 de envío)'],
    ['https://mpago.la/2wDo3xX', '2 frascos $44.000'],
    ['https://mpago.la/2wmf92V', '3 frascos $61.000 (link propio, no el del Combo x2)'],
  ]),
  JS_PRECIOS: P.jsPrecios([29000, 44000, 61000], ['Biotina Pura x1 — $29.000 con envío', 'Biotina Pura x2 — $44.000', 'Biotina Pura x3 — $61.000']),
  JS_PRECIOS_TXT: P.jsTextosPrecio([29000, 44000, 61000]),
  TRANSFERENCIA: P.transferencia(['$26.800 con envío', '$39.600', '$54.900']),
  PRODUCTS: P.products([
    {
      ml: '500ml', name: 'Biotina Pura en Spray', tag: 'USO DIARIO · NO ENJUAGAR', tagClass: 'green',
      desc: 'Spray con biotina (vitamina B7) para aplicar directo sobre el cuero cabelludo. Va a la raíz, que es donde nace el pelo, y no requiere enjuague.',
      beneficios: [
        'Se aplica directo en el cuero cabelludo',
        'Con biotina (vitamina B7)',
        'Absorción rápida: no deja residuo ni aplasta el cabello',
        'No requiere enjuague: lo usás en cualquier momento',
        'Sin formol ni sulfatos',
      ],
      uso: [
        'Aplicá sobre el cuero cabelludo seco o semihúmedo.',
        'Separá el cabello en secciones para llegar bien a la raíz.',
        'Dá 2 o 3 pulverizaciones por zona.',
        'Masajeá suavemente con las yemas de los dedos durante 1 minuto.',
        'No enjuagues. Dejá que absorba solo.',
      ],
      nota: 'Usalo todos los días: la constancia es lo más importante.',
    },
  ]),
  HOW_TOTAL: ' const HOW_TOTAL = 3;\n',
  // Botón de sonido del video de arriba: arranca solo y mudo (los navegadores no dejan
  // otra cosa); el botón prende la voz y lo vuelve al principio para que se escuche entero.
  JS_EXTRA: " const ICONO_MUDO = '<polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"/><line x1=\"23\" y1=\"9\" x2=\"17\" y2=\"15\"/><line x1=\"17\" y1=\"9\" x2=\"23\" y2=\"15\"/>';\n" +
    " const ICONO_SONIDO = '<polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"/><path d=\"M15.54 8.46a5 5 0 0 1 0 7.07\"/><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14\"/>';\n" +
    ' function alternarSonido() {\n' +
    " const v = document.getElementById('heroVideo');\n" +
    " const b = document.getElementById('btnSonido');\n" +
    ' if (!v || !b) return;\n' +
    ' if (v.muted) { v.muted = false; v.currentTime = 0; v.play().catch(function () {}); }\n' +
    ' else { v.muted = true; }\n' +
    " b.querySelector('svg').innerHTML = v.muted ? ICONO_MUDO : ICONO_SONIDO;\n" +
    " b.querySelector('span').textContent = v.muted ? 'Activar sonido' : 'Silenciar';\n" +
    " b.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar');\n" +
    ' }\n\n' +
    ' // ─── STEPPER CÓMO SE USA ───\n',
};
