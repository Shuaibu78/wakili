import type { Tool, ToolContext } from "../types";

export class ToolRegistry {
  tools: Map<string, Tool> = new Map();
  constructor(tools: Tool[]) {
    tools.forEach((t) => this.tools.set(t.name, t));
  }
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }
  list(): Tool[] {
    return Array.from(this.tools.values());
  }
  async run(name: string, args: Record<string, unknown>, ctx: ToolContext) {
    const tool = this.get(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    return tool.run(args, ctx);
  }
}

// Minimal in-memory KV for demo
const mem = new Map<string, { v: string; exp?: number }>();
export const demoContext: ToolContext = {
  async send(to, text) {
    console.log(`[SEND → ${to}] ${text}`);
  },
  async schedule(to, text, when) {
    const delay = when.getTime() - Date.now();
    setTimeout(
      () => console.log(`[REMINDER → ${to}] ${text}`),
      Math.max(0, delay)
    );
  },
  kv: {
    async get(k) {
      const e = mem.get(k);
      return e ? e.v : null;
    },
    async set(k, v) {
      mem.set(k, { v });
    },
  },
};
