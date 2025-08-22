import OpenAI from "openai";
import type { Role, Tool } from "../types";
import { BaseLlmProvider } from "./LlmProvider";

export class OpenAIProvider extends BaseLlmProvider {
  client: OpenAI;
  model: string;

  constructor(model = "gpt-4o-mini") {
    super();
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = model;
  }

  async chat(
    messages: { role: Role; content: string; tool_call_id?: string }[],
    options?: { tools?: Tool[]; toolChoice?: string }
  ): Promise<{
    content?: string;
    toolCalls?: { id: string; name: string; arguments: string }[];
  }> {
    const toolDefs =
      options?.tools?.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.schema ?? {
            type: "object",
            properties: {},
            additionalProperties: true,
          },
        },
      })) ?? undefined;

    const res = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as any,
      tools: toolDefs as any,
      tool_choice: options?.toolChoice as any,
      temperature: 0.2,
    });

    const msg = res.choices[0]?.message;
    const toolCalls = msg?.tool_calls?.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments ?? "{}",
    }));

    return {
      content: msg?.content ?? undefined,
      toolCalls: toolCalls && toolCalls.length ? toolCalls : undefined,
    };
  }
}
