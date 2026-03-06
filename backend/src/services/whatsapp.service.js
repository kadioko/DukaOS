/**
 * WhatsApp Order Message Service
 *
 * Generates ready-to-send WhatsApp messages for supplier orders.
 * These can be opened directly via the WhatsApp deep link (wa.me)
 * or sent programmatically via WhatsApp Business API / Twilio.
 */

function buildWhatsAppOrderMessage(order, shop) {
  const date = new Date(order.createdAt).toLocaleDateString("sw-TZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const itemLines = order.items
    .map((item) => {
      const name = item.product?.name || `Product #${item.productId.slice(-6)}`;
      const unit = item.product?.unit || "pcs";
      return `  • ${name}: *${item.quantity} ${unit}*`;
    })
    .join("\n");

  const total = order.totalAmount ? formatTZS(order.totalAmount) : "TBD";

  const message = [
    `🛒 *AGIZO JIPYA - ${shop.name}*`,
    `📅 Tarehe: ${date}`,
    `🔢 Nambari ya Agizo: #${order.id.slice(-8).toUpperCase()}`,
    ``,
    `*Bidhaa Zilizoagizwa:*`,
    itemLines,
    ``,
    `💰 Jumla ya Thamani: ${total}`,
    order.note ? `📝 Maelezo: ${order.note}` : null,
    ``,
    `📍 Mahali pa Biashara: ${shop.location}${shop.district ? `, ${shop.district}` : ""}`,
    ``,
    `Tafadhali thibitisha agizo hili. Asante! 🙏`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const encodedMessage = encodeURIComponent(message);
  const supplierPhone = order.supplier?.phone?.replace(/\D/g, "");
  const whatsappUrl = supplierPhone
    ? `https://wa.me/${supplierPhone}?text=${encodedMessage}`
    : null;

  return { message, whatsappUrl, supplierPhone: order.supplier?.phone };
}

function formatTZS(amount) {
  return `TZS ${Number(amount).toLocaleString("en-TZ")}`;
}

/**
 * Send order via WhatsApp Business Cloud API
 * Requires WHATSAPP_API_TOKEN and WHATSAPP_PHONE_ID env vars
 */
async function sendWhatsAppMessage(toPhone, message) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!apiUrl || !token || !phoneId) {
    // Not configured — return the deep link instead
    return { sent: false, reason: "WhatsApp API not configured" };
  }

  const normalizedPhone = toPhone.replace(/\D/g, "");

  const response = await fetch(`${apiUrl}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizedPhone,
      type: "text",
      text: { body: message },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`WhatsApp API error: ${err}`);
  }

  return { sent: true, data: await response.json() };
}

module.exports = { buildWhatsAppOrderMessage, sendWhatsAppMessage, formatTZS };
