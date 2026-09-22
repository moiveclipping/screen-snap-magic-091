import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { fetchChat, fetchLeads } from "@/lib/crm/crm.functions";
import type { ChatMessage, Lead } from "@/lib/crm/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConversationList } from "@/components/crm/ConversationList";
import { ClientPanel } from "@/components/crm/ClientPanel";
import { ChatWindow } from "@/components/crm/ChatWindow";
import { Composer } from "@/components/crm/Composer";
import { MobileChatHeader } from "@/components/crm/MobileChatHeader";
import { DetailsDrawer } from "@/components/crm/DetailsDrawer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lead Desk — AI Follow-up CRM" },
      {
        name: "description",
        content:
          "Mobile-first dark CRM to review AI lead conversations, client details, follow-up status and appointments.",
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
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const leadsQuery = useQuery({
    queryKey: ["leads"],
    queryFn: () => getLeads(),
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });

  // Deduplicate by lead_id so repeated API records never render twice.
  const leads = useMemo(() => {
    const rows = leadsQuery.data ?? [];
    const byId = new Map<string, Lead>();
    for (const l of rows) byId.set(l.lead_id, l);
    return [...byId.values()];
  }, [leadsQuery.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.full_name, l.phone, l.email, l.lead_id].some((v) => v.toLowerCase().includes(q)),
    );
  }, [leads, query]);

  // Desktop auto-selects the first conversation; mobile starts on the list screen.
  useEffect(() => {
    if (!isMobile && !selectedId && filtered.length > 0) setSelectedId(filtered[0]!.lead_id);
  }, [filtered, selectedId, isMobile]);

  const selected = leads.find((l) => l.lead_id === selectedId) ?? null;
  const showChatScreen = isMobile ? !!selected : true;

  const chatQuery = useQuery({
    queryKey: ["chat", selectedId],
    queryFn: () => getChat({ data: { leadId: selectedId! } }),
    enabled: !!selectedId,
    refetchInterval: selectedId ? 5_000 : false,
    refetchIntervalInBackground: true,
  });

  // Deduplicate by message_id so refetches never render the same message twice.
  const messages = useMemo(() => {
    const rows = chatQuery.data ?? [];
    const byId = new Map<string, ChatMessage>();
    rows.forEach((m, i) => byId.set(m.message_id || `${i}-${m.timestamp}-${m.message}`, m));
    return [...byId.values()];
  }, [chatQuery.data]);

  const closeChat = () => {
    setDetailsOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      {(!isMobile || !showChatScreen) && (
        <ConversationList
          leads={filtered}
          isLoading={leadsQuery.isLoading}
          error={leadsQuery.error ? "Lead data source is not reachable." : undefined}
          query={query}
          onQueryChange={setQuery}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setDetailsOpen(false);
          }}
        />
      )}

      {showChatScreen && (
        <main className="flex min-w-0 flex-1 flex-col">
          {selected ? (
            <>
              <MobileChatHeader
                lead={selected}
                onBack={closeChat}
                onDetails={() => setDetailsOpen(true)}
              />
              <div className="hidden md:block">
                <ClientPanel lead={selected} />
              </div>
              <ChatWindow
                messages={chatQuery.data ?? []}
                isLoading={chatQuery.isLoading}
                error={chatQuery.error ? "Chat history could not be loaded." : undefined}
              />
              <Composer disabled />
              {detailsOpen && (
                <DetailsDrawer lead={selected} onClose={() => setDetailsOpen(false)} />
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-8 text-center">
              <div className="max-w-md">
                <h1 className="text-lg font-semibold">Lead Desk</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {leadsQuery.isLoading
                    ? "Loading conversations…"
                    : "Select a conversation to see the lead's details and chat history."}
                </p>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
