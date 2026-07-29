const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const MP_ACCESS_TOKEN = defineSecret('MP_ACCESS_TOKEN');
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

// A dónde llega el aviso de "se aprobó una venta". Cambiar si hace falta.
const ADMIN_EMAIL = 'productopg@gmail.com';
// Número de WhatsApp donde el cliente coordina el envío después de pagar.
const WA_NUMERO = '5491124838177';
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
    const pedidoSnap = await db.collection('pedidos').doc(pedidoId).get();
    if (!pedidoSnap.exists) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }
    const pedido = pedidoSnap.data();

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
 *
 * Cuando el pago se aprueba por primera vez, además:
 *  - le mandamos un email al cliente pidiéndole que coordine el envío
 *    (DNI + dirección) por WhatsApp, ya que el formulario de compra no las pide.
 *  - te avisamos a vos por email que hubo una venta nueva.
 *
 * Siempre respondemos 200 salvo notificaciones que no son de pago, para que
 * MercadoPago no reintente indefinidamente ante un error nuestro.
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

      const waMsg = encodeURIComponent(`Hola! Ya pagué mi pedido (${producto}). Te paso el comprobante y coordinamos el envío 📦`);
      const waLink = `https://wa.me/${WA_NUMERO}?text=${waMsg}`;

      if (pedido.email) {
        await enviarEmail({
          to: pedido.email,
          subject: '¡Confirmamos tu pago! Coordiná tu envío por WhatsApp 📦',
          html: `
            <p>Hola ${nombre}!</p>
            <p>Confirmamos el pago de tu pedido: <strong>${producto}</strong>.</p>
            <p>Para poder despacharlo necesitamos tu DNI y tu dirección de envío. Escribinos por WhatsApp y lo coordinamos:</p>
            <p><a href="${waLink}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Coordinar envío por WhatsApp</a></p>
            <p style="color:#888;font-size:13px;">Si el botón no funciona, copiá este link: ${waLink}</p>
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
            <li><strong>Producto:</strong> ${producto}</li>
            <li><strong>Teléfono:</strong> ${pedido.telefono || '—'}</li>
            <li><strong>Email:</strong> ${pedido.email || '—'}</li>
            <li><strong>ID de pedido:</strong> ${payment.external_reference}</li>
          </ul>
          <p>Le pedimos que coordine el envío por WhatsApp. Vas a verla en el panel admin apenas se complete.</p>
        `,
      });
    }

    res.status(200).send('ok');
  } catch (e) {
    logger.error('mpWebhook error', e);
    res.status(200).send('error-logged');
  }
});
