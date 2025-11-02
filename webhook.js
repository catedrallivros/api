// api/webhook.js
// Endpoint para receber notificações (webhooks) da LivePix.
// Configure na dashboard da LivePix apontando para:
// https://<seu-projeto>.vercel.app/api/webhook

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const payload = req.body;
    console.log('Webhook recebido:', JSON.stringify(payload));

    // Opcional: validar assinatura se a LivePix fornecer header de assinatura.
    // Ex: const sig = req.headers['x-livepix-signature'];

    // Aqui você poderia persistir em DB ou processar eventos específicos.
    // Neste exemplo, apenas respondemos 200 OK.
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erro webhook:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
