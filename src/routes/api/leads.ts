import { createFileRoute } from "@tanstack/react-router";
import { getLeads } from "@/lib/crm/source.server";

export const Route = createFileRoute("/api/leads")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await getLeads());
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 502 });
        }
      },
    },
  },
});
