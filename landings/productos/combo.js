// Combo Biotina: combo-biotina.html. Desde el 23/10/2026 sale de la misma plantilla que el
// Dúo. Trae shampoo y acondicionador de 500 ml, Biotina Pura de 250 ml y una Ampolla Plex de
// regalo. Sin promesas de caída, crecimiento ni resultados, como el Dúo.
const P = require('../piezas');
const p = '';

const SHAMPOO = 'Limpieza profunda que fortalece desde la raíz. Formulado con biotina activa para dejar el cabello más fuerte y saludable con el uso. Sin formol ni sulfatos agresivos. Apto uso diario para todo tipo de cabello.';
const ACOND = 'Hidratación y reparación profunda de medios a puntas. Su fórmula con biotina activa sella la cutícula, ayuda a controlar el frizz y deja el cabello suave, manejable y con brillo natural. Sin formol ni sulfatos. Apto uso diario.';
const REGALO = 'Incluye Ampolla Plex de regalo';

module.exports = {
  archivo: 'combo-biotina.html',
  P: p,
  TITULO: 'Combo Biotina® | Shampoo + acondicionador + spray de biotina',
  DESCRIPCION: 'Combo Biotina®: shampoo y acondicionador sin sulfatos de 500 ml + spray de Biotina Pura de 250 ml + ampolla de regalo. Envío gratis llevando 2 o más, pago seguro con Mercado Pago.',
  DESCRIPCION_CORTA: 'Shampoo y acondicionador sin sulfatos + spray de Biotina Pura 250 ml + ampolla de regalo. Envío gratis llevando 2 o más.',
  URL: 'https://productoscapilarespg.com/combo-biotina.html',
  IMAGEN_OG: 'https://productoscapilarespg.com/combo-productos-v2.jpg',
  VC_NOMBRE: "content_name: 'Combo Biotina'",
  VC_VALOR: "currency: 'ARS', value: 33000 }",
  TRACK_PAGE: "JSON.stringify({ page: 'combo' })",
  ANUNCIO_1: ' AMPOLLA PLEX DE REGALO\n',
  ANUNCIO_2: ' SIN FORMOL NI SULFATOS\n',
  NAV_LINKS: P.navLinks(p, 'combo'),
  WA_URL: 'https://wa.me/5491124838177?text=Hola!%20Me%20interesa%20el%20Combo%20Biotina%20%F0%9F%8C%BF%20%C2%BFMe%20pod%C3%A9s%20dar%20m%C3%A1s%20info%3F',
  HERO_MEDIA: ' <div class="hero-img">\n <img src="combo-productos-v2.jpg?v=3" alt="Combo Biotina PG — Shampoo, Acondicionador y Biotina Pura + Ampolla Plex de regalo" />\n </div>\n',
  BADGE: P.badge('Envío a todo el país · Ampolla de regalo'),
  H1: ' <h1>Combo Biotina®: shampoo, acondicionador y spray de biotina</h1>\n',
  COMPOSICION: ' <p class="combo-composition">Shampoo y acondicionador de 500 ml + Biotina Pura en spray de 250 ml</p>\n <div class="gift-highlight">+ Ampolla Plex de regalo</div>\n',
  BENEFICIOS: P.beneficios([
    ['Rutina completa:', ' lavado, acondicionador y spray para la raíz.'],
    ['Sin sulfatos ni formol:', ' limpia suave, por eso hace menos espuma.'],
    ['Suave y con brillo', ' desde el primer lavado.'],
    ['Ampolla Plex de regalo', ' para un tratamiento intensivo por semana.'],
  ]),
  CANTIDADES: P.cantidades([
    { cant: '1 combo', sub: 'Rinde 1 mes', envio: 'Envío $7.000 · gratis llevando 2', extra: REGALO, precio: 40000, primeraLinea: 'envío incluido', transf: 36700 },
    { cant: '2 combos', sub: 'Rinde 2 meses', envio: 'Envío gratis incluido', extra: REGALO, viejo: 80000, descuento: 24, precio: 61000, transf: 54900, cadaUno: '$30.500 cada combo' },
    { cant: '3 combos', sub: 'Rinde 3 meses', envio: 'Envío gratis incluido', extra: REGALO, viejo: 120000, descuento: 36, precio: 77000, transf: 69300, cadaUno: '$25.667 cada combo' },
  ]),
  BOTON: 'COMPRAR AHORA · $61.000 — ENVÍO GRATIS',
  PRUEBA: P.prueba([
    ['3 + 1', 'productos + ampolla de regalo'],
    ['0%', 'formol ni sulfatos'],
    ['Diario', 'apto para uso diario'],
    ['Gratis', 'envío llevando 2 o más'],
  ]),
  PRIMERAS: P.primeras({
    comentario: 'COMPRA SIN RIESGO (23/10): el mismo bloque que el Dúo, sin opiniones inventadas',
    tag: 'Compra sin riesgo',
    titulo: 'Probalo tranquila',
    texto: 'Nuestros pedidos ya llegaron a clientas de 5 provincias. Pagás por Mercado Pago y te pasamos el seguimiento del Correo por WhatsApp.',
    boton: 'Quiero el combo · 2 combos $61.000', cant: 2,
  }),
  INCLUYE: P.incluye({
    titulo: '¿Qué incluye el combo?',
    sub: '3 productos que se complementan, más una ampolla de regalo.',
    tarjetas: [
      { ml: '500ml', titulo: 'Shampoo de Biotina', texto: SHAMPOO, tag: 'USO DIARIO' },
      { ml: '500ml', titulo: 'Acondicionador de Biotina', texto: ACOND, tag: 'USO DIARIO' },
      { ml: '250ml', titulo: 'Biotina Pura en Spray', texto: 'Spray con biotina para aplicar directo sobre el cuero cabelludo, que es donde nace el pelo. Se usa todos los días y no requiere enjuague.', tag: 'USO DIARIO · NO ENJUAGAR', destacada: true },
      { ml: '60ml', titulo: 'Ampolla Plex + Biotina', texto: 'Tratamiento intensivo semanal para el cabello dañado, teñido o con procesos químicos. Se mezcla con la crema de tratamiento y se aplica de medios a puntas.', tag: 'USO SEMANAL', regalo: 'De regalo' },
    ],
  }),
  QUE_HACE: P.queHace({
    comentario: 'QUÉ HACE CADA UNO (fotos de los productos)',
    titulo: '¿Qué hace cada uno?',
    sub: 'Tres productos que se complementan, más la ampolla de regalo.',
    fotos: [
      { src: 'duo-shampoo-espuma.jpg', alt: 'Manos con la espuma suave del shampoo sin sulfatos', pos: 'center 62%', tag: 'Shampoo · 500 ml', titulo: 'Limpia suave, sin sulfatos', texto: 'Limpia el cuero cabelludo y el largo sin arrastrar la grasa natural que protege el pelo. Hace menos espuma porque no tiene sulfatos, y limpia igual.', lista: ['Con biotina B7', 'Sin sulfatos ni formol', 'Apto uso diario'] },
      { src: 'duo-acond-hebra.jpg', alt: 'El acondicionador envolviendo la hebra de pelo', pos: 'center 50%', tag: 'Acondicionador · 500 ml', titulo: 'Suave y con brillo, de medios a puntas', texto: 'Envuelve la fibra, ayuda a sellar la cutícula y controla el frizz. Desenreda y deja el pelo suave y manejable desde el primer lavado.', lista: ['Con biotina B7', 'Sin sulfatos ni formol', 'Actúa en 3 a 5 minutos'] },
      { src: 'biotina-pura-real.jpg', alt: 'Biotina Pura en spray de 250 ml', pos: 'center 50%', tag: 'Biotina Pura · 250 ml', titulo: 'Spray directo a la raíz', texto: 'Se pulveriza sobre el cuero cabelludo seco, se masajea un minuto y no se enjuaga. Con biotina, la vitamina B7.', lista: ['Con biotina B7', 'Sin formol ni sulfatos', 'No se enjuaga'] },
      { src: 'combo-productos-v2.jpg', alt: 'Los productos del combo con la Ampolla Plex', pos: '12% 60%', tag: 'Ampolla Plex · 60 ml · de regalo', titulo: 'Un tratamiento por semana', texto: 'Se mezcla con la crema de tratamiento y se aplica de medios a puntas sobre el pelo húmedo. Se deja actuar 15 a 20 minutos y se enjuaga.', lista: ['Uso semanal', 'Para pelo teñido o dañado', 'De regalo en cada combo'] },
    ],
    resultado: { src: 'duo-resultado-pelo.jpg', alt: 'Pelo largo, suave y con brillo', k: 'Con uso constante', items: [['Semana 1', 'Cabello más limpio, suave y manejable.'], ['Semana 3 a 6', 'Menos frizz, más brillo y más cuerpo.']] },
  }),
  COMO_SE_USA: P.comoSeUsa({
    sub: 'Una rutina simple, todos los días.',
    pasos: [
      { tag: 'Todos los días', titulo: 'Shampoo', texto: 'Lavá el cabello y masajeá el cuero cabelludo con las yemas de los dedos durante 2-3 minutos. Enjuagá.', badge: 'Uso diario · 500 ml' },
      { tag: 'Todos los días', titulo: 'Acondicionador', texto: 'Aplicá de medios a puntas, evitando la raíz. Dejá actuar 3 a 5 minutos y enjuagá con agua fría.', badge: 'Uso diario · 500 ml' },
      { tag: 'Todos los días', titulo: 'Biotina Pura en spray', texto: 'Con el pelo seco, pulverizá directo sobre el cuero cabelludo y masajeá 1 minuto. No se enjuaga.', badge: 'No enjuagar · 250 ml' },
      { tag: '1 vez por semana', titulo: 'Ampolla Plex + Biotina', texto: 'Mezclala con la crema de tratamiento, aplicá de medios a puntas sobre el pelo húmedo, dejá actuar 15 a 20 minutos y enjuagá.', badge: 'Uso semanal · 60 ml' },
    ],
  }),
  UNIDAD_1: '<span class="envio-region">Con 1 combo</span>',
  FAQ: P.faq([
    ['¿Qué trae el combo?', 'Shampoo de Biotina de 500 ml, Acondicionador de Biotina de 500 ml, Biotina Pura en spray de 250 ml y una Ampolla Plex + Biotina de 60 ml de regalo.'],
    ['¿Es lo mismo que la Biotina Pura?', 'No. El spray que viene en el combo es de 250 ml y rinde alrededor de un mes de uso diario. La Biotina Pura que se vende sola es de 500 ml y rinde dos. El combo suma el cuidado en el lavado con el shampoo, el acondicionador y la ampolla.'],
    ['¿Con qué frecuencia se usa cada uno?', 'El shampoo, el acondicionador y el spray, todos los días. La ampolla, una vez por semana.'],
    ['¿Por qué el shampoo hace menos espuma?', 'Porque no tiene sulfatos. Los sulfatos son los que hacen mucha espuma en los shampoos comunes y pueden resecar el pelo y el cuero cabelludo. El nuestro limpia igual pero más suave: con un poco de agua y masajeando alcanza.'],
    ['¿Sirve para todo tipo de cabello?', 'Sí, es apto para todo tipo de cabello: liso, ondulado, rizado, teñido o con procesos químicos.'],
    ...P.faqComunes('combo'),
  ]),
  CTA_FINAL: P.ctaFinal({
    titulo: 'Empezá hoy tu rutina completa',
    texto: 'Shampoo y acondicionador de 500 ml, Biotina Pura en spray y una Ampolla Plex de regalo. Sin formol ni sulfatos.',
    boton: 'Lleva 2 · $61.000 — Envío gratis', cant: 2,
  }),
  MODAL_PRODUCTO: '<span id="modalProducto">Combo Biotina x1 — $40.000 con envío</span>',
  JS_MP: P.jsMp([
    ['https://mpago.la/1QLwa1G', '1 combo, $40.000 ($33.000 + $7.000 de envío)'],
    ['https://mpago.la/1WX3K3Y', '2 combos $61.000'],
    ['https://mpago.la/2J4mMuV', '3 combos $77.000'],
  ]),
  JS_PRECIOS: P.jsPrecios([40000, 61000, 77000], ['Combo Biotina x1 — $40.000 con envío', 'Combo Biotina x2 — $61.000', 'Combo Biotina x3 — $77.000']),
  JS_PRECIOS_TXT: P.jsTextosPrecio([40000, 61000, 77000]),
  TRANSFERENCIA: P.transferencia(['$36.700 con envío', '$54.900', '$69.300']),
  PRODUCTS: P.products([
    {
      ml: '500ml', name: 'Shampoo de Biotina', tag: 'USO DIARIO', tagClass: 'coral',
      desc: 'Limpieza profunda formulada con biotina activa, que fortalece el cabello desde la raíz. Sin formol ni sulfatos agresivos. Apto para uso diario en todo tipo de cabello.',
      beneficios: ['Limpia en profundidad sin resecar', 'Formulado con biotina activa', 'Fortalece el cabello desde la raíz', 'Apto para cabello teñido, rizado, liso u ondulado', 'Sin formol · Sin sulfatos agresivos'],
      uso: ['Mojá bien el cabello con agua tibia.', 'Aplicá el shampoo y masajeá el cuero cabelludo con las yemas de los dedos durante 2-3 minutos.', 'Enjuagá completamente con agua.', 'Podés repetir si es necesario.'],
      nota: ' Podés usarlo todos los días. La fórmula suave no reseca el cuero cabelludo.',
    },
    {
      ml: '500ml', name: 'Acondicionador de Biotina', tag: 'USO DIARIO', tagClass: 'coral',
      desc: 'Acondicionador de biotina activa que hidrata en profundidad, sella la cutícula, ayuda a controlar el frizz y deja el cabello suave, manejable y con brillo natural. Sin formol ni sulfatos. Apto para uso diario.',
      beneficios: ['Sella la cutícula y ayuda a controlar el frizz', 'Hidratación profunda de medios a puntas', 'Deja el cabello suave, sedoso y con brillo', 'Facilita el peinado y reduce los nudos', 'Sin formol · Sin sulfatos'],
      uso: ['Después del shampoo, exprimí el exceso de agua del cabello.', 'Aplicá de medios a puntas (evitá el cuero cabelludo).', 'Dejá actuar 3 a 5 minutos.', 'Enjuagá con agua fría para potenciar el brillo.'],
      nota: ' No aplicar directamente en el cuero cabelludo para no obstruir los folículos pilosos.',
    },
    {
      ml: '250ml', name: 'Biotina Pura en Spray', tag: 'USO DIARIO · NO ENJUAGAR', tagClass: 'green',
      desc: 'Spray con biotina (vitamina B7) para aplicar directo sobre el cuero cabelludo. Va a la raíz, que es donde nace el pelo, y no requiere enjuague.',
      beneficios: ['Se aplica directo en el cuero cabelludo', 'Con biotina (vitamina B7)', 'Absorción rápida: no deja residuo ni aplasta el cabello', 'No requiere enjuague: lo usás en cualquier momento', 'Sin formol ni sulfatos'],
      uso: ['Aplicá sobre el cuero cabelludo seco o semihúmedo.', 'Separá el cabello en secciones para llegar bien a la raíz.', 'Dá 2 o 3 pulverizaciones por zona.', 'Masajeá suavemente con las yemas de los dedos durante 1 minuto.', 'No enjuagues. Dejá que absorba solo.'],
      nota: 'Usalo todos los días: la constancia es lo más importante.',
    },
    {
      ml: '60ml', name: 'Ampolla Plex + Biotina', tag: 'USO SEMANAL', tagClass: 'coral',
      desc: 'Tratamiento intensivo semanal para el cabello dañado, teñido o con procesos químicos. Se mezcla con la crema de tratamiento y se aplica de medios a puntas.',
      beneficios: ['Para cabello teñido, decolorado o alisado', 'Se aplica de medios a puntas', 'Un tratamiento por semana alcanza', 'Con biotina'],
      uso: ['Mezclá el contenido de la ampolla con tu crema de tratamiento habitual.', 'Aplicá de medios a puntas sobre cabello húmedo (no en la raíz).', 'Cubrí con una bolsa de plástico o gorro de ducha.', 'Dejá actuar 15 a 20 minutos.', 'Enjuagá completamente con agua tibia.'],
      nota: ' Usarla 1 vez por semana es suficiente.',
    },
  ]),
  HOW_TOTAL: ' const HOW_TOTAL = 4;\n',
  JS_EXTRA: ' // ─── STEPPER CÓMO SE USA ───\n',
};
