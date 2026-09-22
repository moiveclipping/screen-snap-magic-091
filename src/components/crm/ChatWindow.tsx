import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { isCustomer, type ChatMessage } from "@/lib/crm/types";

function formatTime(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}

export function ChatWindow({
  messages,
  isLoading,
  error,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string | undefined;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  let lastDay = "";

  return (
    <div className="scroll-slim flex-1 overflow-y-auto px-6 py-5">
      {error && (
        <p className="mx-auto max-w-md rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive-foreground">
          {error}
        </p>
      )}
      {!error && isLoading && (
        <p className="text-center text-sm text-muted-foreground">Loading conversation…</p>
      )}
      {!error && !isLoading && messages.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No messages yet
        </p>
      )}

      <div className="mx-auto flex max-w-3xl flex-col gap-2">
        {messages.map((m) => {
          const day = formatDay(m.timestamp);
          const showDay = day && day !== lastDay;
          lastDay = day || lastDay;
          const incoming = isCustomer(m.sender);

          return (
            <div key={m.message_id || `${m.timestamp}-${m.message}`}>
              {showDay && (
                <div className="my-4 flex justify-center">
                  <span className="rounded-full bg-surface-2 px-3 py-1 text-[11px] text-muted-foreground">
                    {day}
                  </span>
                </div>
              )}
              <div className={cn("flex", incoming ? "justify-start" : "justify-end")}>
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed shadow-panel",
                    incoming
                      ? "rounded-bl-md bg-bubble-in text-bubble-in-foreground"
                      : "rounded-br-md bg-bubble-out text-bubble-out-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.message}</p>
                  <div
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      incoming ? "text-muted-foreground" : "text-bubble-out-foreground/70",
                    )}
                  >
                    {formatTime(m.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
