/**
 * Cloudflare Worker — API de Conversiones de Meta
 *
 * Reemplaza a la Cloud Function de Google (us-central1-biotina-pg.cloudfunctions.net
 * /capiEvent), que quedó caída y devolvía error de CORS en cada carga del sitio.
 * Desde entonces la mitad server-side de los eventos no le llegaba a Meta.
 *
 * Qué hace:
 *   1. Recibe el evento que manda sendCapiEvent() desde las páginas de producto.
 *   2. Hashea los datos personales con SHA-256, como exige Meta.
 *   3. Agrega la IP y el user agent del visitante, que el navegador no puede
 *      mandar por su cuenta y mejoran bastante el matcheo.
 *   4. Lo reenvía a la API de Conversiones con el mismo event_id que usó el
 *      pixel del navegador, para que Meta deduplique en vez de contar doble.
 *
 * Para desplegarlo:
 *   - Pegar este archivo en un Worker nuevo de Cloudflare.
 *   - Cargar el token como variable secreta con el nombre META_ACCESS_TOKEN.
 *   - Copiar la URL del Worker y reemplazar CAPI_ENDPOINT en las 3 páginas.
 */

const PIXEL_ID = '914585307701969';
const API_VERSION = 'v21.0';

// Solo se aceptan llamadas desde el sitio. Si mañana cambia el dominio,
// agregarlo acá.
const ORIGENES_PERMITIDOS = [
  'https://productoscapilarespg.com',
  'https://www.productoscapilarespg.com',
];

// Campos de user_data que Meta exige hasheados.
const HASHEAR = ['em', 'ph', 'fn', 'ln', 'ct', 'st', 'zp', 'country', 'external_id'];
// Estos van en texto plano: son identificadores del propio Meta.
const SIN_HASHEAR = ['fbp', 'fbc'];

function cors(origen) {
  const permitido = ORIGENES_PERMITIDOS.includes(origen) ? origen : ORIGENES_PERMITIDOS[0];
  return {
    'Access-Control-Allow-Origin': permitido,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/** Meta pide normalizar antes de hashear, si no el matcheo falla. */
function normalizar(campo, valor) {
  let v = String(valor == null ? '' : valor).trim().toLowerCase();
  if (!v) return '';
  if (campo === 'ph') {
    // Solo dígitos. Si no trae el código de país, se asume Argentina.
    v = v.replace(/\D/g, '');
    if (v && !v.startsWith('54')) v = '54' + v.replace(/^0+/, '');
  }
  if (campo === 'zp') v = v.replace(/\s/g, '');
  if (campo === 'country') v = v.slice(0, 2);
  return v;
}

async function sha256(texto) {
  const datos = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const origen = request.headers.get('Origin') || '';
    const cabeceras = cors(origen);

    // El preflight es lo que fallaba antes y tiraba abajo todos los eventos.
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cabeceras });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: cabeceras });
    }
    if (!env.META_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: 'falta META_ACCESS_TOKEN' }), {
        status: 500, headers: { ...cabeceras, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try { body = await request.json(); }
    catch { return new Response(JSON.stringify({ error: 'json invalido' }), { status: 400, headers: { ...cabeceras, 'Content-Type': 'application/json' } }); }

    const entrada = body.user_data || {};
    const user_data = {};

    for (const campo of HASHEAR) {
      const v = normalizar(campo, entrada[campo]);
      if (v) user_data[campo] = await sha256(v);
    }
    for (const campo of SIN_HASHEAR) {
      if (entrada[campo]) user_data[campo] = entrada[campo];
    }

    // Esto es lo que el navegador no puede mandar y el server sí. Sube bastante
    // la calidad del matcheo, sobre todo en iPhone donde el pixel se bloquea.
    const ip = request.headers.get('CF-Connecting-IP');
    const ua = request.headers.get('User-Agent');
    if (ip) user_data.client_ip_address = ip;
    if (ua) user_data.client_user_agent = ua;

    const evento = {
      event_name: body.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.event_id,
      event_source_url: body.event_source_url,
      action_source: 'website',
      user_data,
      custom_data: body.custom_data || {},
    };

    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${env.META_ACCESS_TOKEN}`;

    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [evento] }),
      });
      const respuesta = await r.json();
      return new Response(JSON.stringify(respuesta), {
        status: r.ok ? 200 : 502,
        headers: { ...cabeceras, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      // Que falle el envío a Meta nunca debe romper el checkout del cliente.
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 200, headers: { ...cabeceras, 'Content-Type': 'application/json' },
      });
    }
  },
};
