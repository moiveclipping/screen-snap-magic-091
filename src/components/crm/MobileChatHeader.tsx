import { ArrowLeft, Info } from "lucide-react";
import type { Lead } from "@/lib/crm/types";
import { Pill, temperatureTone } from "./badges";

export function MobileChatHeader({
  lead,
  onBack,
  onDetails,
}: {
  lead: Lead;
  onBack: () => void;
  onDetails: () => void;
}) {
  const open = lead.conversation_status.trim().toLowerCase().includes("active");

  return (
    <header className="shrink-0 border-b border-border bg-surface md:hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="-ml-1 rounded-lg p-2 text-muted-foreground hover:bg-surface-2"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {lead.full_name || lead.lead_id}
            </span>
            <span
              aria-hidden
              className={`size-2 shrink-0 rounded-full ${open ? "bg-primary" : "bg-muted-foreground/50"}`}
            />
          </div>
          <span className="block truncate text-[11px] text-muted-foreground">
            {lead.conversation_status || "No status"}
          </span>
        </div>
        <button
          onClick={onDetails}
          aria-label="Lead details"
          className="rounded-lg p-2 text-muted-foreground hover:bg-surface-2"
        >
          <Info className="size-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto px-3 pb-2.5">
        {lead.service && <Pill>{lead.service}</Pill>}
        {lead.conversation_status && <Pill>{lead.conversation_status}</Pill>}
        {lead.lead_temperature && (
          <Pill tone={temperatureTone(lead.lead_temperature)}>{lead.lead_temperature}</Pill>
        )}
        <button
          onClick={onDetails}
          className="ml-auto shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-[11px] font-medium text-primary"
        >
          View details
        </button>
      </div>
    </header>
  );
}
