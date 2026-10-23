// Piezas de HTML que cambian de producto a producto, con el mismo marcado que
// la página del Dúo (23/10/2026). Las usan los datos de cada producto.

const CHECK = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
const CAMION = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';

const plata = n => '$ ' + n.toLocaleString('es-AR');

const navLinks = (p, activa) => [
  ['combo', 'combo-biotina.html', 'Combo Biotina'],
  ['biotina', 'biotina-pura.html', 'Biotina Pura'],
  ['duo', 'shampoo-crema/', 'Dúo Shampoo + Acondicionador'],
].map(([k, href, txt]) => ` <a href="${p}${href}"${k === activa ? ' class="active"' : ''}>${txt}</a>\n`).join('');

const badge = txt => ` <div class="stock-badge">\n <span class="stock-dot"></span>\n ${txt}\n </div>\n`;

const beneficios = items => ' <ul class="benefits-list">\n' + items.map(([fuerte, resto]) =>
  ` <li>\n <span class="benefit-check">${CHECK}</span>\n <span><strong>${fuerte}</strong>${resto}</span>\n </li>\n`).join('') + ' </ul>\n';

// opciones: [{ cant, titulo, sub, envio, viejo, descuento, precio, primeraLinea, cuotas, transf, cadaUno, extra }]
function cantidades(opciones) {
  const clase = ['qty-option', 'qty-option popular selected', 'qty-option best'];
  return ' <div class="quantity-options">\n' + opciones.map((o, k) => {
    const n = k + 1;
    return ` <div class="${clase[k]}" onclick="selectQty(this, ${n})" data-price="${o.precio}">\n` +
      ` <span class="qty-count">${o.cant}</span>\n` +
      ' <div class="qty-left">\n <div class="qty-radio"></div>\n <div class="qty-info">\n' +
      ` <strong>Lleva ${n}</strong>\n <span>${o.sub}</span>\n` +
      ` <span class="qty-shipping-free">${CAMION} ${o.envio}</span>\n` +
      (o.extra ? ` <span class="qty-gift">${o.extra}</span>\n` : '') +
      ' </div>\n </div>\n <div class="qty-price">\n' +
      (o.viejo ? ` <span class="price-old">${plata(o.viejo)} <span class="discount-badge">-${o.descuento}%</span></span>\n` : '') +
      ` <span class="price-now">${plata(o.precio)}</span>\n` +
      (o.primeraLinea ? ` <span class="price-cuotas">${o.primeraLinea}</span>\n` : '') +
      ` <span class="price-cuotas">3 cuotas de ${plata(Math.round(o.precio / 3))}</span>\n` +
      ` <span class="price-transfer">Transferencia ${plata(o.transf)}</span>\n` +
      (o.cadaUno ? ` <span class="qty-save">${o.cadaUno}</span>\n` : '') +
      ' </div>\n </div>\n';
  }).join('\n') + ' </div>\n\n';
}

const prueba = items => ' <!-- PROOF STRIP -->\n <div class="proof-strip">\n' +
  items.map(([num, txt]) => ` <div style="text-align:center"><div class="proof-num">${num}</div><div class="proof-label">${txt}</div></div>\n`).join('') + ' </div>\n\n';

// Bloque de confianza debajo de la franja negra: en el Dúo es "Sé de las primeras"; en los otros, "Probalo sin riesgo".
const primeras = ({ comentario, tag, titulo, texto, boton, cant }) =>
  ` <!-- ${comentario} -->\n <div class="primeras-section">\n <span class="primeras-tag">${tag}</span>\n <h2>${titulo}</h2>\n <p>${texto}</p>\n` +
  ' <div class="primeras-garantia">\n <strong>Probalo sin riesgo</strong>\n <span>Si no te convence, tenés 10 días desde que lo recibís para devolverlo y te devolvemos la plata.</span>\n </div>\n' +
  ` <a href="#" onclick="selectQty(document.querySelector('.qty-option.popular'), ${cant}); irAPagar(); return false;" class="primeras-btn">${boton}</a>\n </div>\n\n`;

// tarjetas: [{ ml, titulo, texto, tag, destacada, regalo }]
const incluye = ({ titulo, sub, tarjetas, una }) =>
  ` <!-- QUÉ INCLUYE -->\n <div class="includes-section">\n <h2>${titulo}</h2>\n <p class="how-sub">${sub}</p>\n <div class="includes-grid${una ? ' includes-grid--single' : ''}">\n\n` +
  tarjetas.map((c, k) => ` <div class="include-card${c.destacada ? ' include-card--featured' : ''}${c.regalo ? ' include-card--gift' : ''}" onclick="openProduct(${k})" role="button">\n` +
    (c.regalo ? ` <div class="include-gift-ribbon">${c.regalo}</div>\n` : '') +
    ` <div class="include-badge">${c.ml}</div>\n <div class="include-icon"></div>\n <h3>${c.titulo}</h3>\n <p>${c.texto}</p>\n <span class="include-tag">${c.tag}</span>\n <span class="include-more">Ver más →</span>\n </div>\n\n`).join('') +
  ' </div>\n </div>\n\n';

