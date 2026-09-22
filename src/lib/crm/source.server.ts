import type { ChatMessage, Lead } from "./types";

/**
 * Data access layer. Today it reads from published Google Sheet CSV endpoints
 * (set LEADS_SHEET_CSV_URL and CHAT_SHEET_CSV_URL). Swap the body of these two
 * functions to change the source without touching the UI.
 */

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

const normalize = (h: string) =>
  h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

async function fetchSheet(url: string | undefined): Promise<Record<string, string>[]> {
  if (!url) return [];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheet request failed (${res.status})`);
  const rows = parseCsv(await res.text());
  if (rows.length < 2) return [];
  const headers = (rows[0] ?? []).map(normalize);
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = (r[i] ?? "").trim()));
    return obj;
  });
}

const pick = (r: Record<string, string>, ...keys: string[]) => {
  for (const k of keys) if (r[k]) return r[k];
  return "";
};

export async function getLeads(): Promise<Lead[]> {
  const rows = await fetchSheet(process.env["LEADS_SHEET_CSV_URL"]);
  return rows
    .map((r) => {
      const lastUser = pick(r, "last_user_message");
      const lastAi = pick(r, "last_ai_message");
      return {
        lead_id: pick(r, "lead_id", "id"),
        full_name: pick(r, "full_name", "name"),
        email: pick(r, "email"),
        phone: pick(r, "phone"),
        service: pick(r, "service"),
        message: pick(r, "message"),
        source: pick(r, "source"),
        status: pick(r, "status"),
        telegram_chat_id: pick(r, "telegram_chat_id", "chat_id"),
        last_user_message: lastUser,
        last_ai_message: lastAi,
        conversation_status: pick(r, "conversation_status"),
        budget: pick(r, "budget"),
        timeline: pick(r, "timeline"),
        requirement: pick(r, "requirement"),
        lead_score: pick(r, "lead_score"),
        lead_temperature: pick(r, "lead_temperature"),
        followup_required: pick(r, "follow_up_required", "followup_required"),
        followup_count: pick(r, "follow_up_count", "followup_count"),
        last_followup: pick(r, "last_follow_up", "last_followup"),
        next_followup: pick(r, "next_follow_up", "next_followup"),
        created_at: pick(r, "created_at"),
        updated_at: pick(r, "updated_at"),
        appointment_datetime: pick(r, "appointment_datetime"),
        appointment_status: pick(r, "appointment_status"),
        calendar_event_id: pick(r, "calendar_event_id"),
        last_message_preview: lastAi || lastUser,
        last_message_at: pick(r, "updated_at", "created_at"),
      } satisfies Lead;
    })
    .filter((l) => l.lead_id);
}

export async function getChat(leadId: string): Promise<ChatMessage[]> {
  const rows = await fetchSheet(process.env["CHAT_SHEET_CSV_URL"]);
  return rows
    .map((r) => ({
      message_id: pick(r, "message_id", "id"),
      lead_id: pick(r, "lead_id"),
      chat_id: pick(r, "chat_id"),
      sender: pick(r, "sender"),
      message: pick(r, "message"),
      timestamp: pick(r, "timestamp"),
    }))
    .filter((m) => m.lead_id === leadId)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}
