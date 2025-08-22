import type { Tool } from "../types";
import { z } from "zod";

export const scheduleReminder: Tool = {
  name: "schedule_reminder",
  description: "Schedule a reminder message at a given ISO time",
  async run(args, ctx) {
    const { to, text, when } = z
      .object({
        to: z.string(),
        text: z.string(),
        when: z.string(),
      })
      .parse(args);
    const date = new Date(when);
    await ctx.schedule(to, text, date);
    return { status: "scheduled", when };
  },
};
