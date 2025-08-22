import express from "express";
import type { WakiliMessage } from "../../types";

export function makeWhatsAppRouter(
  handle: (msg: WakiliMessage) => Promise<void>
) {
  const router = express.Router();

  // Verification
  router.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"]; // subscribe
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];
    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  });

  router.post(
    "/webhook",
    express.json({
      verify: (req: any, _res, buf) => (req.rawBody = buf.toString()),
    }),
    async (req: any, res) => {
      try {
        const entry = req.body?.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages || [];
        for (const m of messages) {
          const msg: WakiliMessage = {
            id: m.id,
            from: m.from,
            channel: "whatsapp",
            text: m.text?.body,
            timestamp: Date.now(),
          };
          await handle(msg);
        }
        res.sendStatus(200);
      } catch (e) {
        console.error(e);
        res.sendStatus(500);
      }
    }
  );

  return router;
}
