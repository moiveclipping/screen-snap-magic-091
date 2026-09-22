import { useState } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";

export function Composer({ disabled }: { disabled: boolean }) {
  const [value, setValue] = useState("");

  return (
    <div className="shrink-0 border-t border-border bg-surface px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:px-6 md:pb-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <button
          type="button"
          disabled
          aria-label="Attach file"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Paperclip className="size-[18px]" />
        </button>
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
          aria-label="Send message"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizontal className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}
