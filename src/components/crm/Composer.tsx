import { useState } from "react";

export function Composer({ disabled }: { disabled: boolean }) {
  const [value, setValue] = useState("");

  return (
    <div className="border-t border-border bg-surface px-6 py-4">
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <textarea
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Sending replies is not connected yet"
          className="scroll-slim max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring/60 focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          disabled
          title="Outbound messaging will be enabled with the messaging API"
          className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-[11px] text-muted-foreground">
        Read-only view. Outbound sending will be wired to the messaging API.
      </p>
    </div>
  );
}
