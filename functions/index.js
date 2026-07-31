const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

const MP_ACCESS_TOKEN = defineSecret('MP_ACCESS_TOKEN');
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
const META_CAPI_TOKEN = defineSecret('META_CAPI_TOKEN');

// Mismo pixel que ya está instalado en las 3 landing pages.
const META_PIXEL_ID = '914585307701969';
// Para probar eventos en Meta Events Manager > Test Events sin mandar basura a
// producción: `firebase functions:secrets:set` no hace falta, alcanza con un
// env var de deploy (`--set-env-vars META_TEST_EVENT_CODE=TESTxxxxx`). Sacarlo
// una vez terminada la prueba.
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || null;

// A dónde llega el aviso de "se aprobó una venta". Cambiar si hace falta.
const ADMIN_EMAIL = 'productopg@gmail.com';
// Remitente de los emails. El dominio de Resend funciona sin configuración
// extra; para enviar desde un dominio propio (ej. pedidos@productoscapilarespg.com)
// hay que verificarlo en Resend y cambiar esta constante.
const FROM_EMAIL = 'Biotina PG <onboarding@resend.dev>';

// Dominios desde los que se permite llamar a crearPreferencia (la landing).
const ALLOWED_ORIGINS = [
  'https://productoscapilarespg.com',
  'https://www.productoscapilarespg.com',
];

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

// ─── META CONVERSIONS API ──────────────────────────────────────────────────
// Normalización + hasheo server-side según la spec de Meta (así el pixel del
// browser y el evento server-side hashean exactamente igual y matchean).
function sha256(value) {
  if (value === undefined || value === null || value === '') return undefined;
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

function normalizePhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return undefined;
  if (d.startsWith('54')) return d;
  d = d.replace(/^0+/, ''); // sacar el 0 de larga distancia
  return '54' + d;
}

// user: datos crudos (sin hashear) que llegan del cliente o de un pedido de Firestore.
// net: { ip, userAgent } — se capturan en el request más cercano a la acción real
// del usuario (nunca en el webhook de MercadoPago, que llega desde los servers de MP).
function buildUserData(user, net) {
  user = user || {};
  net = net || {};
  const ud = {};
  if (user.em) ud.em = sha256(user.em);
  if (user.ph) ud.ph = sha256(normalizePhone(user.ph));
  if (user.fn) ud.fn = sha256(user.fn);
  if (user.ln) ud.ln = sha256(user.ln);
  if (user.ct) ud.ct = sha256(String(user.ct).replace(/\s+/g, ''));
  if (user.st) ud.st = sha256(String(user.st).replace(/\s+/g, ''));
  if (user.zp) ud.zp = sha256(String(user.zp).replace(/\s+/g, ''));
  ud.country = sha256('ar');
  if (user.external_id) ud.external_id = sha256(user.external_id);
  if (user.fbp) ud.fbp = user.fbp;
  if (user.fbc) ud.fbc = user.fbc;
  if (net.ip) ud.client_ip_address = net.ip;
  if (net.userAgent) ud.client_user_agent = net.userAgent;
  return ud;
}

function ipFromRequest(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.ip || undefined;
}

