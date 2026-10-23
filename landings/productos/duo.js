// Dúo Shampoo + Acondicionador: shampoo-crema/index.html. Es la página que se tomó de
// molde el 23/10/2026; estos textos son los que tenía ese día.
const P = require('../piezas');
const p = '../';

module.exports = {
  archivo: 'shampoo-crema/index.html',
  P: p,
  TITULO: "Dúo Shampoo + Acondicionador con Biotina® | Sin sulfatos · 500 ml cada uno",
  DESCRIPCION: "Shampoo + acondicionador con biotina, 500 ml cada uno, sin sulfatos ni formol. Pelo suave y con brillo desde el primer lavado. 2 dúos $36.000 con envío gratis a todo el país.",
  DESCRIPCION_CORTA: "Shampoo + acondicionador con biotina, 500 ml cada uno, sin sulfatos ni formol. Pelo suave y con brillo desde el primer lavado. 2 dúos $36.000 con envío gratis.",
  URL: "https://productoscapilarespg.com/shampoo-crema/",
  IMAGEN_OG: "https://productoscapilarespg.com/duo-producto.jpg",
  VC_NOMBRE: "content_name: 'Dúo Shampoo + Acondicionador'",
  VC_VALOR: "currency: 'ARS', value: 20000 }",
  TRACK_PAGE: "JSON.stringify({ page: 'duo' })",
  ANUNCIO_1: ' 500 ML CADA UNO\n',
  ANUNCIO_2: ' SIN FORMOL NI SULFATOS\n',
  NAV_LINKS: P.navLinks(p, 'duo'),
  WA_URL: "https://wa.me/5491124838177?text=Hola!%20Me%20interesa%20el%20D%C3%BAo%20Shampoo%20%2B%20Acondicionador%20%F0%9F%8C%BF%20%C2%BFMe%20pod%C3%A9s%20dar%20m%C3%A1s%20info%3F",
  HERO_MEDIA: " <div class=\"hero-img\">\n <img src=\"../duo-producto.jpg\" alt=\"Dúo Shampoo + Acondicionador Biotina PG — 500ml cada uno\" />\n </div>\n",
  BADGE: P.badge('Nuevo · Precio de lanzamiento · Envío a todo el país'),
  H1: ' <h1>Dúo Shampoo + Acondicionador con Biotina, sin sulfatos</h1>\n',
  COMPOSICION: ' <p class="combo-composition">500 ml cada uno · Pelo suave y con brillo desde el primer lavado</p>\n',
  BENEFICIOS: P.beneficios([
  [
    "Sin sulfatos ni formol:",
    " limpia suave, por eso hace menos espuma."
  ],
  [
    "Suave y con brillo",
    " desde el primer lavado."
  ],
  [
    "Hidrata de medios a puntas",
    " y ayuda a controlar el frizz."
  ],
  [
    "Con biotina",
    " para fortalecer la fibra. Apto uso diario."
  ]
]),
  CANTIDADES: P.cantidades([
    { cant: '1 dúo', sub: '1 litro · rinde 1 mes', envio: 'Envío $7.000 · gratis llevando 2', precio: 27000, primeraLinea: 'envío incluido', transf: 25000 },
    { cant: '2 dúos', sub: '2 litros · rinde 2 meses', envio: 'Envío gratis incluido', viejo: 54000, descuento: 33, precio: 36000, transf: 32400, cadaUno: '$18.000 cada dúo' },
    { cant: '3 dúos', sub: '3 litros · rinde 3 meses', envio: 'Envío gratis incluido', viejo: 81000, descuento: 42, precio: 47000, transf: 42300, cadaUno: '$15.667 cada dúo' },
  ]),
  BOTON: 'COMPRAR AHORA · $36.000 — ENVÍO GRATIS',
  PRUEBA: P.prueba([
  [
    "2x500ml",
    "shampoo + acondicionador"
  ],
  [
    "0%",
    "formol ni sulfatos"
  ],
  [
    "Diario",
    "apto para uso diario"
  ],
  [
    "Gratis",
    "envío llevando 2 o más"
  ]
]),
  PRIMERAS: P.primeras({
    comentario: 'PRIMERAS CLIENTAS (18/10): el Dúo es nuevo y todavía no tiene opiniones; no se inventan',
    tag: 'Nuevo · Precio de lanzamiento',
    titulo: 'Sé de las primeras en probarlo',
    texto: 'Lanzamos el Dúo hace poco, por eso todavía no hay opiniones acá. Las vamos a ir sumando con lo que nos cuenten las primeras clientas.',
    boton: 'Quiero probarlo · 2 dúos $36.000', cant: 2,
  }),
  INCLUYE: P.incluye({
    titulo: '¿Qué incluye el dúo?',
    sub: '2 productos que trabajan en conjunto para una rutina de lavado completa.',
    tarjetas: [
  {
    "ml": "500ml",
    "titulo": "Shampoo de Biotina",
    "texto": "Limpieza profunda que fortalece desde la raíz. Formulado con biotina activa para dejar el cabello más fuerte y saludable con el uso. Sin formol ni sulfatos agresivos. Apto uso diario para todo tipo de cabello.",
    "tag": "USO DIARIO",
    "destacada": false
  },
  {
    "ml": "500ml",
    "titulo": "Acondicionador de Biotina",
    "texto": "Hidratación y reparación profunda de medios a puntas. Su fórmula con biotina activa sella la cutícula, ayuda a controlar el frizz y deja el cabello suave, manejable y con brillo natural. Sin formol ni sulfatos. Apto uso diario.",
    "tag": "USO DIARIO",
    "destacada": true
  }
],
  }),
  QUE_HACE: P.queHace({
    comentario: 'QUÉ HACE CADA UNO (fotos de los clips de Flow, sin íconos)',
    titulo: '¿Qué hace cada uno?',
    sub: 'Dos productos que se complementan para una rutina de lavado completa.',
    fotos: [
  {
    "src": "../duo-shampoo-espuma.jpg",
    "alt": "Manos con la espuma suave del shampoo sin sulfatos",
    "pos": "center 62%",
    "tag": "Shampoo · 500 ml",
    "titulo": "Limpia suave, sin sulfatos",
    "texto": "Limpia el cuero cabelludo y el largo sin arrastrar la grasa natural que protege el pelo. Hace menos espuma porque no tiene sulfatos, y limpia igual.",
    "lista": [
      "Con biotina B7",
      "Sin sulfatos ni formol",
      "Apto uso diario"
    ]
  },
  {
    "src": "../duo-acond-hebra.jpg",
    "alt": "El acondicionador envolviendo la hebra de pelo",
    "pos": "center 50%",
    "tag": "Acondicionador · 500 ml",
    "titulo": "Suave y con brillo, de medios a puntas",
    "texto": "Envuelve la fibra, ayuda a sellar la cutícula y controla el frizz. Desenreda y deja el pelo suave y manejable desde el primer lavado.",
    "lista": [
      "Con biotina B7",
      "Sin sulfatos ni formol",
      "Actúa en 3 a 5 minutos"
    ]
  }
],
    resultado: {
  "src": "../duo-resultado-pelo.jpg",
  "alt": "Pelo largo, suave y con brillo",
  "k": "Con uso constante",
  "items": [
    [
      "Semana 1",
      "Cabello más limpio, suave y manejable."
    ],
    [
      "Semana 3 a 6",
      "Menos frizz, más brillo y más cuerpo."
    ]
  ]
},
  }),
  COMO_SE_USA: P.comoSeUsa({ sub: 'Una rutina simple, todos los días.', pasos: [
  {
    "tag": "Todos los días",
    "titulo": "Shampoo",
    "texto": "Lavá el cabello y masajeá el cuero cabelludo con las yemas de los dedos durante 2-3 minutos. Enjuagá.",
    "badge": "Uso diario · 500 ml"
  },
  {
    "tag": "Todos los días",
    "titulo": "Acondicionador",
    "texto": "Aplicá de medios a puntas, evitando la raíz. Dejá actuar 3 a 5 minutos.",
    "badge": "Uso diario · 500 ml"
  },
  {
    "tag": "Todos los días",
    "titulo": "Enjuagá con agua fría",
    "texto": "Sella la cutícula y potencia el brillo. Repetí todos los días.",
    "badge": "Sella el brillo"
  }
] }),
  UNIDAD_1: '<span class="envio-region">Con 1 dúo</span>',
  FAQ: P.faq([
  [
    "¿Qué trae el dúo?",
    "Un Shampoo de Biotina de 500 ml y un Acondicionador de Biotina de 500 ml, para el lavado de todos los días."
  ],
  [
    "¿Con qué frecuencia se usa?",
    "Los dos son de uso diario. Lavá con el shampoo, aplicá el acondicionador de medios a puntas, dejalo actuar unos minutos y enjuagá."
  ],
  [
    "¿Por qué hace menos espuma?",
    "Porque no tiene sulfatos. Los sulfatos son los que hacen mucha espuma en los shampoos comunes y pueden resecar el pelo y el cuero cabelludo. El nuestro limpia igual pero más suave: con un poco de agua y masajeando alcanza."
  ],
  [
    "¿Sirve para la caída?",
    "El dúo cuida el pelo en el lavado. Para el cuero cabelludo está la Biotina Pura en spray, que se aplica directo en la raíz todos los días. Se pueden usar juntos."
  ],
  [
    "¿Sirve para todo tipo de cabello?",
    "Sí, es apto para todo tipo de cabello: liso, ondulado, rizado, teñido o con procesos químicos."
  ],
  ...P.faqComunes('dúo'),
]),
  CTA_FINAL: P.ctaFinal({
    titulo: 'Empezá hoy tu rutina de lavado',
    texto: 'Shampoo y acondicionador de 500 ml, sin sulfatos ni formol. Pelo suave y con brillo desde el primer lavado.',
    boton: 'Lleva 2 · $36.000 — Envío gratis', cant: 2,
  }),
  MODAL_PRODUCTO: "<span id=\"modalProducto\">Dúo Shampoo + Acondicionador x1 — $27.000 con envío</span>",
  JS_MP: P.jsMp([
    ['https://mpago.la/16kcmx4', '1 dúo, $27.000 ($20.000 + $7.000 de envío)'],
    ['https://mpago.la/2ZqrCm3', '2 dúos $36.000'],
    ['https://mpago.la/18T1oDQ', '3 dúos $47.000'],
  ]),
  JS_PRECIOS: P.jsPrecios([27000, 36000, 47000], ['Dúo Shampoo + Acondicionador x1 — $27.000 con envío', 'Dúo Shampoo + Acondicionador x2 — $36.000', 'Dúo Shampoo + Acondicionador x3 — $47.000']),
  JS_PRECIOS_TXT: P.jsTextosPrecio([27000, 36000, 47000]),
  TRANSFERENCIA: P.transferencia(['$25.000 con envío', '$32.400', '$42.300']),
  PRODUCTS: P.products([
  {
    "ml": "500ml",
    "name": "Shampoo de Biotina",
    "tag": "USO DIARIO",
    "tagClass": "coral",
    "desc": "Limpieza profunda formulada con biotina activa, que fortalece el cabello desde la raíz. Sin formol ni sulfatos agresivos. Apto para uso diario en todo tipo de cabello.",
    "beneficios": [
      "Limpia en profundidad sin resecar",
      "Formulado con biotina activa",
      "Fortalece el cabello desde la raíz",
      "Apto para cabello teñido, rizado, liso u ondulado",
      "Sin formol · Sin sulfatos agresivos"
    ],
    "uso": [
      "Mojá bien el cabello con agua tibia.",
      "Aplicá el shampoo y masajeá el cuero cabelludo con las yemas de los dedos durante 2-3 minutos.",
      "Enjuagá completamente con agua.",
      "Podés repetir si es necesario."
    ],
    "nota": " Podés usarlo todos los días. La fórmula suave no reseca el cuero cabelludo."
  },
  {
    "ml": "500ml",
    "name": "Acondicionador de Biotina",
    "tag": "USO DIARIO",
    "tagClass": "coral",
    "desc": "Acondicionador de biotina activa que hidrata en profundidad, sella la cutícula, ayuda a controlar el frizz y deja el cabello suave, manejable y con brillo natural. Sin formol ni sulfatos. Apto para uso diario.",
    "beneficios": [
      "Sella la cutícula y ayuda a controlar el frizz",
      "Hidratación profunda de medios a puntas",
      "Deja el cabello suave, sedoso y con brillo",
      "Facilita el peinado y reduce los nudos",
      "Sin formol · Sin sulfatos"
    ],
    "uso": [
      "Después del shampoo, exprimí el exceso de agua del cabello.",
      "Aplicá de medios a puntas (evitá el cuero cabelludo).",
      "Dejá actuar 3 a 5 minutos.",
      "Enjuagá con agua fría para potenciar el brillo."
    ],
    "nota": " No aplicar directamente en el cuero cabelludo para no obstruir los folículos pilosos."
  }
]),
  HOW_TOTAL: ' const HOW_TOTAL = 3;\n',
  JS_EXTRA: ' // ─── STEPPER CÓMO SE USA ───\n',
};
