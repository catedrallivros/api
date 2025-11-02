// api/create-charge.js
// Vercel serverless function - cria cobrança na LivePix
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { title, value } = req.body || {};
    if (!title || !value) return res.status(400).json({ error: 'title and value required' });

    // get token (either LIVEPIX_TOKEN or exchange client_id/secret)
    const token = await getAuthToken();

    // payload - adapte conforme a spec da LivePix se necessário
    const payload = {
      amount: Number(value),
      description: `Compra: ${title}`,
      // optional: callback_url: 'https://api-knvy.vercel.app/api/webhook'
    };

    const apiUrl = 'https://api.livepix.gg/v1/charges';
    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await r.json().catch(()=>null);
    if (!r.ok) return res.status(502).json({ error:'LivePix error', details: data || await r.text() });

    const chargeId = data.id || data.txid || data.reference || null;
    const qr_url = data.qr_code_url || data.qr || (data.qrcode && data.qrcode.image) || null;

    return res.status(200).json({ chargeId, qr_url, raw: data });
  } catch (err) {
    console.error('create-charge error', err);
    return res.status(500).json({ error: 'internal_error', message: err.message });
  }
}

async function getAuthToken(){
  if (process.env.LIVEPIX_TOKEN) return process.env.LIVEPIX_TOKEN;
  const id = process.env.LIVEPIX_CLIENT_ID;
  const secret = process.env.LIVEPIX_CLIENT_SECRET;
  if (!id || !secret) throw new Error('No LivePix credentials configured');

  const resp = await fetch('https://api.livepix.gg/v1/auth/token', {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ client_id: id, client_secret: secret, grant_type: 'client_credentials' })
  });
  if(!resp.ok) throw new Error('Failed to fetch token');
  const j = await resp.json();
  return j.access_token || j.token || j.accessToken;
}
