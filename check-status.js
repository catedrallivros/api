export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { chargeID } = req.body;

  try {
    const response = await fetch(`https://api.livepix.gg/v1/charge/${chargeID}`, {
      headers: {
        "Authorization": `Bearer ${process.env.LIVEPIX_TOKEN}`,
      },
    });

    const data = await response.json();
    const pago = data.status === "COMPLETED";
    res.status(200).json({ pago });
  } catch (error) {
    res.status(500).json({ error: "Erro ao verificar status do Pix" });
  }
}
