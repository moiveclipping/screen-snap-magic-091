import type { ChatMessage, Lead } from "./types";

/**
 * Data access layer for the CRM.
 * All network access to the Google Apps Script API lives here so UI components
 * never reference the endpoint directly.
 */

const BASE_API =
  process.env["CRM_API_URL"] ??
  "https://script.google.com/macros/s/AKfycbzSYqcCps5gnOiybJ2qAY-rZSxDsOyOi2kthVV5xc3wDkD1rKh5aGe3v9fX_P30g-ed/exec";

type Row = Record<string, unknown>;

async function apiGet(params: Record<string, string>): Promise<Row[]> {
  const url = new URL(BASE_API);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  // Apps Script intermittently answers its own redirect target with 404/429,
  // so retry a couple of times before surfacing a failure.
  let res: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(url.toString(), {
      redirect: "follow",
      headers: { accept: "application/json,text/plain,*/*" },
    });
    if (res.ok) break;
    if (attempt < 2) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  if (!res || !res.ok) throw new Error(`CRM API request failed (${res?.status ?? "no response"})`);

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("CRM API returned an unexpected response");
  }
  if (Array.isArray(data)) return data as Row[];
  if (data && typeof data === "object") {
    const maybe = (data as Record<string, unknown>)["data"];
    if (Array.isArray(maybe)) return maybe as Row[];
    const err = (data as Record<string, unknown>)["error"];
    if (err) throw new Error(String(err));
  }
  return [];
}

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

const val = (r: Row, ...keys: string[]) => {
  for (const k of keys) {
    const v = str(r[k]);
    if (v && v.toUpperCase() !== "NULL") return v;
  }
  return "";
};

/** Normalizes the various date shapes the sheet produces into an ISO string. */
function toIso(raw: string): string {
  if (!raw) return "";
  const direct = Date.parse(raw);
  if (!Number.isNaN(direct)) return new Date(direct).toISOString();

  // "19-09-2026 5:00 PM" or "21-09-2026/23:45"
  const m = raw.match(
    /^(\d{2})-(\d{2})-(\d{4})[\s/]*(\d{1,2})?:?(\d{2})?\s*(AM|PM)?$/i,
  );
  if (m) {
    const [, d, mo, y, hRaw, min, ap] = m;
    let h = Number(hRaw ?? "0");
    if (ap?.toUpperCase() === "PM" && h < 12) h += 12;
    if (ap?.toUpperCase() === "AM" && h === 12) h = 0;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d), h, Number(min ?? "0"));
    if (!Number.isNaN(dt.getTime())) return dt.toISOString();
  }
  return raw;
}

export async function getLeads(): Promise<Lead[]> {
  const rows = await apiGet({ action: "leads" });

  return rows
    .map((r) => {
      const lastUser = val(r, "Last User Message");
      const lastAi = val(r, "Last AI Message");
      const updated = toIso(val(r, "Updated At"));
      const created = toIso(val(r, "Created At"));

      return {
        lead_id: val(r, "Lead ID"),
        full_name: val(r, "Full Name"),
        email: val(r, "Email"),
        phone: val(r, "Phone"),
        service: val(r, "Service"),
        message: val(r, "Message"),
        source: val(r, "Source"),
        status: val(r, "Status"),
        telegram_chat_id: val(r, "Telegram Chat ID"),
        last_user_message: lastUser,
        last_ai_message: lastAi,
        conversation_status: val(r, "Conversation Status"),
        budget: val(r, "Budget"),
        timeline: val(r, "Timeline"),
        requirement: val(r, "Requirement"),
        lead_score: val(r, "Lead Score"),
        lead_temperature: val(r, "Lead Temperature"),
        followup_required: val(r, "Follow-up Required"),
        followup_count: val(r, "Follow-up Count"),
        last_followup: val(r, "Last Follow-up"),
        next_followup: val(r, "Next Follow-up"),
        created_at: created,
        updated_at: updated,
        appointment_datetime: val(r, "Appointment Datetime", "Appointment Date"),
        appointment_status: val(r, "Appointment Status"),
        calendar_event_id: val(r, "Calendar Event ID"),
        last_message_preview: lastAi || lastUser || val(r, "Message"),
        last_message_at: updated || created,
      } satisfies Lead;
    })
    .filter((l) => l.lead_id)
    .sort((a, b) => Date.parse(b.last_message_at || "") - Date.parse(a.last_message_at || "") || 0);
}

export async function getChatHistory(leadId: string): Promise<ChatMessage[]> {
  const rows = await apiGet({ action: "chat", lead_id: leadId });

  return rows
    .map((r) => ({
      message_id: val(r, "Message ID"),
      lead_id: val(r, "Lead ID"),
      chat_id: val(r, "Chat ID"),
      sender: val(r, "Sender"),
      message: val(r, "Message"),
      timestamp: toIso(val(r, "Timestamp")),
    }))
    .filter((m) => !leadId || m.lead_id === leadId)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

/** Kept for existing callers. */
export const getChat = getChatHistory;

// Ready for outbound messaging:
// export async function sendMessage(leadId: string, message: string) { ... }
