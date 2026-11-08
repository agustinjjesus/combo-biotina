/**
 * Cloudflare Worker: aviso de carrito al celular (ntfy)
 *
 * 08/11/2026. Agustín pidió "que ntfy me mande los datos también". Cada vez que alguien llena el formulario de compra
 * de la web, este Worker manda una notificación a su celular con nombre, WhatsApp, producto, monto y método de pago.
 * No depende del servidor propio (n8n en DigitalOcean): ese día la cuenta de DigitalOcean quedó suspendida y los carritos
 * que llegaron al formulario se perdieron, porque la web solo le avisaba a ese servidor.
 *
 * Qué hace:
 *   1. Recibe los mismos datos que la web le manda al servidor (avisarPedido()).
 *   2. Valida que vengan nombre y un teléfono razonable.
 *   3. Publica el aviso en ntfy. Al tocar la notificación se abre el chat de WhatsApp con la clienta.
 *
 * Para desplegarlo (5 minutos, sin costo):
 *   - dash.cloudflare.com > Workers y Pages > Crear > Worker nuevo. Nombre sugerido: biotina-aviso.
 *   - Implementar, entrar a "Editar código", reemplazar todo por este archivo e Implementar de nuevo.
 *   - En Configuración > Variables y secretos, agregar NTFY_TOPIC (tipo Secreto) con el tema de ntfy
 *     (el nombre largo al que está suscripto el celular; quien lo conozca puede leer los avisos).
 *   - Copiar la URL del Worker (termina en .workers.dev) y pasársela a Claude para conectarla en la web.
 */

const ORIGENES_PERMITIDOS = [
  'https://productoscapilarespg.com',
  'https://www.productoscapilarespg.com',
];

function cors(origen) {
  const permitido = ORIGENES_PERMITIDOS.includes(origen) ? origen : ORIGENES_PERMITIDOS[0];
  return {
    'Access-Control-Allow-Origin': permitido,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

const limpiar = (x, largo) => String(x == null ? '' : x).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, largo);

// Número argentino para wa.me: 549 + característica + número (igual que el panel).
function numeroWhatsApp(tel) {
  let wa = String(tel || '').replace(/\D/g, '').replace(/^0+/, '');
  if (wa.length < 8) return null;
  if (wa.startsWith('549')) return wa;
  if (wa.startsWith('54')) return '549' + wa.slice(2);
  return '549' + (wa.length > 10 ? wa.replace(/^(\d{2,4})15/, '$1') : wa);
}

export default {
  async fetch(request, env) {
    const origen = request.headers.get('Origin') || '';
    const cabeceras = cors(origen);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cabeceras });
    if (request.method !== 'POST') return new Response('Método no permitido', { status: 405, headers: cabeceras });
    if (origen && !ORIGENES_PERMITIDOS.includes(origen)) return new Response('Origen no permitido', { status: 403, headers: cabeceras });
    if (!env.NTFY_TOPIC) return new Response('Falta la variable NTFY_TOPIC', { status: 500, headers: cabeceras });

    // La web lo manda con sendBeacon como formulario (application/x-www-form-urlencoded); también se acepta JSON.
    let b = {};
    try {
      const tipo = request.headers.get('Content-Type') || '';
      if (tipo.includes('application/json')) b = await request.json();
      else b = Object.fromEntries(new URLSearchParams(await request.text()));
    } catch (e) {
      return new Response('Datos ilegibles', { status: 400, headers: cabeceras });
    }

    const nombre = [limpiar(b.nombre, 60), limpiar(b.apellido, 60)].filter(Boolean).join(' ');
    const telefono = limpiar(b.telefono, 30);
    const digitos = telefono.replace(/\D/g, '');
    if (!nombre || digitos.length < 8 || digitos.length > 15) return new Response('Datos incompletos', { status: 400, headers: cabeceras });

    const metodo = limpiar(b.metodo, 20) === 'transferencia' ? 'Transferencia' : 'Mercado Pago';
    const montoNum = Math.round(Number(b.monto) || 0);
    const monto = montoNum > 0 ? '$' + String(montoNum).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
    const producto = limpiar(b.producto, 120);
    const email = limpiar(b.email, 80);
    const pagina = limpiar(b.pagina, 80);

    const wa = numeroWhatsApp(telefono);
    const lineas = [producto, [monto, metodo].filter(Boolean).join(' · '), 'WhatsApp: ' + telefono];
    if (email) lineas.push('Email: ' + email);
    if (pagina) lineas.push('Página: ' + pagina);
    const aviso = { topic: String(env.NTFY_TOPIC).trim(), title: '🛒 Nuevo carrito: ' + nombre, message: lineas.filter(Boolean).join('\n'), priority: 4, tags: ['shopping_cart'] };
    if (wa) aviso.click = 'https://wa.me/' + wa;

    try {
      const r = await fetch('https://ntfy.sh/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(aviso) });
      if (!r.ok) return new Response('No se pudo avisar', { status: 502, headers: cabeceras });
      return new Response('ok', { status: 200, headers: cabeceras });
    } catch (e) {
      return new Response('No se pudo avisar', { status: 502, headers: cabeceras });
    }
  },
};
