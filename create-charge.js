// api/create-charge.js
// Serverless function para Vercel: cria uma cobrança na LivePix e retorna txid e qr (ou qr_url).
// IMPORTANTE: ajuste payload/apiUrl conforme a documentação real da LivePix.

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { titulo, valor } = req.body || {};
    if (!titulo || !valor) return res.status(400).json({ error: 'titulo e valor obrigatórios' });

    const LIVEPIX_TOKEN = process.env.LIVEPIX_TOKEN;
    if (!LIVEPIX_TOKEN) return res.status(500).json({ error: 'LIVEPIX_TOKEN não configurado' });

    // --- Ajuste o payload conforme a spec da LivePix ---
    const payload = {
      amount: Number(valor),
      description: `Compra: ${titulo}`,
      // callback_url: 'https://<seu-projeto>.vercel.app/api/webhook' // opcional
      // metadata: { product: titulo }
    };

    // Exemplo de endpoint - ajuste conforme doc LivePix.
    const apiUrl = 'https://api.livepix.gg/v1/charges';

    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LIVEPIX_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'Erro LivePix', details: text });
    }

    const data = await r.json();

    // ATENÇÃO: adapte estes campos conforme o JSON real retornado pela LivePix.
    // Vamos retornar ao frontend: { txid, qr_code_url, expires_at, raw: data }
    const txid = data.txid || data.id || data.reference;
    const qr = data.qr_code || data.qr_code_url || data.qr || data.qrcode;

    return res.status(200).json({
      txid: txid || null,
      qr_code_url: qr || null,
      expires_at: data.expires_at || data.expires || null,
      raw: data
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno', details: err.message });
  }
};
