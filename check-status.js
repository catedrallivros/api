// api/check-status.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { chargeId } = req.body || {};
    if (!chargeId) return res.status(400).json({ error: 'chargeId required' });

    const token = await getAuthToken();
    const url = `https://api.livepix.gg/v1/charges/${encodeURIComponent(chargeId)}`;

    const r = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }});
    const data = await r.json().catch(()=>null);
    if (!r.ok) return res.status(502).json({ error:'LivePix error', details: data || await r.text() });

    const status = (data.status || '').toString().toLowerCase();
    const paid = status === 'paid' || status === 'completed' || status === 'confirmed' || data.paid === true;

    return res.status(200).json({ paid, status, raw: data });
  } catch (err) {
    console.error('check-status error', err);
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
  const j = await resp.json();
  return j.access_token || j.token || j.accessToken;
}
