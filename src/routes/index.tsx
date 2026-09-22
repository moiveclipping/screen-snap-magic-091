import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { fetchChat, fetchLeads } from "@/lib/crm/crm.functions";
import { ConversationList } from "@/components/crm/ConversationList";
import { ClientPanel } from "@/components/crm/ClientPanel";
import { ChatWindow } from "@/components/crm/ChatWindow";
import { Composer } from "@/components/crm/Composer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lead Desk — AI Follow-up CRM" },
      {
        name: "description",
        content:
          "Dark CRM workspace to review AI lead conversations, client details, follow-up status and appointments in one place.",
      },
      { property: "og:title", content: "Lead Desk — AI Follow-up CRM" },
      {
        property: "og:description",
        content:
          "Review AI lead conversations, client details, follow-up status and appointments in one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const getLeads = useServerFn(fetchLeads);
  const getChat = useServerFn(fetchChat);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const leadsQuery = useQuery({ queryKey: ["leads"], queryFn: () => getLeads() });
  const leads = leadsQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.full_name, l.phone, l.email, l.lead_id].some((v) => v.toLowerCase().includes(q)),
    );
  }, [leads, query]);

  useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0]!.lead_id);
  }, [filtered, selectedId]);

  const selected = leads.find((l) => l.lead_id === selectedId) ?? null;

  const chatQuery = useQuery({
    queryKey: ["chat", selectedId],
    queryFn: () => getChat({ data: { leadId: selectedId! } }),
    enabled: !!selectedId,
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ConversationList
        leads={filtered}
        isLoading={leadsQuery.isLoading}
        error={leadsQuery.error ? "Lead data source is not reachable." : undefined}
        query={query}
        onQueryChange={setQuery}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <ClientPanel lead={selected} />
            <ChatWindow
              messages={chatQuery.data ?? []}
              isLoading={chatQuery.isLoading}
              error={chatQuery.error ? "Chat history could not be loaded." : undefined}
            />
            <Composer disabled />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-8 text-center">
            <div className="max-w-md">
              <h1 className="text-lg font-semibold">Lead Desk</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {leadsQuery.isLoading
                  ? "Loading leads…"
                  : "Connect your lead sheet to start reviewing conversations. Select a conversation on the left once data is available."}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
