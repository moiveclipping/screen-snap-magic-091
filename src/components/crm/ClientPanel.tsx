import type { Lead } from "@/lib/crm/types";
import { Pill, temperatureTone } from "./badges";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="truncate text-[13px] text-foreground" title={value || "—"}>
        {value || "—"}
      </div>
    </div>
  );
}

export function ClientPanel({ lead }: { lead: Lead }) {
  const initials = lead.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <header className="border-b border-border bg-surface px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
          {initials || "—"}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{lead.full_name || "Unnamed lead"}</h1>
          <p className="truncate text-xs text-muted-foreground">
            {lead.service || "No service"} · Lead {lead.lead_id}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {lead.lead_temperature && (
            <Pill tone={temperatureTone(lead.lead_temperature)}>{lead.lead_temperature}</Pill>
          )}
          {lead.status && <Pill tone="primary">{lead.status}</Pill>}
          {lead.conversation_status && <Pill>{lead.conversation_status}</Pill>}
          {lead.lead_score && <Pill>Score {lead.lead_score}</Pill>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4 xl:grid-cols-6">
        <Field label="Phone" value={lead.phone} />
        <Field label="Email" value={lead.email} />
        <Field label="Source" value={lead.source} />
        <Field label="Budget" value={lead.budget} />
        <Field label="Timeline" value={lead.timeline} />
        <Field label="Requirement" value={lead.requirement} />
        <Field label="Follow-up required" value={lead.followup_required} />
        <Field label="Follow-up count" value={lead.followup_count} />
        <Field label="Last follow-up" value={lead.last_followup} />
        <Field label="Next follow-up" value={lead.next_followup} />
        <Field label="Appointment" value={lead.appointment_datetime} />
        <Field label="Appointment status" value={lead.appointment_status} />
      </div>
    </header>
  );
}
