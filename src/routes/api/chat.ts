import { createFileRoute } from "@tanstack/react-router";
import { getChat } from "@/lib/crm/source.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const leadId = new URL(request.url).searchParams.get("lead_id");
        if (!leadId) {
          return Response.json({ error: "lead_id is required" }, { status: 400 });
        }
        try {
          return Response.json(await getChat(leadId));
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 502 });
        }
      },
    },
  },
});
