// api/create-charge.js
// Vercel serverless function
// - Recebe POST { title, value }
// - Cria cobrança na LivePix e retorna { chargeId, qr_url, expires_at, raw }

async function getAuthToken() {
  // Priorize token direto
  if (process.env.LIVEPIX_TOKEN) return process.env.LIVEPIX_TOKEN;

  // Se não tiver token direto, troque client_id/secret por token (basic example)
  const id = process.env.LIVEPIX_CLIENT_ID;
  const secret = process.env.LIVEPIX_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Nenhuma credencial LIVEPIX configurada.');

  const tokenResp = await fetch('https://api.livepix.gg/v1/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: id, client_secret: secret, grant_type: 'client_credentials' })
  });

  if (!tokenResp.ok) {
    const txt = await tokenResp.text();
    throw new Error('Erro ao obter token LivePix: ' + txt);
  }
  const tokenJson = await tokenResp.json();
  return tokenJson.access_token || tokenJson.token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { title, value } = req.body || {};
    if (!title || !value) return res.status(400).json({ error: 'title e value obrigatórios' });

    const token = await getAuthToken();

    // --- Ajuste payload conforme a spec real da LivePix se necessário ---
    // Exemplo genérico: cria cobrança com amount e description
    const payload = {
      amount: Number(value),
      description: `Compra: ${title}`,
      // opcional: callback_url (LivePix pode usar webhook configurado na dashboard)
      // metadata: { product: title }
    };

    const apiUrl = 'https://api.livepix.gg/v1/charges'; // ajuste se doc indicar outro endpoint

    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json().catch(() => null);
    if (!r.ok) {
      return res.status(502).json({ error: 'LivePix error', details: data || await r.text() });
    }

    // Extraia campos retornados (ajuste conforme resposta real)
    const chargeId = data.id || data.txid || data.charge_id || data.reference;
    const qr = data.qr_code_url || data.qr || (data.qrcode && data.qrcode.image) || null;

    return res.status(200).json({
      chargeId: chargeId || null,
      qr_url: qr || null,
      expires_at: data.expires_at || data.expires || null,
      raw: data
    });

  } catch (err) {
    console.error('create-charge error:', err);
    return res.status(500).json({ error: 'internal_error', message: err.message });
  }
}
