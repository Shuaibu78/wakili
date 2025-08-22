import type { AgentConfig, LlmProvider, Role, Tool } from "../types";

export class Agent {
  name: string;
  systemPrompt: string;
  tools: Tool[];
  llm: LlmProvider;

  constructor(cfg: AgentConfig, llm: LlmProvider) {
    this.name = cfg.name;
    this.systemPrompt = cfg.systemPrompt;
    this.tools = cfg.tools;
    this.llm = llm;
  }

  async respond(
    userText: string,
    toolRunner: (
      name: string,
      args: any
    ) => Promise<{ result: any; tool_call_id?: string }>
  ): Promise<string> {
    const messages: { role: Role; content: string; tool_call_id?: string }[] = [
      { role: "system", content: this.systemPrompt },
      { role: "user", content: userText },
    ];

    let reply = await this.llm.chat(messages, { tools: this.tools });

    // iterate a few times in case of multi-step tools
    let safetyCounter = 0;
    while (reply.toolCalls && reply.toolCalls.length && safetyCounter < 4) {
      safetyCounter++;

      // Record that the assistant decided to use tools
      messages.push({ role: "assistant", content: "" });

      for (const tc of reply.toolCalls) {
        const parsed = tc.arguments ? JSON.parse(tc.arguments) : {};
        const { result } = await toolRunner(tc.name, parsed);
        messages.push({
          role: "tool",
          content: JSON.stringify(result),
          tool_call_id: tc.id,
        });
      }

      reply = await this.llm.chat(messages, { tools: this.tools });
    }

    return reply.content || "";
  }
}
