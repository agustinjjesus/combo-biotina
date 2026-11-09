/**
 * Cloudflare Worker — Cobro con Mercado Pago (Checkout Pro)
 *
 * Reemplaza a la Cloud Function de Firebase (us-central1-biotina-pg.cloudfunctions.net
 * /crearPreferencia), que ya no existe (Firebase quedó apagado el 07/10/2026).
 *
 * Por qué: desde el 07/10 la web mandaba a los Links de pago de monto fijo
 * (mpago.la/...), que llegan a Mercado Pago sin ningún dato de la compradora.
 * El 07/11 Mercado Pago rechazó como "pago sospechoso" dos cobros de $39.000 con
 * tarjeta de crédito hechos por ese link. Con este Worker cada pedido llega con
 * nombre, apellido, email, teléfono, producto y una referencia propia, que es lo
 * que Mercado Pago recomienda para que apruebe más.
 *
 * Qué hace:
 *   1. Recibe el pedido desde la página (nombre, WhatsApp, email, producto, precio).
 *   2. Chequea que el precio sea uno de los 9 precios reales del sitio (si no, un
 *      curioso podría crear un cobro de $1 con el nombre del producto).
 *   3. Crea la preferencia en Mercado Pago y devuelve solo el link del checkout.
 *   4. La página manda a la clienta a ese link. Si algo falla, la página usa el
 *      link fijo de siempre: nunca se queda sin poder pagar.
 *
 * Para desplegarlo:
 *   - Cloudflare → Workers y Pages → Crear Worker (nombre: biotina-pago) → pegar este archivo.
 *   - Settings → Variables y secretos → agregar el SECRETO MP_ACCESS_TOKEN con el
 *     Access Token de PRODUCCIÓN de Mercado Pago (Tus integraciones → Credenciales).
 *   - La URL queda https://biotina-pago.<tu-subdominio>.workers.dev/ (la página ya apunta
 *     a https://biotina-pago.productopg.workers.dev/; si es otra, cambiar PAGO_ENDPOINT
 *     en landings/plantilla.html y correr node landings/generar.js).
 */

// Solo se aceptan llamadas desde el sitio.
const ORIGENES_PERMITIDOS = [
  'https://productoscapilarespg.com',
  'https://www.productoscapilarespg.com',
];
const SITIO = ORIGENES_PERMITIDOS[0];

// Los únicos precios que se cobran (Biotina, Dúo y Combo, de 1 a 3 unidades).
const PRECIOS_VALIDOS = new Set([
  22000, 30000, 39000, // Biotina Pura
  27000, 36000, 47000, // Dúo Shampoo + Acondicionador
  33000, 61000, 77000, // Combo Biotina
]);

const DESCRIPCION = 'Productos capilares PG. Envío a todo el país por Correo Argentino con número de seguimiento.';
const NOMBRE_EN_RESUMEN = 'PRODUCTOS PG'; // como aparece en el resumen de la tarjeta (máx. 16)

function cors(origen) {
  const permitido = ORIGENES_PERMITIDOS.includes(origen) ? origen : SITIO;
  return {
    'Access-Control-Allow-Origin': permitido,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function responder(estado, cuerpo, origen) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, cors(origen)),
  });
}

const texto = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/** Vuelve a la misma página donde la clienta empezó la compra, nunca a un sitio ajeno. */
function paginaDeVuelta(url) {
  try {
    const u = new URL(url);
    if (ORIGENES_PERMITIDOS.includes(u.origin)) return u.origin + u.pathname;
  } catch (e) { /* cae a la raíz */ }
  return SITIO + '/';
}

export default {
  async fetch(request, env) {
    const origen = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origen) });
    if (request.method !== 'POST') return responder(405, { error: 'Método no permitido.' }, origen);
    if (origen && !ORIGENES_PERMITIDOS.includes(origen)) return responder(403, { error: 'Origen no permitido.' }, origen);
    if (!env.MP_ACCESS_TOKEN) return responder(500, { error: 'Falta configurar el cobro.' }, origen);

    let b;
    try { b = await request.json(); } catch (e) { return responder(400, { error: 'Pedido ilegible.' }, origen); }

    const precio = Number(b.precio);
    if (!PRECIOS_VALIDOS.has(precio)) return responder(400, { error: 'Precio no válido.' }, origen);

    const titulo = texto(b.titulo, 120) || 'Biotina Pura';
    const nombre = texto(b.nombre, 60);
    const apellido = texto(b.apellido, 60);
    const email = texto(b.email, 120).toLowerCase();
    const telefono = texto(b.telefono, 30).replace(/\D/g, '');
    const pedidoId = texto(b.pedidoId, 60).replace(/[^A-Za-z0-9_-]/g, '') || ('W' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
    const volver = paginaDeVuelta(b.event_source_url || b.pagina);

    const payer = { name: nombre, surname: apellido };
    if (emailValido(email)) payer.email = email;
    if (telefono.length >= 8) payer.phone = { area_code: '', number: telefono };

    const preferencia = {
      items: [{
        id: pedidoId,
        title: titulo,
        description: DESCRIPCION,
        category_id: 'others',
        quantity: 1,
        unit_price: precio,
        currency_id: 'ARS',
      }],
      payer,
      external_reference: pedidoId,
      statement_descriptor: NOMBRE_EN_RESUMEN,
      back_urls: {
        success: volver + '?pago=aprobado&pid=' + pedidoId,
        failure: volver + '?pago=rechazado&pid=' + pedidoId,
        pending: volver + '?pago=pendiente&pid=' + pedidoId,
      },
      auto_return: 'approved',
      metadata: { pagina: volver.replace(SITIO, ''), origen: 'worker-pago' },
    };

    const crear = (cuerpo) => fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + env.MP_ACCESS_TOKEN },
      body: JSON.stringify(cuerpo),
    });

    try {
      let mp = await crear(preferencia);
      // Si Mercado Pago no acepta algún campo opcional (la categoría, sobre todo), se reintenta sin él.
      if (mp.status === 400) {
        const sinOpcionales = JSON.parse(JSON.stringify(preferencia));
        delete sinOpcionales.items[0].category_id;
        delete sinOpcionales.statement_descriptor;
        delete sinOpcionales.metadata;
        mp = await crear(sinOpcionales);
      }
      const datos = await mp.json();
      const link = datos && datos.init_point;
      if (!mp.ok || typeof link !== 'string' || !link.startsWith('https://www.mercadopago.com')) {
        return responder(502, { error: 'No se pudo crear el pago.' }, origen);
      }
      return responder(200, { initPoint: link, pedidoId }, origen);
    } catch (e) {
      return responder(502, { error: 'No se pudo crear el pago.' }, origen);
    }
  },
};
