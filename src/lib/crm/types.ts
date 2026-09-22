export type Lead = {
  lead_id: string;
  full_name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  source: string;
  status: string;
  telegram_chat_id: string;
  last_user_message: string;
  last_ai_message: string;
  conversation_status: string;
  budget: string;
  timeline: string;
  requirement: string;
  lead_score: string;
  lead_temperature: string;
  followup_required: string;
  followup_count: string;
  last_followup: string;
  next_followup: string;
  created_at: string;
  updated_at: string;
  appointment_datetime: string;
  appointment_status: string;
  calendar_event_id: string;
  last_message_preview: string;
  last_message_at: string;
};

export type ChatMessage = {
  message_id: string;
  lead_id: string;
  chat_id: string;
  sender: string;
  message: string;
  timestamp: string;
};

export const isCustomer = (sender: string) =>
  sender.trim().toLowerCase() === "customer";
