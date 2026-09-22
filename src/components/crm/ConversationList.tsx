import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/crm/types";
import { Pill, temperatureTone } from "./badges";

function shortTime(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "2-digit", month: "short" });
}

export function ConversationList({
  leads,
  isLoading,
  error,
  query,
  onQueryChange,
  selectedId,
  onSelect,
}: {
  leads: Lead[];
  isLoading: boolean;
  error?: string | undefined;
  query: string;
  onQueryChange: (v: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-border bg-surface md:w-[280px] lg:w-[340px]">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">Conversations</span>
          <span className="text-[11px] text-muted-foreground">{leads.length}</span>
        </div>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search name, phone, email, lead ID"
          className="mt-3 w-full rounded-lg border border-border bg-input px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground focus:border-ring/60 focus:ring-2 focus:ring-ring/25"
        />
      </div>

      <div className="scroll-slim flex-1 overflow-y-auto">
        {error && <p className="p-4 text-sm text-destructive">{error}</p>}
        {!error && isLoading && <p className="p-4 text-sm text-muted-foreground">Loading leads…</p>}
        {!error && !isLoading && leads.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
        )}

        {leads.map((lead) => {
          const active = lead.lead_id === selectedId;
          return (
            <button
              key={lead.lead_id}
              onClick={() => onSelect(lead.lead_id)}
              className={cn(
                "w-full border-b border-border/60 px-4 py-3 text-left transition-colors",
                active ? "bg-primary/10" : "hover:bg-surface-2",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "truncate text-[13.5px] font-semibold",
                    active ? "text-primary" : "text-foreground",
                  )}
                >
                  {lead.full_name || lead.lead_id}
                </span>
                <span className="shrink-0 text-[10.5px] text-muted-foreground">
                  {shortTime(lead.last_message_at)}
                </span>
              </div>
              <div className="truncate text-[11.5px] text-muted-foreground">{lead.service}</div>
              <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground/90">
                {lead.last_message_preview || "No messages yet"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lead.conversation_status && <Pill>{lead.conversation_status}</Pill>}
                {lead.lead_temperature && (
                  <Pill tone={temperatureTone(lead.lead_temperature)}>{lead.lead_temperature}</Pill>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