// fotos: [{ src, alt, pos, tag, titulo, texto, lista }]; resultado: { src, alt, k, items: [[fuerte, txt]] }
const queHace = ({ comentario, titulo, sub, fotos, resultado }) =>
  ` <!-- ${comentario} -->\n <div class="que-section" id="que-hace">\n <h2>${titulo}</h2>\n <p class="que-sub">${sub}</p>\n <div class="que-grid">\n` +
  fotos.map((f, k) => ' <article class="que-card">\n <div class="que-foto">\n' +
    ` <img src="${f.src}" alt="${f.alt}" loading="lazy" width="720" height="900" style="object-position: ${f.pos};">\n` +
    ` <span class="que-tag">${f.tag}</span>\n </div>\n <div class="que-body">\n <span class="que-num">${String(k + 1).padStart(2, '0')}</span>\n` +
    ` <h3>${f.titulo}</h3>\n <p>${f.texto}</p>\n <ul class="que-list">${f.lista.map(l => `<li>${l}</li>`).join('')}</ul>\n </div>\n </article>\n`).join('') +
  ' </div>\n' +
  (resultado ? ' <div class="que-resultados">\n' +
    ` <div class="que-res-foto"><img src="${resultado.src}" alt="${resultado.alt}" loading="lazy" width="720" height="900"></div>\n` +
    ` <div class="que-res-texto">\n <span class="que-res-k">${resultado.k}</span>\n` +
    resultado.items.map(([a, b]) => ` <div class="que-res-item"><strong>${a}</strong><span>${b}</span></div>\n`).join('') +
    ' </div>\n </div>\n' : '') +
  ' </div>\n\n';

// pasos: [{ tag, titulo, texto, badge }]
const comoSeUsa = ({ sub, pasos }) => {
  const n = pasos.length;
  return ' <!-- CÓMO SE USA -->\n <div class="envio-section" style="background:#f7f7f5;">\n <div class="envio-inner">\n <h2>¿Cómo se usa?</h2>\n' +
    ` <p class="how-sub">${sub}</p>\n\n <div class="how-stepper">\n <div class="how-track">\n <div class="how-track-line"></div>\n <div class="how-track-fill" id="howTrackFill"></div>\n` +
    pasos.map((p, k) => ` <button class="how-dot${k === 0 ? ' active' : ''}" id="how-dot-${k}" onclick="howGoTo(${k})"><span>${k + 1}</span></button>\n`).join('') +
    ' </div>\n\n <div class="how-steps-wrapper">\n' +
    pasos.map((p, k) => ` <div class="how-step-item${k === 0 ? ' active' : ''}" id="how-step-${k}">\n <div class="how-step-tag">Paso ${k + 1} de ${n} — ${p.tag}</div>\n` +
      ` <h3 class="how-step-title">${p.titulo}</h3>\n <p class="how-step-text">${p.texto}</p>\n <span class="how-step-badge">${p.badge}</span>\n </div>\n`).join('') +
    ' </div>\n\n <div class="how-nav">\n <button class="how-btn how-btn-prev" id="how-prev" onclick="howPrev()" disabled>← Anterior</button>\n' +
    ` <span class="how-step-counter" id="how-counter">1 / ${n}</span>\n <button class="how-btn how-btn-next" id="how-next" onclick="howNext()">Siguiente →</button>\n </div>\n </div>\n </div>\n </div>\n\n`;
};

