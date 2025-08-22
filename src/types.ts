export type Role = "user" | "assistant" | "system" | "tool";

export interface WakiliMessage {
  id: string;
  from: string; // user id / phone
  channel: "whatsapp" | "cli" | "web";
  text?: string;
  audioUrl?: string;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export interface ToolContext {
  send: (to: string, text: string) => Promise<void>;
  schedule: (to: string, text: string, when: Date) => Promise<void>;
  kv: {
    get: (k: string) => Promise<string | null>;
    set: (k: string, v: string, ttlSec?: number) => Promise<void>;
  };
}

export interface Tool {
  name: string;
  description: string;
  run: (args: Record<string, unknown>, ctx: ToolContext) => Promise<unknown>;
  schema?: Record<string, unknown>; // optional JSON schema for args
}

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  tools: Tool[];
}

export interface LlmProvider {
  chat: (
    messages: { role: Role; content: string; tool_call_id?: string }[],
    options?: { tools?: Tool[]; toolChoice?: string }
  ) => Promise<LlmResponse>;
}

export interface LlmToolCall {
  id: string;
  name: string;
  arguments: string; // JSON string
}

export interface LlmResponse {
  content?: string;
  toolCalls?: LlmToolCall[];
}