async function sendToMetaCapi({ eventName, eventId, eventSourceUrl, userData, customData, eventTime }) {
  const payload = {
    data: [{
      event_name: eventName,
      event_time: eventTime || Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: eventSourceUrl,
      user_data: userData,
      custom_data: customData,
    }],
  };
  if (META_TEST_EVENT_CODE) payload.test_event_code = META_TEST_EVENT_CODE;

  const url = `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN.value()}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    logger.error('Error enviando evento a Meta CAPI', { eventName, eventId, status: resp.status, data });
  }
  return { ok: resp.ok, data };
}

/**
 * POST /capiEvent
 * body: { event_name, event_id, event_source_url, user_data: {em, ph, fn, ln, ct, st, zp, external_id, fbp, fbc}, custom_data }
 * Recibe eventos del pixel del cliente (PageView, ViewContent, AddToCart,
 * InitiateCheckout) y los reenvía a la Conversions API con los mismos
 * event_id que usa fbq() en el browser, para que Meta deduplique y suba el
 * Event Match Quality con datos que el browser no tiene (IP real, más
 * resistente a ad-blockers / Safari ITP).
 */
exports.capiEvent = onRequest({ secrets: [META_CAPI_TOKEN], region: 'us-central1' }, async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido.' }); return; }

  const { event_name, event_id, event_source_url, user_data, custom_data } = req.body || {};
  if (!event_name || !event_id) {
    res.status(400).json({ error: 'Faltan event_name/event_id.' });
    return;
  }

  try {
    const userData = buildUserData(user_data, { ip: ipFromRequest(req), userAgent: req.headers['user-agent'] });
    await sendToMetaCapi({
      eventName: event_name,
      eventId: event_id,
      eventSourceUrl: event_source_url,
      userData,
      customData: custom_data || {},
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    logger.error('capiEvent error', e);
    res.status(200).json({ ok: false }); // no bloquear al cliente por un error nuestro
  }
});

async function enviarEmail({ to, subject, html }) {
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY.value()}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });
    if (!resp.ok) {
      logger.error('Error enviando email', { to, subject, status: resp.status, body: await resp.text() });
    }
  } catch (e) {
    logger.error('enviarEmail error', e);
  }
}

// Mapeo de estado de pago de MercadoPago -> vocabulario interno del panel admin.
// `status` (Ventas Web) solo se toca cuando el pago se aprueba, para no pisar
// un estado que el admin haya cambiado a mano (contactado/cerrado, etc).
const FORM_STATUS_MAP = {
  approved:     'aprobado',
  rejected:     'rechazado',
  cancelled:    'rechazado',
  refunded:     'rechazado',
  charged_back: 'rechazado',
  pending:      'pendiente',
  in_process:   'pendiente',
  in_mediation: 'sinconfirmar',
};

/**
 * POST /crearPreferencia
 * body: { pedidoId, titulo, precio }
 * Crea una preferencia de pago en MercadoPago con external_reference = pedidoId,
 * para poder identificar el pedido exacto cuando llegue el webhook.
 */
exports.crearPreferencia = onRequest({ secrets: [MP_ACCESS_TOKEN], region: 'us-central1' }, async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido.' }); return; }

  const { pedidoId, titulo, precio } = req.body || {};
  if (!pedidoId || !precio) {
    res.status(400).json({ error: 'Faltan datos (pedidoId, precio).' });
    return;
  }

  try {
    const pedidoRef = db.collection('pedidos').doc(pedidoId);
    const pedidoSnap = await pedidoRef.get();
    if (!pedidoSnap.exists) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }
    const pedido = pedidoSnap.data();

    // Capturamos la IP/user-agent reales del comprador acá — es el request más
    // cercano a su acción real. El webhook de MercadoPago llega desde los
    // servers de MP, no del cliente, así que ahí no sirven para el Purchase CAPI.
    pedidoRef.update({ _ip: ipFromRequest(req), _ua: req.headers['user-agent'] || '' }).catch(() => {});

    const funcBase = `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;

    // Le pasamos a MercadoPago los datos que el cliente ya completó en el
    // formulario (nombre, email, teléfono, dirección) para que el checkout
    // llegue precargado en vez de pedírselos de nuevo.
    const preference = {
      items: [{
        title: titulo || 'Combo Biotina PG',
        quantity: 1,
        unit_price: Number(precio),
        currency_id: 'ARS',
      }],
      payer: {
        name: pedido.nombre || '',
        surname: pedido.apellido || '',
        email: pedido.email || '',
        ...(pedido.telefono ? { phone: { number: pedido.telefono } } : {}),
        ...((pedido.calle || pedido.cp) ? {
          address: {
            street_name: pedido.calle || '',
            street_number: pedido.numero || '',
            zip_code: pedido.cp || '',
          },
        } : {}),
      },
      external_reference: pedidoId,
      notification_url: `${funcBase}/mpWebhook`,
      back_urls: {
        success: `https://productoscapilarespg.com/?pago=aprobado&pid=${pedidoId}`,
        failure: `https://productoscapilarespg.com/?pago=rechazado&pid=${pedidoId}`,
        pending: `https://productoscapilarespg.com/?pago=pendiente&pid=${pedidoId}`,
      },
      auto_return: 'approved',
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN.value()}`,
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      logger.error('Error creando preferencia MP', mpData);
      res.status(502).json({ error: 'No se pudo crear el pago.' });
      return;
    }

    res.status(200).json({ initPoint: mpData.init_point });
  } catch (e) {
    logger.error('crearPreferencia error', e);
    res.status(500).json({ error: 'Error interno.' });
  }
});

/**
 * MercadoPago llama a esta URL (notification_url) cada vez que un pago cambia
 * de estado. Buscamos el pago completo por su ID, y con external_reference
 * (el ID del pedido en Firestore) actualizamos formStatus / status.
 *
 * Cuando el pago se aprueba por primera vez, además:
 *  - le mandamos un email de confirmación al cliente (ya tenemos su DNI y
 *    dirección completa desde el formulario, no hace falta pedirle nada más).
 *  - te avisamos a vos por email que hubo una venta nueva.
 *
 * Siempre respondemos 200 salvo notificaciones que no son de pago, para que
 * MercadoPago no reintente indefinidamente ante un error nuestro.
 *
 * NOTA: META_CAPI_TOKEN todavía no está en la lista de secrets a propósito —
 * así se puede deployar esta function (y crearPreferencia) con solo
 * MP_ACCESS_TOKEN configurado, sin bloquear el deploy por el secret de Meta
 * que todavía no existe. El bloque de Purchase CAPI de más abajo va a fallar
 * silenciosamente (queda logueado) hasta que se agregue META_CAPI_TOKEN acá
 * y se re-deploye — eso es la tarea 1 (Meta Conversions API).
 */
exports.mpWebhook = onRequest({ secrets: [MP_ACCESS_TOKEN, RESEND_API_KEY], region: 'us-central1' }, async (req, res) => {
  try {
    const topic = req.query.type || req.query.topic;
    const paymentId = req.query['data.id'] || req.query.id || (req.body && req.body.data && req.body.data.id);

    if (!paymentId || (topic && topic !== 'payment')) {
      res.status(200).send('ignored');
      return;
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN.value()}` },
    });
    const payment = await mpRes.json();

    if (!mpRes.ok || !payment.external_reference) {
      logger.warn('Pago sin external_reference o error MP', payment);
      res.status(200).send('no-ref');
      return;
    }

    const pedidoRef = db.collection('pedidos').doc(payment.external_reference);
    const pedidoSnap = await pedidoRef.get();
    if (!pedidoSnap.exists) {
      logger.warn('external_reference no coincide con ningún pedido', payment.external_reference);
      res.status(200).send('pedido-no-encontrado');
      return;
    }
    const pedido = pedidoSnap.data();

    const formStatus = FORM_STATUS_MAP[payment.status] || 'sinconfirmar';
    const update = {
      formStatus,
      mpPaymentId: payment.id,
      mpStatusDetail: payment.status_detail || '',
    };
    if (payment.status === 'approved') update.status = 'confirmado';

    await pedidoRef.update(update);

    // Solo mandamos los emails la primera vez que pasa a aprobado — evita
    // duplicados si MercadoPago reintenta la notificación del mismo pago.
    const yaEstabaAprobado = pedido.formStatus === 'aprobado';
    if (payment.status === 'approved' && !yaEstabaAprobado) {
      const nombre = pedido.nombre || '';
      const producto = pedido.producto || 'tu Combo Biotina';
      const dir = [`${pedido.calle || ''} ${pedido.numero || ''}`.trim(), pedido.localidad, pedido.provincia]
        .filter(Boolean).join(', ');

      if (pedido.email) {
        await enviarEmail({
          to: pedido.email,
          subject: '¡Confirmamos tu pago! 🎉',
          html: `
            <p>Hola ${nombre}!</p>
            <p>Confirmamos el pago de tu pedido: <strong>${producto}</strong>.</p>
            <p>Ya tenemos todos tus datos para el envío. Te vamos a avisar por WhatsApp cuando lo despachemos.</p>
          `,
        });
      }

      await enviarEmail({
        to: ADMIN_EMAIL,
        subject: `💰 Nueva venta aprobada — ${producto}`,
        html: `
          <p>Se aprobó un pago nuevo.</p>
          <ul>
            <li><strong>Cliente:</strong> ${nombre} ${pedido.apellido || ''}</li>
            <li><strong>DNI:</strong> ${pedido.dni || '—'}</li>
            <li><strong>Producto:</strong> ${producto}</li>
            <li><strong>Teléfono:</strong> ${pedido.telefono || '—'}</li>
            <li><strong>Email:</strong> ${pedido.email || '—'}</li>
            <li><strong>Dirección:</strong> ${dir || '—'}</li>
            <li><strong>ID de pedido:</strong> ${payment.external_reference}</li>
          </ul>
        `,
      });

      // Purchase por Conversions API — esta es la señal "de verdad" (server-side,
      // dispara siempre que el pago se aprueba de una, sin depender de que el
      // navegador del cliente vuelva a cargar la página de gracias, de
      // ad-blockers ni de Safari ITP). event_id = pedidoId: si el pixel del
      // browser también llega a disparar el mismo Purchase, Meta deduplica.
      try {
        await sendToMetaCapi({
          eventName: 'Purchase',
          eventId: payment.external_reference,
          eventSourceUrl: pedido.event_source_url || 'https://productoscapilarespg.com/',
          userData: buildUserData(
            {
              em: pedido.email, ph: pedido.telefono, fn: pedido.nombre, ln: pedido.apellido,
              ct: pedido.localidad, st: pedido.provincia, zp: pedido.cp, external_id: pedido.dni,
              fbp: pedido.fbp, fbc: pedido.fbc,
            },
            { ip: pedido._ip, userAgent: pedido._ua }
          ),
          customData: {
            currency: 'ARS',
            value: pedido.precio || 0,
            content_name: producto,
            content_type: 'product',
          },
          eventTime: payment.date_approved ? Math.floor(new Date(payment.date_approved).getTime() / 1000) : undefined,
        });
      } catch (e) {
        logger.error('Purchase CAPI error', e);
      }
    }

    res.status(200).send('ok');
  } catch (e) {
    logger.error('mpWebhook error', e);
    res.status(200).send('error-logged');
  }
});