// Las preguntas que van igual en las tres páginas (cambia solo la unidad: "dúo", "frasco", "combo").
const faqComunes = unidad => [
  ['¿Lo puedo usar si estoy embarazada o con un tratamiento?', 'Es un cosmético de uso externo, pero no reemplaza un tratamiento médico. Si estás embarazada, en lactancia, tomás medicación o tenés alguna condición en el cuero cabelludo, consultalo con tu médico antes de empezar.'],
  ['¿Cuánto cuesta el envío?', `Enviamos por Correo Argentino a todo el país, a domicilio o a sucursal. Con 1 ${unidad} el envío cuesta $7.000 y llevando 2 o más es gratis. En el botón de compra ves el total, con el envío incluido.`],
  ['¿Cuánto tarda en llegar mi pedido?', 'Apenas se acredita el pago preparamos tu pedido y te avisamos por WhatsApp el día que sale. Llega en 3 a 5 días hábiles desde que pagás, y te pasamos el número de seguimiento del Correo para que lo sigas.'],
  ['¿Qué formas de pago aceptan?', 'Con Mercado Pago podés pagar con tarjeta de crédito en 3 cuotas sin interés, con débito, con dinero en cuenta o en efectivo en Pago Fácil y Rapipago. Pagando por transferencia bancaria tenés 10% de descuento: escribinos por WhatsApp y te pasamos los datos. En todos los casos el pago se hace antes del envío.'],
  ['¿Es seguro comprar?', 'Sí. El pago se procesa por Mercado Pago: si pagás con tu cuenta tenés Compra Protegida y, si el pedido no te llega, te devuelven la plata. Te pasamos el seguimiento del Correo por WhatsApp. Somos de Tres de Febrero (Buenos Aires). No tenemos local a la calle: vendemos online y por WhatsApp.'],
  ['¿Cómo hago el pedido?', 'Elegí la cantidad y tocá Comprar. Dejá tu nombre y tu WhatsApp y pagá en Mercado Pago. Después del pago cargás la dirección de envío y, apenas se acredita, preparamos tu pedido y por WhatsApp te pasamos el número de seguimiento. Si preferís, podés hacer todo el pedido directamente por WhatsApp.'],
  ['¿Y si no me convence?', 'Tenés 10 días desde que lo recibís para devolverlo. Nos escribís por WhatsApp, nos mandás el producto y te devolvemos la plata por el mismo medio con el que pagaste.'],
  ['¿Qué pasa si el producto llega dañado?', 'Lo reemplazamos sin costo. Escribinos por WhatsApp con una foto dentro de los 10 días de recibido y te mandamos otro.'],
];

const faq = items => ' <!-- FAQ -->\n <div class="faq-section">\n <h2>Preguntas frecuentes</h2>\n' +
  items.map(([q, a]) => ` <div class="faq-item">\n <button class="faq-q" onclick="toggleFaq(this)">${q} <span class="faq-arrow">+</span></button>\n <div class="faq-a">${a}</div>\n </div>\n`).join('') + ' </div>\n\n';

const ctaFinal = ({ titulo, texto, boton, cant }) => ` <!-- CTA FINAL -->\n <div class="cta-final">\n <h2>${titulo}</h2>\n <p>${texto}</p>\n` +
  ` <a href="#" onclick="selectQty(document.querySelector('.qty-option.popular'), ${cant}); irAPagar(); return false;" class="btn-cta-final">${boton}</a>\n </div>\n\n`;

// productos del modal "Ver más": [{ ml, name, tag, tagClass, desc, beneficios, uso, nota }]
const products = lista => ' const PRODUCTS = [\n' + lista.map(p => ' {\n' +
  ` icon: '', ml: '${p.ml}', name: '${p.name}',\n tag: '${p.tag}', tagClass: '${p.tagClass}',\n desc: '${p.desc}',\n` +
  ' beneficios: [\n' + p.beneficios.map(b => ` '${b}',\n`).join('') + ' ],\n' +
  ' uso: [\n' + p.uso.map(u => ` '${u}',\n`).join('') + ' ],\n' +
  ` nota: '${p.nota}',\n },\n`).join('') + ' ];\n';

// ─── Código: links de pago y precios ───
const miles = n => n.toLocaleString('es-AR');

// links: [[url, comentario], x3]
const jsMp = links => ' // Links de pago de MercadoPago (Link de pago, montos fijos)\n' +
  links.map(([url, nota], k) => ` const MP_URL_${k + 1} = '${url}'; // ← ${nota}\n`).join('');

// Las etiquetas viajan al aviso del grupo y a la base (pedidos_web.producto): no cambiarlas sin mirar n8n.
const jsPrecios = (precios, etiquetas) => ` const PRECIOS_NUM = { 1: ${precios[0]}, 2: ${precios[1]}, 3: ${precios[2]} };\n\n const precios = {\n` +
  etiquetas.map((e, k) => ` ${k + 1}: { label: '${e}', mp: MP_URL_${k + 1} }${k < 2 ? ',' : ''}\n`).join('') + ' };\n';

const jsTextosPrecio = precios => ` const prices = { 1: '${miles(precios[0])}', 2: '${miles(precios[1])}', 3: '${miles(precios[2])}' };\n` +
  ` // Con 1 unidad el envío se cobra ($7.000, ya sumado en los $${miles(precios[0])}).\n` +
  ` const textoBoton = qty === 1 ? 'COMPRAR AHORA · $${miles(precios[0])} CON ENVÍO' : \`COMPRAR AHORA · $\${prices[qty]} — ENVÍO GRATIS\`;\n`;

const transferencia = t => ` const TRANSFERENCIA = ${JSON.stringify({ 1: t[0], 2: t[1], 3: t[2] })};\n`;

module.exports = { plata, navLinks, badge, beneficios, cantidades, prueba, primeras, incluye, queHace, comoSeUsa, faq, faqComunes, ctaFinal, products, jsMp, jsPrecios, jsTextosPrecio, transferencia };
