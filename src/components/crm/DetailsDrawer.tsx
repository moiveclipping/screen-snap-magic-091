import { useEffect } from "react";
import type { Lead } from "@/lib/crm/types";
import { Pill, temperatureTone } from "./badges";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-[13px] break-words">{value || "—"}</span>
    </div>
  );
}

export function DetailsDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:hidden">
      <button
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div className="scroll-slim relative max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border-t border-border bg-surface px-5 pb-8 pt-3 shadow-panel">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{lead.full_name || lead.lead_id}</h2>
            <p className="truncate text-xs text-muted-foreground">Lead {lead.lead_id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground"
          >
            Close
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {lead.lead_temperature && (
            <Pill tone={temperatureTone(lead.lead_temperature)}>{lead.lead_temperature}</Pill>
          )}
          {lead.status && <Pill tone="primary">{lead.status}</Pill>}
          {lead.conversation_status && <Pill>{lead.conversation_status}</Pill>}
        </div>

        <div className="mt-4">
          <Row label="Full name" value={lead.full_name} />
          <Row label="Phone" value={lead.phone} />
          <Row label="Email" value={lead.email} />
          <Row label="Lead ID" value={lead.lead_id} />
          <Row label="Service" value={lead.service} />
          <Row label="Source" value={lead.source} />
          <Row label="Status" value={lead.status} />
          <Row label="Conversation status" value={lead.conversation_status} />
          <Row label="Budget" value={lead.budget} />
          <Row label="Timeline" value={lead.timeline} />
          <Row label="Requirement" value={lead.requirement} />
          <Row label="Lead score" value={lead.lead_score} />
          <Row label="Lead temperature" value={lead.lead_temperature} />
          <Row label="Follow-up required" value={lead.followup_required} />
          <Row label="Follow-up count" value={lead.followup_count} />
          <Row label="Last follow-up" value={lead.last_followup} />
          <Row label="Next follow-up" value={lead.next_followup} />
          <Row label="Appointment" value={lead.appointment_datetime} />
          <Row label="Appointment status" value={lead.appointment_status} />
        </div>
      </div>
    </div>
  );
}
