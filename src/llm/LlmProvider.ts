import type { LlmProvider, Role } from "../types";

export abstract class BaseLlmProvider implements LlmProvider {
  abstract chat(
    messages: { role: Role; content: string; tool_call_id?: string }[],
    options?: { tools?: any[]; toolChoice?: string }
  ): Promise<{
    content?: string;
    toolCalls?: { id: string; name: string; arguments: string }[];
  }>;
}
