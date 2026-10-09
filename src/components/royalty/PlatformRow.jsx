import { useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * One streaming platform row: brand dot, name, per-stream rate
 * and the stream-count input.
 */
export default function PlatformRow({ platform, streams, onChange }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ backgroundColor: platform.color }}
      >
        {platform.initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{platform.name}</p>
        <p className="text-xs text-muted-foreground">${platform.rate.toFixed(4)} per stream</p>
      </div>
      <Input
        type="number"
        min="0"
        inputMode="numeric"
        value={streams}
        onChange={(e) => onChange(platform.id, e.target.value)}
        placeholder="0"
        className="w-32 text-right bg-secondary/60 border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}