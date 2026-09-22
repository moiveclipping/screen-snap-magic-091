import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ChatMessage, Lead } from "./types";

export const fetchLeads = createServerFn({ method: "GET" }).handler(
  async (): Promise<Lead[]> => {
    const { getLeads } = await import("./source.server");
    return getLeads();
  },
);

export const fetchChat = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ leadId: z.string() }).parse(d))
  .handler(async ({ data }): Promise<ChatMessage[]> => {
    const { getChat } = await import("./source.server");
    return getChat(data.leadId);
  });
