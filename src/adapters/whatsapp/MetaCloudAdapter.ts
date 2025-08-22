import crypto from "crypto";
import fetch from "node-fetch"; // Node18 has global fetch; keep for edge runtimes if needed

export class MetaCloudAdapter {
  constructor(private pageAccessToken: string, private appSecret: string) {}

  verify(rawBody: string, signature?: string) {
    if (!signature) return false;
    const hmac = crypto
      .createHmac("sha256", this.appSecret)
      .update(rawBody)
      .digest("hex");
    return signature.replace("sha256=", "") === hmac;
  }

  async send(to: string, text: string) {
    const url = "https://graph.facebook.com/v21.0/me/messages";
    const res = await fetch(url + `?access_token=${this.pageAccessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`WhatsApp send failed: ${res.status} ${t}`);
    }
  }
}
