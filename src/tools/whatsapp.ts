import type { Tool } from "../types";
import { z } from "zod";

const schema = z.object({ to: z.string(), text: z.string().max(1000) });

export const sendWhatsApp: Tool = {
  name: "send_whatsapp",
  description: "Send a WhatsApp message to a recipient",
  async run(args, ctx) {
    const { to, text } = schema.parse(args);
    await ctx.send(to, text);
    return { status: "sent" };
  },
  schema,
};
