import { cn } from "@/lib/utils";

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "hot" | "warm" | "cold" | "primary";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap",
        tone === "neutral" && "border-border bg-surface-2 text-muted-foreground",
        tone === "primary" && "border-primary/30 bg-primary/10 text-primary",
        tone === "hot" && "border-hot/30 bg-hot/10 text-hot",
        tone === "warm" && "border-warm/30 bg-warm/10 text-warm",
        tone === "cold" && "border-cold/30 bg-cold/10 text-cold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function temperatureTone(value: string) {
  const v = value.trim().toLowerCase();
  if (v.startsWith("hot")) return "hot" as const;
  if (v.startsWith("warm")) return "warm" as const;
  if (v.startsWith("cold")) return "cold" as const;
  return "neutral" as const;
}
