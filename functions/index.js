const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const MP_ACCESS_TOKEN = defineSecret('MP_ACCESS_TOKEN');

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
    const pedidoSnap = await db.collection('pedidos').doc(pedidoId).get();
    if (!pedidoSnap.exists) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }

    const funcBase = `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;

    const preference = {
      items: [{
        title: titulo || 'Combo Biotina PG',
        quantity: 1,
        unit_price: Number(precio),
        currency_id: 'ARS',
      }],
      external_reference: pedidoId,
      notification_url: `${funcBase}/mpWebhook`,
      back_urls: {
        success: 'https://productoscapilarespg.com/?pago=aprobado',
        failure: 'https://productoscapilarespg.com/?pago=rechazado',
        pending: 'https://productoscapilarespg.com/?pago=pendiente',
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
 * Siempre respondemos 200 salvo notificaciones que no son de pago, para que
 * MercadoPago no reintente indefinidamente ante un error nuestro.
 */
exports.mpWebhook = onRequest({ secrets: [MP_ACCESS_TOKEN], region: 'us-central1' }, async (req, res) => {
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

    const formStatus = FORM_STATUS_MAP[payment.status] || 'sinconfirmar';
    const update = {
      formStatus,
      mpPaymentId: payment.id,
      mpStatusDetail: payment.status_detail || '',
    };
    if (payment.status === 'approved') update.status = 'confirmado';

    await db.collection('pedidos').doc(payment.external_reference).update(update);

    res.status(200).send('ok');
  } catch (e) {
    logger.error('mpWebhook error', e);
    res.status(200).send('error-logged');
  }
});
