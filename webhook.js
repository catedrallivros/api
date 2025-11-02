// api/webhook.js
// Recebe notificações da LivePix. Recomenda-se validar assinatura se o LivePix fornecer header.

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const payload = req.body;
    console.log('LivePix webhook received:', JSON.stringify(payload));

    // Aqui você pode:
    // - salvar em DB (ex: supabase) que chargeId foi paga
    // - enviar e-mail
    // - acionar outra rotina
    // Neste exemplo, apenas devolvemos 200 OK.

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('webhook error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
