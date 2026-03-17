"use client";

import { cn } from "@/lib/utils";
import { DateRangeKey, DATE_RANGES } from "@/lib/analytics-data";

interface DateRangePickerProps {
  selected: DateRangeKey;
  onChange: (key: DateRangeKey) => void;
}

export function DateRangePicker({ selected, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center rounded-xl border border-border/40 bg-card p-1 gap-0.5">
      {DATE_RANGES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "rounded-lg px-4 py-1.5 text-[12px] font-semibold transition-all duration-150",
            selected === key
              ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
              : "text-muted-foreground/60 hover:bg-white/5 hover:text-muted-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
