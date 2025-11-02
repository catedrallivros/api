export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { title, value } = req.body;
    const response = await fetch("https://api.livepix.gg/v1/charge", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LIVEPIX_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        value,
        correlationID: `livro-${Date.now()}`,
        comment: `Compra de ${title} - Catedral Livros`,
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar cobrança Pix" });
  }
}
