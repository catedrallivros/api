// api/check-status.js
// Consulta o status da cobrança na LivePix por txid.
// Retorna { paid: boolean, status: string, raw: {...} }

module.exports = async (req, res) => {
  try {
    const txid = req.query.txid || (req.body && req.body.txid);
    if (!txid) return res.status(400).json({ error: 'txid obrigatorio' });

    const LIVEPIX_TOKEN = process.env.LIVEPIX_TOKEN;
    if (!LIVEPIX_TOKEN) return res.status(500).json({ error: 'LIVEPIX_TOKEN não configurado' });

    // Endpoint de consulta (ajuste conforme a doc LivePix)
    const apiUrl = `https://api.livepix.gg/v1/charges/${encodeURIComponent(txid)}`;

    const r = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${LIVEPIX_TOKEN}` }
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'Erro LivePix', details: text });
    }

    const data = await r.json();

    // Interprete status conforme resposta real. Exemplos comuns: 'paid','confirmed','pending','expired'
    const status = (data.status || '').toString().toLowerCase();
    const paid = status === 'paid' || status === 'confirmed' || data.paid === true;

    return res.status(200).json({ paid, status, raw: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno', details: err.message });
  }
};
