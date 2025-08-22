import "dotenv/config";
import express from "express";

import { Orchestrator } from "../orchestrator/Orchestrator";
import { Agent } from "../agents/Agent";
import { OpenAIProvider } from "../llm/OpenAIProvider";
import { ToolRegistry, demoContext } from "../tools/ToolRegistry";
import { sendWhatsApp } from "../tools/whatsapp";
import { faqLookup } from "../tools/faqDb";
import { scheduleReminder } from "../tools/reminders";
import { makeWhatsAppRouter } from "../adapters/whatsapp/router";
import { WakiliMessage } from "../types";

const llm = new OpenAIProvider();
const tools = new ToolRegistry([sendWhatsApp, faqLookup, scheduleReminder]);

const supportAgent = new Agent(
  {
    name: "Customer Support",
    systemPrompt: `You are a helpful, concise assistant for SMEs. You can use tools when appropriate.
If the user greets you, greet them back and offer help. If they mention 'remind', schedule a reminder.`,
    tools: tools.list(),
  },
  llm
);

const orchestrator = new Orchestrator([supportAgent], async (name, args) => {
  const result = await tools.run(name, args, demoContext);
  return result as any;
});

async function onMessage(msg: WakiliMessage) {
  const reply = await orchestrator.handleMessage(msg);
  // In production, map tool calls via function-calling.
  // For the starter, we just echo the reply.
  await demoContext.send(msg.from, reply);
}

const app = express();
app.use("/whatsapp", makeWhatsAppRouter(onMessage));
app.get("/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => console.log(`Wakili example running on :${port}`));
