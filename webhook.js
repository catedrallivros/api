// api/webhook.js - recebe notificações do LivePix
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const payload = req.body;
    console.log('LivePix webhook:', JSON.stringify(payload));

    // opcional: validar assinatura se LivePix enviar header
    // ex: const sig = req.headers['x-livepix-signature'];

    // aqui você pode salvar em DB ou enviar notificação para o frontend
    // neste exemplo apenas retornamos 200 OK
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('webhook error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
