export default async function handler(req, res) {
  try {
    const evento = req.body;
    console.log("📬 Webhook recebido:", evento);

    // Aqui você pode atualizar seu banco de dados, enviar e-mail, etc.
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: "Erro ao processar webhook" });
  }
}
