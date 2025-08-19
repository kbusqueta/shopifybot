import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// Variables d'environnement (on les configurera sur Render)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post("/shopify-webhook", async (req, res) => {
  const order = req.body;

  const message = `
🛒 Nouvelle commande Shopify !
👤 Client : ${order.customer?.first_name || "Inconnu"} ${order.customer?.last_name || ""}
💰 Total : ${order.total_price} ${order.currency}
📦 Produits : ${order.line_items.map(i => `${i.quantity} x ${i.name}`).join(", ")}
`;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message
    })
  });

  res.status(200).send("OK");
});

// Render utilise PORT automatiquement
const PORT = process.env.PORT || 3000;

// Route GET pour tester l'envoi Telegram sans Shopify
app.get("/test", async (req, res) => {
  try {
    const message = "🚀 Test direct depuis Render (sans Shopify)";
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });

    const data = await response.json();
    console.log("Résultat Telegram :", data);
    res.json(data);
  } catch (err) {
    console.error("Erreur :", err);
    res.status(500).send("Erreur lors de l'envoi");
  }
});

app.listen(PORT, () => console.log(`Webhook running on port ${PORT}`));
