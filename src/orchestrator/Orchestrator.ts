import type { WakiliMessage } from "../types";
import { Agent } from "../agents/Agent";

export class Orchestrator {
  agents: Agent[] = [];
  toolRunner?: (
    name: string,
    args: any
  ) => Promise<{ result: any; tool_call_id?: string }>;

  constructor(
    agents: Agent[],
    toolRunner?: (name: string, args: any) => Promise<{ result: any }>
  ) {
    this.agents = agents;
    if (toolRunner) {
      this.toolRunner = async (name, args) => ({
        result: await toolRunner(name, args),
      });
    }
  }

  selectAgent(_msg: WakiliMessage): Agent {
    return this.agents[0];
  }

  async handleMessage(msg: WakiliMessage): Promise<string> {
    const agent = this.selectAgent(msg);
    const runner = this.toolRunner || (async () => ({ result: null }));
    return agent.respond(msg.text ?? "", runner);
  }
}
