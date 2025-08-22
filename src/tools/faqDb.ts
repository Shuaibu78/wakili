import type { Tool } from "../types";
import { z } from "zod";

const KB: Record<string, string> = {
  hours: "We are open 9am-6pm Mon-Sat.",
  price: "Pricing varies. Ask for a quote.",
};

export const faqLookup: Tool = {
  name: "faq_lookup",
  description: "Simple in-memory FAQ lookup by key",
  async run(args) {
    const key = z.object({ key: z.string() }).parse(args).key.toLowerCase();
    return KB[key] ?? "I don't know that yet.";
  },
};
